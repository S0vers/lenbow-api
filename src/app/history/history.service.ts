import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { TransactionOldHistoriesDataType } from './@types/history.types';

@Injectable()
export class HistoryService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async createTransactionHistoryRecord(data: TransactionOldHistoriesDataType) {
		const result = await this.getDb()
			.insert(schema.transactionOldHistories)
			.values(data)
			.returning()
			.then(res => res[0]);
		return result;
	}

	async getTransactionHistory() {}
}
