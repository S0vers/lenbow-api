import z from 'zod';
import { validateDate, validateEnum, validateString } from '../../core/validators/commonRules';
import { budgetRecurrenceEnum } from '../../models/drizzle/enum.model';

const currencySchema = z
	.object({
		code: z.string(),
		name: z.string(),
		symbol: z.string(),
	})
	.optional();

export const createBudgetSubscriptionSchema = z.object({
	name: validateString('Name', { min: 1, max: 255 }),
	amount: z.coerce.number().positive('Amount must be positive'),
	currency: currencySchema,
	categoryId: z.string().uuid().optional().nullable(),
	recurrence: validateEnum('Recurrence', budgetRecurrenceEnum.enumValues),
	nextRunAt: validateDate('Next run at'),
});

export const updateBudgetSubscriptionSchema = z.object({
	name: validateString('Name', { min: 1, max: 255 }).optional(),
	amount: z.coerce.number().positive().optional(),
	currency: currencySchema.optional(),
	categoryId: z.string().uuid().optional().nullable(),
	recurrence: validateEnum('Recurrence', budgetRecurrenceEnum.enumValues).optional(),
	nextRunAt: validateDate('Next run at').optional(),
	isActive: z.boolean().optional(),
});

export type CreateBudgetSubscriptionDto = z.infer<typeof createBudgetSubscriptionSchema>;
export type UpdateBudgetSubscriptionDto = z.infer<typeof updateBudgetSubscriptionSchema>;
