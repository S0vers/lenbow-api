import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { type ContactSchemaType } from '../../database/types';
import { AuthService } from '../auth/auth.service';
import type { ConnectedContactList } from './@types/contacts.types';

@Injectable()
export class ContactsService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
		private readonly authService: AuthService,
	) {
		super(db);
	}
	async getOrCreateContactByPublicId(
		lenderId: string,
		borrowerId: number,
	): Promise<ContactSchemaType> {
		// Find user by public ID
		const lender = await this.authService.findUserByPublicId(lenderId);

		if (lender.id === borrowerId) {
			throw new BadRequestException('You cannot request a loan or borrow from yourself');
		}

		const getOrCreateContact = await this.getDb()
			.insert(schema.contacts)
			.values({
				connectedUserId: lender.id,
				requestedUserId: borrowerId,
			})
			.onConflictDoUpdate({
				target: [schema.contacts.connectedUserId, schema.contacts.requestedUserId],
				set: {
					connectedUserId: schema.contacts.connectedUserId, // no-op update
				},
			})
			.returning()
			.then(res => res[0]);

		if (!getOrCreateContact) throw new NotFoundException('Contact not found');

		return getOrCreateContact;
	}

	async getConnectedContacts(currentUserId: number): Promise<ConnectedContactList[]> {
		const results = await this.getDb()
			.select({
				userId: schema.users.publicId,
				name: schema.users.name,
				email: schema.users.email,
				image: schema.users.image,
				phone: schema.users.phone,
				connectedAt: schema.contacts.createdAt,
			})
			.from(schema.contacts)
			.innerJoin(
				schema.users,
				sql`${schema.users.id} = CASE
        WHEN ${schema.contacts.requestedUserId} = ${currentUserId}
        THEN ${schema.contacts.connectedUserId}
        ELSE ${schema.contacts.requestedUserId}
      END`,
			)
			.where(
				and(
					or(
						eq(schema.contacts.requestedUserId, currentUserId),
						eq(schema.contacts.connectedUserId, currentUserId),
					),
				),
			)
			.orderBy(desc(schema.contacts.createdAt));

		// Remove duplicates by userId (keep first occurrence = most recent)
		const seen = new Set<string>();
		return results.filter(contact => {
			if (seen.has(contact.userId)) {
				return false;
			}
			seen.add(contact.userId);
			return true;
		});
	}
}
