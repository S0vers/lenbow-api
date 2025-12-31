// In your schema file
import { relations } from 'drizzle-orm';
import { users } from './auth.model';
import { contacts } from './transactions.model';

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
