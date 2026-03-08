import { CurrencyData } from '../../currency/@types/currency.types';

export type BudgetTransactionType = 'in' | 'out';

export interface BudgetTransactionReturnType {
	id: string;
	userId: number;
	name: string;
	amount: number;
	type: BudgetTransactionType;
	currency: CurrencyData;
	categoryId: string | null;
	categoryName: string | null;
	date: Date;
	note: string | null;
	details: string | null;
	receiptCount?: number;
	createdAt: Date;
	updatedAt: Date;
}
