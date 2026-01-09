import { TransactionHistoriesSchemaType } from '../../../database/types';

export type TransactionHistoriesDataType = Omit<
	TransactionHistoriesSchemaType,
	'id' | 'publicId' | 'createdAt' | 'updatedAt'
>;

export type TransactionHistoriesReturnType = TransactionHistoriesDataType & {
	id: string;
};
