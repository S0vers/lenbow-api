import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
	ValidateTransactionDto,
	ValidateUpdateTransactionDto,
} from 'src/app/transactions/transactions.schema';
import { DATABASE_CONNECTION } from 'src/database/connection';
import schema from 'src/database/schema';
import DrizzleService from 'src/database/service';
import { TransactionSchemaType, TransactionStatusEnum } from 'src/database/types';

@Injectable()
export class TransactionsService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async createTransaction(data: ValidateTransactionDto): Promise<TransactionSchemaType> {
		const newTransaction = await this.getDb()
			.insert(schema.transactions)
			.values(data)
			.returning()
			.then(res => res[0]);

		return newTransaction;
	}

	async getTransactionById(id: number): Promise<TransactionSchemaType> {
		const transaction = await this.getDb().query.transactions.findFirst({
			where: eq(schema.transactions.id, id),
		});

		if (!transaction) throw new NotFoundException('Transaction not found');

		return transaction;
	}

	async getTransactionByPublicId(publicId: string): Promise<TransactionSchemaType> {
		const transaction = await this.getDb().query.transactions.findFirst({
			where: eq(schema.transactions.publicId, publicId),
		});

		if (!transaction) throw new NotFoundException('Transaction not found');

		return transaction;
	}

	async updateTransaction(
		id: number,
		data: ValidateUpdateTransactionDto,
	): Promise<TransactionSchemaType> {
		const updatedTransaction = await this.getDb()
			.update(schema.transactions)
			.set(data)
			.where(eq(schema.transactions.id, id))
			.returning()
			.then(res => res[0]);
		return updatedTransaction;
	}

	async updateTransactionPaidAmount(
		id: number,
		amountPaid: number,
	): Promise<TransactionSchemaType> {
		const updatedTransaction = await this.getDb()
			.update(schema.transactions)
			.set({ amountPaid })
			.where(eq(schema.transactions.id, id))
			.returning()
			.then(res => res[0]);
		return updatedTransaction;
	}

	checkEligibilityForUpdatingStatus(
		data: TransactionSchemaType,
		status: TransactionStatusEnum,
	): boolean {
		const currentStatus = data.status;

		// If status is rejected, it cannot be changed
		if (currentStatus === 'rejected') {
			return false;
		}

		// If status is completed, it cannot be changed
		if (currentStatus === 'completed') {
			return false;
		}

		// If status is pending, it can be changed to anything
		if (currentStatus === 'pending') {
			return true;
		}

		// If status is accepted, it can be changed to anything except pending and rejected
		if (currentStatus === 'accepted') {
			return status !== 'pending' && status !== 'rejected';
		}

		// If status is partially_paid, it can only be changed to completed
		if (currentStatus === 'partially_paid') {
			return status === 'completed';
		}

		return false;
	}

	async updateTransactionStatus(
		id: number,
		status: TransactionStatusEnum,
	): Promise<TransactionSchemaType> {
		const updatedTransaction = await this.getDb()
			.update(schema.transactions)
			.set({ status })
			.where(eq(schema.transactions.id, id))
			.returning()
			.then(res => res[0]);
		return updatedTransaction;
	}

	async deleteTransaction(id: number): Promise<string> {
		await this.getDb().delete(schema.transactions).where(eq(schema.transactions.id, id));
		return 'Transaction deleted successfully';
	}
}
