import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import type { UserWithoutPassword } from '../auth/@types/auth.types';
import { AuthSession } from '../auth/auth.session';
import { MfaService } from './mfa.service';
import {
	mfaDisableSchema,
	mfaVerifyLoginSchema,
	mfaVerifySetupSchema,
} from './mfa.schema';

@Controller('mfa')
export class MfaController {
	constructor(
		private readonly mfaService: MfaService,
		private readonly authService: AuthService,
		private readonly authSession: AuthSession,
	) {}

	@UseGuards(JwtAuthGuard)
	@Get('status')
	async getStatus(@Request() req: ExpressRequest): Promise<
		ApiResponse<{ enabled: boolean; setupComplete: boolean; backupCodesRemaining: number }>
	> {
		const user = req.user as UserWithoutPassword;
		const userId = Number(user.id);
		const settings = await this.mfaService.getUserMfaSettings(userId);
		const backupCodesRemaining = settings?.backupCodes?.length ?? 0;
		const usedCount = settings?.usedBackupCodes?.length ?? 0;
		return createApiResponse(HttpStatus.OK, 'MFA status retrieved', {
			enabled: settings?.isEnabled ?? false,
			setupComplete: settings?.setupComplete ?? false,
			backupCodesRemaining: backupCodesRemaining - usedCount,
		});
	}

	@UseGuards(JwtAuthGuard)
	@Post('setup')
	async setup(@Request() req: ExpressRequest): Promise<
		ApiResponse<{ secret: string; uri: string; backupCodes: string[] }>
	> {
		const user = req.user as UserWithoutPassword;
		const userId = Number(user.id);
		const data = await this.mfaService.generateSetup(userId, user.email);
		return createApiResponse(HttpStatus.OK, 'MFA setup generated', data);
	}

	@UseGuards(JwtAuthGuard)
	@Post('setup/verify')
	async verifySetup(
		@Request() req: ExpressRequest,
		@Body() body: unknown,
	): Promise<ApiResponse<null>> {
		const parsed = mfaVerifySetupSchema.safeParse(body);
		if (!parsed.success)
			throw new BadRequestException(
				parsed.error.issues.map(i => i.message).join(', '),
			);
		const user = req.user as UserWithoutPassword;
		await this.mfaService.verifyAndEnable(Number(user.id), parsed.data.token);
		return createApiResponse(HttpStatus.OK, 'MFA enabled successfully', null);
	}

	@Post('verify')
	async verify(
		@Request() req: ExpressRequest,
		@Body() body: unknown,
	): Promise<ApiResponse<{ verified: boolean }>> {
		const parsed = mfaVerifyLoginSchema.safeParse(body);
		if (!parsed.success)
			throw new BadRequestException(
				parsed.error.issues.map(i => i.message).join(', '),
			);
		const { userId, token } = parsed.data;
		const sessionToken = req.cookies?.['access-token'] as string | undefined;

		if (!sessionToken) {
			throw new BadRequestException('No active session found for MFA verification');
		}

		try {
			await this.mfaService.verifyToken(userId, token);
			await this.authSession.markSessionTwoFactorVerified(userId, sessionToken);
			return createApiResponse(HttpStatus.OK, 'Token verified', { verified: true });
		} catch {
			if (token.includes('-')) {
				try {
					await this.mfaService.verifyBackupCode(userId, token);
					await this.authSession.markSessionTwoFactorVerified(userId, sessionToken);
					return createApiResponse(HttpStatus.OK, 'Backup code verified', {
						verified: true,
					});
				} catch {
					throw new BadRequestException('Invalid MFA token or backup code');
				}
			}
			throw new BadRequestException('Invalid MFA token');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post('disable')
	async disable(
		@Request() req: ExpressRequest,
		@Body() body: unknown,
	): Promise<ApiResponse<null>> {
		const parsed = mfaDisableSchema.safeParse(body);
		if (!parsed.success)
			throw new BadRequestException(
				parsed.error.issues.map(i => i.message).join(', '),
			);
		const user = req.user as UserWithoutPassword;
		const userId = Number(user.id);
		await this.authService.validateUser({
			email: user.email,
			password: parsed.data.password,
		});
		await this.mfaService.disable(userId);
		return createApiResponse(HttpStatus.OK, 'MFA disabled successfully', null);
	}

	@UseGuards(JwtAuthGuard)
	@Post('backup-codes')
	async backupCodes(@Request() req: ExpressRequest): Promise<
		ApiResponse<{ backupCodes: string[] }>
	> {
		const user = req.user as UserWithoutPassword;
		const codes = await this.mfaService.generateNewBackupCodes(Number(user.id));
		return createApiResponse(HttpStatus.OK, 'New backup codes generated', {
			backupCodes: codes,
		});
	}
}
