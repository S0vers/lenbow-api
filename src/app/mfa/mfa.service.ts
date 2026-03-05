import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CryptoService } from '../../core/crypto/crypto.service';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import type { UserMfaSettingsSchemaType } from '../../database/types';
import { MfaTotpService } from './mfa-totp.service';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class MfaService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
		private readonly cryptoService: CryptoService,
		private readonly totpService: MfaTotpService,
	) {
		super(db);
	}

	async getUserMfaSettings(userId: number): Promise<UserMfaSettingsSchemaType | null> {
		const row = await this.getDb()
			.select()
			.from(schema.userMfaSettings)
			.where(eq(schema.userMfaSettings.userId, userId))
			.limit(1);
		return row[0] ?? null;
	}

	async isEnabled(userId: number): Promise<boolean> {
		const settings = await this.getUserMfaSettings(userId);
		return settings?.isEnabled ?? false;
	}

	async generateSetup(
		userId: number,
		email: string,
	): Promise<{ secret: string; uri: string; backupCodes: string[] }> {
		const secret = this.totpService.generateSecret();
		const backupCodes = this.totpService.generateBackupCodes();
		const label = `Lenbow (${email})`;
		const uri = this.totpService.generateUri(secret, label, 'Lenbow');

		const encryptedSecret = this.cryptoService.encrypt(secret);
		const encryptedBackupCodes = backupCodes.map(code => this.cryptoService.encrypt(code));

		const existing = await this.getUserMfaSettings(userId);
		if (existing) {
			await this.getDb()
				.update(schema.userMfaSettings)
				.set({
					totpSecret: encryptedSecret,
					backupCodes: encryptedBackupCodes,
					isEnabled: false,
					setupComplete: false,
					updatedAt: new Date(),
				})
				.where(eq(schema.userMfaSettings.userId, userId));
		} else {
			await this.getDb().insert(schema.userMfaSettings).values({
				userId,
				totpSecret: encryptedSecret,
				backupCodes: encryptedBackupCodes,
				isEnabled: false,
				setupComplete: false,
			});
		}

		return { secret, uri, backupCodes };
	}

	async verifyAndEnable(userId: number, token: string): Promise<void> {
		const settings = await this.getUserMfaSettings(userId);
		if (!settings?.totpSecret) throw new BadRequestException('MFA setup not found');

		const secret = this.cryptoService.decrypt(settings.totpSecret);
		if (!this.totpService.verifyToken(secret, token))
			throw new BadRequestException('Invalid verification token');

		await this.getDb()
			.update(schema.userMfaSettings)
			.set({
				isEnabled: true,
				setupComplete: true,
				enabledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.userMfaSettings.userId, userId));

		await this.getDb()
			.update(schema.users)
			.set({ is2faEnabled: true, updatedAt: new Date() })
			.where(eq(schema.users.id, userId));
	}

	async verifyToken(userId: number, token: string): Promise<boolean> {
		const settings = await this.getUserMfaSettings(userId);
		if (!settings?.isEnabled || !settings.totpSecret)
			throw new BadRequestException('MFA not enabled');

		if (settings.lockedUntil && settings.lockedUntil > new Date())
			throw new HttpException(
				'Account temporarily locked due to failed attempts',
				HttpStatus.TOO_MANY_REQUESTS,
			);

		const secret = this.cryptoService.decrypt(settings.totpSecret);
		const isValid = this.totpService.verifyToken(secret, token);

		if (isValid) {
			await this.getDb()
				.update(schema.userMfaSettings)
				.set({
					failedAttempts: 0,
					lockedUntil: null,
					lastTotpUsedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(schema.userMfaSettings.userId, userId));
			return true;
		}

		const newFailedAttempts = (settings.failedAttempts ?? 0) + 1;
		const updates: Partial<UserMfaSettingsSchemaType> = {
			failedAttempts: newFailedAttempts,
			updatedAt: new Date(),
		};
		if (newFailedAttempts >= LOCKOUT_ATTEMPTS)
			updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

		await this.getDb()
			.update(schema.userMfaSettings)
			.set(updates)
			.where(eq(schema.userMfaSettings.userId, userId));
		throw new BadRequestException('Invalid token');
	}

	async verifyBackupCode(userId: number, code: string): Promise<boolean> {
		const settings = await this.getUserMfaSettings(userId);
		if (!settings?.isEnabled || !settings.backupCodes?.length)
			throw new BadRequestException('MFA not enabled or no backup codes');

		const usedCodes = settings.usedBackupCodes ?? [];
		const encryptedCode = this.cryptoService.encrypt(code);
		if (usedCodes.includes(encryptedCode))
			throw new BadRequestException('Backup code already used');

		const isValidCode = settings.backupCodes.some(enc => {
			try {
				return this.cryptoService.decrypt(enc) === code;
			} catch {
				return false;
			}
		});
		if (!isValidCode) throw new BadRequestException('Invalid backup code');

		await this.getDb()
			.update(schema.userMfaSettings)
			.set({
				usedBackupCodes: [...usedCodes, encryptedCode],
				failedAttempts: 0,
				lockedUntil: null,
				updatedAt: new Date(),
			})
			.where(eq(schema.userMfaSettings.userId, userId));
		return true;
	}

	async disable(userId: number): Promise<void> {
		await this.getDb()
			.update(schema.userMfaSettings)
			.set({
				isEnabled: false,
				disabledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.userMfaSettings.userId, userId));

		await this.getDb()
			.update(schema.users)
			.set({ is2faEnabled: false, updatedAt: new Date() })
			.where(eq(schema.users.id, userId));
	}

	async generateNewBackupCodes(userId: number): Promise<string[]> {
		const settings = await this.getUserMfaSettings(userId);
		if (!settings?.isEnabled) throw new BadRequestException('MFA is not enabled');

		const backupCodes = this.totpService.generateBackupCodes();
		const encryptedBackupCodes = backupCodes.map(code => this.cryptoService.encrypt(code));

		await this.getDb()
			.update(schema.userMfaSettings)
			.set({
				backupCodes: encryptedBackupCodes,
				usedBackupCodes: [],
				lastBackupGeneration: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.userMfaSettings.userId, userId));

		return backupCodes;
	}
}
