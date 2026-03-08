import { pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['lend', 'borrow']);
export const transactionStatusEnum = pgEnum('transaction_status', [
	'pending',
	'accepted',
	'rejected',
	'partially_paid',
	'requested_repay',
	'completed',
]);

// Budget tracking
export const budgetTransactionTypeEnum = pgEnum('budget_transaction_type', ['in', 'out']);
export const budgetRecurrenceEnum = pgEnum('budget_recurrence', ['weekly', 'monthly', 'yearly']);

// History actions for transactions only
export const transactionHistoryActionEnum = pgEnum('transaction_history_action', [
	'create',
	'update',
	'status_change',
	'delete',
	'partial_repay',
	'complete_repay',
	'request_repay',
	'accept_repay',
	'reject_repay',
	'add_payment',
]);
