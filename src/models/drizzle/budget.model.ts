import {
	boolean,
	decimal,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { CurrencyData } from '../../app/currency/@types/currency.types';
import { timestamps } from '../../database/helpers';
import { users } from './auth.model';
import { budgetRecurrenceEnum, budgetTransactionTypeEnum } from './enum.model';
import { media } from './media.model';

export const budgetCategories = pgTable(
	'budget_categories',
	{
		id: serial('id').primaryKey(),
		publicId: uuid('public_id').defaultRandom().notNull().unique(),
		userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // null = system category
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull(),
		icon: varchar('icon', { length: 50 }),
		...timestamps,
	},
	table => [
		uniqueIndex('budget_categories_public_id_idx').on(table.publicId),
		uniqueIndex('budget_categories_user_id_slug_idx').on(table.userId, table.slug),
		index('budget_categories_user_id_idx').on(table.userId),
	],
);

export const budgetTransactions = pgTable(
	'budget_transactions',
	{
		id: serial('id').primaryKey(),
		publicId: uuid('public_id').defaultRandom().notNull().unique(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 255 }).notNull(),
		amount: decimal('amount', { precision: 10, scale: 2, mode: 'number' }).notNull(),
		type: budgetTransactionTypeEnum('type').notNull(),
		currency: jsonb('currency').$type<CurrencyData>().notNull().default({
			code: 'USD',
			name: 'US Dollar',
			symbol: '$',
		}),
		categoryId: integer('category_id').references(() => budgetCategories.id, { onDelete: 'set null' }),
		date: timestamp('date', { withTimezone: true }).notNull(),
		note: text('note'),
		details: text('details'),
		...timestamps,
	},
	table => [
		uniqueIndex('budget_transactions_public_id_idx').on(table.publicId),
		index('budget_transactions_user_id_idx').on(table.userId),
		index('budget_transactions_date_idx').on(table.date),
		index('budget_transactions_type_idx').on(table.type),
		index('budget_transactions_category_id_idx').on(table.categoryId),
	],
);

export const budgetTransactionReceipts = pgTable(
	'budget_transaction_receipts',
	{
		budgetTransactionId: integer('budget_transaction_id')
			.notNull()
			.references(() => budgetTransactions.id, { onDelete: 'cascade' }),
		mediaId: integer('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),
		...timestamps,
	},
	table => [
		primaryKey({ columns: [table.budgetTransactionId, table.mediaId] }),
		index('budget_transaction_receipts_budget_transaction_id_idx').on(table.budgetTransactionId),
		index('budget_transaction_receipts_media_id_idx').on(table.mediaId),
	],
);

export const budgetSubscriptions = pgTable(
	'budget_subscriptions',
	{
		id: serial('id').primaryKey(),
		publicId: uuid('public_id').defaultRandom().notNull().unique(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		categoryId: integer('category_id').references(() => budgetCategories.id, { onDelete: 'set null' }),
		amount: decimal('amount', { precision: 10, scale: 2, mode: 'number' }).notNull(),
		currency: jsonb('currency').$type<CurrencyData>().notNull().default({
			code: 'USD',
			name: 'US Dollar',
			symbol: '$',
		}),
		name: varchar('name', { length: 255 }).notNull(),
		recurrence: budgetRecurrenceEnum('recurrence').notNull(),
		nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull(),
		isActive: boolean('is_active').default(true).notNull(),
		...timestamps,
	},
	table => [
		uniqueIndex('budget_subscriptions_public_id_idx').on(table.publicId),
		index('budget_subscriptions_user_id_idx').on(table.userId),
		index('budget_subscriptions_next_run_at_idx').on(table.nextRunAt),
	],
);
