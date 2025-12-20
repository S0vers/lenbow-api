import { TransactionSchemaType } from 'src/database/types';

export type TransactionReturnType = Omit<
	TransactionSchemaType,
	'id' | 'publicId' | 'createdAt' | 'updatedAt'
> & {
	id: string;
};
