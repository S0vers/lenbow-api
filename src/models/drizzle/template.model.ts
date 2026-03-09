import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../../database/helpers';
import { users } from './auth.model';

export const emailTemplates = pgTable(
	'email_templates',
	{
		id: serial('id').primaryKey(),

		// Logical template key used by your app
		key: varchar('key', { length: 100 }).notNull(), // e.g. "otp", "reset_password"

		// Increment when you change template (optional but recommended)
		version: integer('version').notNull().default(1),

		// Optional metadata
		name: varchar('name', { length: 200 }),
		description: text('description'),

		// Email parts
		subject: text('subject').notNull(), // e.g. "Your OTP code"
		html: text('html').notNull(), // handlebars HTML
		text: text('text'), // optional text version

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	t => ({
		// ensures you don't have two templates with same key+version
		keyVersionUnique: uniqueIndex('email_templates_key_version_uq').on(t.key, t.version),
	}),
);

export const workspaceEmailTemplates = pgTable(
	'workspace_email_templates',
	{
		id: serial('id').primaryKey(),
		publicId: uuid('public_id').defaultRandom().notNull().unique(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		name: varchar('name', { length: 200 }).notNull(),
		subject: text('subject').notNull(),
		description: text('description'),

		type: varchar('type', { length: 20 }).notNull(), // "builder" | "raw_html"

		// Builder blocks (JSON structure validated at the application layer)
		blocks: jsonb('blocks'),

		// Raw HTML template content
		html: text('html'),
		css: text('css'),

		isDefault: boolean('is_default').notNull().default(false),
		category: varchar('category', { length: 64 }),
		lastSentAt: timestamp('last_sent_at', { withTimezone: true }),

		...timestamps,
	},
	table => ({
		workspaceEmailTemplatesPublicIdIdx: uniqueIndex(
			'workspace_email_templates_public_id_idx',
		).on(table.publicId),
		workspaceEmailTemplatesUserIdIdx: index('workspace_email_templates_user_id_idx').on(
			table.userId,
		),
	}),
);
