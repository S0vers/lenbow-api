import z from 'zod';
import { baseQuerySchema, SortableField } from '../../core/validators/baseQuery.schema';
import { validateDate, validateEnum, validateString } from '../../core/validators/commonRules';
import { budgetTransactionTypeEnum } from '../../models/drizzle/enum.model';

const BUDGET_TRANSACTION_SORTABLE_FIELDS: readonly SortableField[] = [
	{ name: 'date', queryName: 'date' },
	{ name: 'amount', queryName: 'amount' },
	{ name: 'name', queryName: 'name' },
	{ name: 'type', queryName: 'type' },
	{ name: 'createdAt', queryName: 'createdAt' },
] as const;

const currencySchema = z
	.object({
		code: z.string(),
		name: z.string(),
		symbol: z.string(),
	})
	.optional();

export const budgetTransactionQuerySchema = baseQuerySchema(
	BUDGET_TRANSACTION_SORTABLE_FIELDS,
).extend({
	type: validateString('Type')
		.transform(val => {
			if (!val?.trim()) return undefined;
			const v = val.trim().toLowerCase();
			if (v === 'in' || v === 'out') return v;
			return undefined;
		})
		.optional(),
	categoryId: validateString('Category ID').optional(),
});

export const createBudgetTransactionSchema = z.object({
	name: validateString('Name', { min: 1, max: 255 }),
	amount: z.coerce.number().positive('Amount must be positive'),
	type: validateEnum('Type', budgetTransactionTypeEnum.enumValues),
	currency: currencySchema,
	categoryId: z.string().uuid().optional().nullable(),
	date: validateDate('Date'),
	note: validateString('Note').optional().nullable(),
	details: validateString('Details').optional().nullable(),
});

export const updateBudgetTransactionSchema = createBudgetTransactionSchema.partial();

export type BudgetTransactionQuerySchemaType = z.infer<typeof budgetTransactionQuerySchema>;
export type CreateBudgetTransactionDto = z.infer<typeof createBudgetTransactionSchema>;
export type UpdateBudgetTransactionDto = z.infer<typeof updateBudgetTransactionSchema>;
