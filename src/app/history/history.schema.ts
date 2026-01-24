import z from 'zod';
import { baseQuerySchema, SortableField } from '../../core/validators/baseQuery.schema';
import { validateEnum, validateString } from '../../core/validators/commonRules';
import { transactionStatusEnum, transactionTypeEnum } from '../../models/drizzle/enum.model';

const TRANSACTION_HISTORY_SORTABLE_FIELDS: readonly SortableField[] = [
	{ name: 'id', queryName: 'id' },
	{ name: 'name', queryName: 'name' },
	{ name: 'email', queryName: 'email' },
	{ name: 'amount', queryName: 'amount' },
	{ name: 'status', queryName: 'status' },
	{ name: 'type', queryName: 'type' },
	{ name: 'requestDate', queryName: 'requestDate' },
	{ name: 'createdAt', queryName: 'createdAt' },
] as const;

export const transactionHistoryQuerySchema = baseQuerySchema(
	TRANSACTION_HISTORY_SORTABLE_FIELDS,
).extend({
	type: validateString('Type')
		.transform(val => {
			if (!val?.trim()) return [];
			return val
				.split(',')
				.map(v => v.trim())
				.filter(Boolean)
				.map(v => validateEnum('Type', transactionTypeEnum.enumValues).parse(v));
		})
		.optional(),
	status: validateString('Status')
		.transform(val => {
			if (!val?.trim()) return [];
			return val
				.split(',')
				.map(v => v.trim())
				.filter(Boolean)
				.map(v => validateEnum('Status', transactionStatusEnum.enumValues).parse(v));
		})
		.optional(),
});

export type TransactionHistoryQuerySchemaType = z.infer<typeof transactionHistoryQuerySchema>;
