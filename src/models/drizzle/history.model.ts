import {
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { TransactionReturnType } from '../../app/transactions/@types/transactions.types';
import { timestamps } from '../../database/helpers';
import { users } from './auth.model';
import { transactionHistoryActionEnum } from './enum.model';
import { transactions } from './transactions.model';

export const transactionHistories = pgTable(
	'transaction_histories',
	{
		id: serial('id').primaryKey(),
		publicId: uuid('public_id').defaultRandom().notNull().unique(),
		transactionId: integer('transaction_id').references(() => transactions.id, {
			onDelete: 'set null',
		}),
		actorUserId: integer('actor_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		action: transactionHistoryActionEnum('action').notNull(),
		details: jsonb('details').$type<TransactionReturnType>().notNull(),
		occurredAt: timestamp('occurred_at').defaultNow().notNull(),
		...timestamps,
	},
	table => [
		uniqueIndex('transaction_histories_public_id_idx').on(table.publicId),
		index('transaction_histories_transaction_id_idx').on(table.transactionId),
		index('transaction_histories_actor_user_id_idx').on(table.actorUserId),
		index('transaction_histories_action_idx').on(table.action),
		index('transaction_histories_occurred_at_idx').on(table.occurredAt),
	],
);
