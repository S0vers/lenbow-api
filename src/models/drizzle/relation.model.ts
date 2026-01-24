// In your schema file
import { relations } from 'drizzle-orm';
import { users } from './auth.model';
import { transactionOldHistories } from './history.model';
import { contacts, transactions } from './transactions.model';

export const usersRelations = relations(users, ({ many }) => ({
	requestedContacts: many(contacts, { relationName: 'requested' }),
	connectedContacts: many(contacts, { relationName: 'connected' }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
	requestedUser: one(users, {
		fields: [contacts.requestedUserId],
		references: [users.id],
		relationName: 'requested',
	}),
	connectedUser: one(users, {
		fields: [contacts.connectedUserId],
		references: [users.id],
		relationName: 'connected',
	}),
}));

export const usersHistoryRelations = relations(users, ({ many }) => ({
	histories: many(transactionOldHistories),
}));

export const transactionsRelations = relations(transactions, ({ many }) => ({
	histories: many(transactionOldHistories),
}));

export const transactionOldHistoriesRelations = relations(transactionOldHistories, ({ one }) => ({
	transaction: one(transactions, {
		fields: [transactionOldHistories.transactionId],
		references: [transactions.id],
	}),
	actor: one(users, {
		fields: [transactionOldHistories.actorUserId],
		references: [users.id],
	}),
}));
