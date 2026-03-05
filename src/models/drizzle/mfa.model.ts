import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../database/helpers';
import { users } from './auth.model';

export const userMfaSettings = pgTable(
	'user_mfa_settings',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		// TOTP configuration
		totpSecret: text('totp_secret'),
		isEnabled: boolean('is_enabled').default(false).notNull(),
		setupComplete: boolean('setup_complete').default(false).notNull(),

		// Backup codes (encrypted)
		backupCodes: text('backup_codes').array(),
		usedBackupCodes: text('used_backup_codes').array().default([]),

		// Security tracking
		lastTotpUsedAt: timestamp('last_totp_used_at'),
		failedAttempts: integer('failed_attempts').default(0).notNull(),
		lockedUntil: timestamp('locked_until'),

		// Audit fields
		enabledAt: timestamp('enabled_at'),
		disabledAt: timestamp('disabled_at'),
		lastBackupGeneration: timestamp('last_backup_generation'),

		...timestamps,
	},
	table => [
		index('user_mfa_settings_user_id_idx').on(table.userId),
		index('user_mfa_settings_is_enabled_idx').on(table.isEnabled),
		index('user_mfa_settings_locked_until_idx').on(table.lockedUntil),
	],
);

