import { TransactionOldHistoriesSchemaType } from '../../../database/types';

export type TransactionOldHistoriesDataType = Omit<
	TransactionOldHistoriesSchemaType,
	'id' | 'publicId' | 'createdAt' | 'updatedAt'
>;

export type TransactionOldHistoriesReturnType = TransactionOldHistoriesDataType & {
	id: string;
};
