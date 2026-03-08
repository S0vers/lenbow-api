import { CurrencyData } from '../../currency/@types/currency.types';

export type BudgetRecurrence = 'weekly' | 'monthly' | 'yearly';

export interface BudgetSubscriptionReturnType {
	id: string;
	userId: number;
	categoryId: string | null;
	categoryName: string | null;
	amount: number;
	currency: CurrencyData;
	name: string;
	recurrence: BudgetRecurrence;
	nextRunAt: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
