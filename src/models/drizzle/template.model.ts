import {
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

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
