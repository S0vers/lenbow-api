import {
	validateDate,
	validateEnum,
	validatePositiveNumber,
	validateString,
} from 'src/core/validators/commonRules';
import { transactionStatusEnum, transactionTypeEnum } from 'src/models/drizzle/enum.models';
import z from 'zod';

export const validateTransactionSchema = z.object({
	userId: validatePositiveNumber('User ID'),
	contactId: validatePositiveNumber('Contact ID'),
	type: validateEnum('Transaction Type', transactionTypeEnum.enumValues),
	amount: validatePositiveNumber('Amount'),
	amountPaid: validatePositiveNumber('Amount Paid').optional(),
	status: validateEnum('Transaction Status', transactionStatusEnum.enumValues),
	description: validateString('Description').optional(),
	dueDate: validateDate('Due Date').optional(),
});

export const validateUpdateTransactionSchema = validateTransactionSchema.omit({
	userId: true,
	contactId: true,
});

export type ValidateTransactionDto = z.infer<typeof validateTransactionSchema>;
export type ValidateUpdateTransactionDto = z.infer<typeof validateUpdateTransactionSchema>;
