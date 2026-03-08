export interface BudgetCategoryReturnType {
	id: string;
	userId: number | null;
	name: string;
	slug: string;
	icon: string | null;
	createdAt: Date;
	updatedAt: Date;
}
