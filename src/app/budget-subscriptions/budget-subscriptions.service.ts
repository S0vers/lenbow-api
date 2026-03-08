import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, lte, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import type { BudgetSubscriptionReturnType } from './@types/budget-subscriptions.types';
import type {
	CreateBudgetSubscriptionDto,
	UpdateBudgetSubscriptionDto,
} from './budget-subscriptions.schema';

function addRecurrence(date: Date, recurrence: 'weekly' | 'monthly' | 'yearly'): Date {
	const next = new Date(date);
	if (recurrence === 'weekly') {
		next.setDate(next.getDate() + 7);
	} else if (recurrence === 'monthly') {
		next.setMonth(next.getMonth() + 1);
	} else {
		next.setFullYear(next.getFullYear() + 1);
	}
	return next;
}

@Injectable()
export class BudgetSubscriptionsService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	private async resolveCategoryId(
		categoryPublicId: string | null | undefined,
		userId: number,
	): Promise<number | null> {
		if (!categoryPublicId) return null;
		const cat = await this.getDb()
			.select({ id: schema.budgetCategories.id })
			.from(schema.budgetCategories)
			.where(
				and(
					eq(schema.budgetCategories.publicId, categoryPublicId),
					or(
						eq(schema.budgetCategories.userId, userId),
						sql`${schema.budgetCategories.userId} IS NULL`,
					),
				),
			)
			.limit(1)
			.then(r => r[0]);
		return cat?.id ?? null;
	}

	async findAll(userId: number): Promise<BudgetSubscriptionReturnType[]> {
		const rows = await this.getDb()
			.select({
				id: schema.budgetSubscriptions.publicId,
				userId: schema.budgetSubscriptions.userId,
				categoryId: schema.budgetCategories.publicId,
				categoryName: schema.budgetCategories.name,
				amount: schema.budgetSubscriptions.amount,
				currency: schema.budgetSubscriptions.currency,
				name: schema.budgetSubscriptions.name,
				recurrence: schema.budgetSubscriptions.recurrence,
				nextRunAt: schema.budgetSubscriptions.nextRunAt,
				isActive: schema.budgetSubscriptions.isActive,
				createdAt: schema.budgetSubscriptions.createdAt,
				updatedAt: schema.budgetSubscriptions.updatedAt,
			})
			.from(schema.budgetSubscriptions)
			.leftJoin(
				schema.budgetCategories,
				eq(schema.budgetSubscriptions.categoryId, schema.budgetCategories.id),
			)
			.where(eq(schema.budgetSubscriptions.userId, userId))
			.orderBy(schema.budgetSubscriptions.nextRunAt);

		return rows.map(r => ({
			id: r.id,
			userId: r.userId,
			categoryId: r.categoryId,
			categoryName: r.categoryName,
			amount: Number(r.amount),
			currency: r.currency,
			name: r.name,
			recurrence: r.recurrence,
			nextRunAt: r.nextRunAt,
			isActive: r.isActive,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}));
	}

	async findOne(publicId: string, userId: number): Promise<BudgetSubscriptionReturnType> {
		const row = await this.getDb()
			.select({
				id: schema.budgetSubscriptions.publicId,
				userId: schema.budgetSubscriptions.userId,
				categoryId: schema.budgetCategories.publicId,
				categoryName: schema.budgetCategories.name,
				amount: schema.budgetSubscriptions.amount,
				currency: schema.budgetSubscriptions.currency,
				name: schema.budgetSubscriptions.name,
				recurrence: schema.budgetSubscriptions.recurrence,
				nextRunAt: schema.budgetSubscriptions.nextRunAt,
				isActive: schema.budgetSubscriptions.isActive,
				createdAt: schema.budgetSubscriptions.createdAt,
				updatedAt: schema.budgetSubscriptions.updatedAt,
			})
			.from(schema.budgetSubscriptions)
			.leftJoin(
				schema.budgetCategories,
				eq(schema.budgetSubscriptions.categoryId, schema.budgetCategories.id),
			)
			.where(
				and(
					eq(schema.budgetSubscriptions.publicId, publicId),
					eq(schema.budgetSubscriptions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!row) throw new NotFoundException('Budget subscription not found');
		return {
			...row,
			amount: Number(row.amount),
		};
	}

	async create(
		userId: number,
		dto: CreateBudgetSubscriptionDto,
	): Promise<BudgetSubscriptionReturnType> {
		const categoryId = await this.resolveCategoryId(dto.categoryId, userId);
		const currency = dto.currency ?? {
			code: 'USD',
			name: 'US Dollar',
			symbol: '$',
		};
		const nextRunAt = dto.nextRunAt instanceof Date ? dto.nextRunAt : new Date(dto.nextRunAt);

		const [inserted] = await this.getDb()
			.insert(schema.budgetSubscriptions)
			.values({
				userId,
				categoryId,
				amount: dto.amount,
				currency,
				name: dto.name,
				recurrence: dto.recurrence,
				nextRunAt,
				isActive: true,
			})
			.returning();

		if (!inserted) throw new BadRequestException('Failed to create budget subscription');
		return this.findOne(inserted.publicId, userId);
	}

	async update(
		publicId: string,
		userId: number,
		dto: UpdateBudgetSubscriptionDto,
	): Promise<BudgetSubscriptionReturnType> {
		const existing = await this.getDb()
			.select()
			.from(schema.budgetSubscriptions)
			.where(
				and(
					eq(schema.budgetSubscriptions.publicId, publicId),
					eq(schema.budgetSubscriptions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) throw new NotFoundException('Budget subscription not found');

		const categoryId =
			dto.categoryId !== undefined
				? await this.resolveCategoryId(dto.categoryId, userId)
				: undefined;

		const updateData: Record<string, unknown> = {};
		if (dto.name !== undefined) updateData.name = dto.name;
		if (dto.amount !== undefined) updateData.amount = dto.amount;
		if (dto.currency !== undefined) updateData.currency = dto.currency;
		if (categoryId !== undefined) updateData.categoryId = categoryId;
		if (dto.recurrence !== undefined) updateData.recurrence = dto.recurrence;
		if (dto.nextRunAt !== undefined)
			updateData.nextRunAt = dto.nextRunAt instanceof Date ? dto.nextRunAt : new Date(dto.nextRunAt);
		if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

		await this.getDb()
			.update(schema.budgetSubscriptions)
			.set(updateData as never)
			.where(eq(schema.budgetSubscriptions.publicId, publicId));

		return this.findOne(publicId, userId);
	}

	async delete(publicId: string, userId: number): Promise<void> {
		const existing = await this.getDb()
			.select()
			.from(schema.budgetSubscriptions)
			.where(
				and(
					eq(schema.budgetSubscriptions.publicId, publicId),
					eq(schema.budgetSubscriptions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) throw new NotFoundException('Budget subscription not found');

		await this.getDb()
			.delete(schema.budgetSubscriptions)
			.where(eq(schema.budgetSubscriptions.publicId, publicId));
	}

	/**
	 * Process due subscriptions: create budget_transaction (type out) and advance next_run_at.
	 * Call via POST /budget-subscriptions/process-due with X-Cron-Secret header (from external cron).
	 */
	async processDueSubscriptions(): Promise<number> {
		const now = new Date();
		const due = await this.getDb()
			.select()
			.from(schema.budgetSubscriptions)
			.where(
				and(
					eq(schema.budgetSubscriptions.isActive, true),
					lte(schema.budgetSubscriptions.nextRunAt, now),
				),
			);

		let processed = 0;
		for (const sub of due) {
			await this.getDb().transaction(async tx => {
				await tx.insert(schema.budgetTransactions).values({
					userId: sub.userId,
					name: sub.name,
					amount: sub.amount,
					type: 'out',
					currency: sub.currency,
					categoryId: sub.categoryId,
					date: sub.nextRunAt,
					note: `Subscription: ${sub.name}`,
					details: null,
				});
				const nextRunAt = addRecurrence(sub.nextRunAt, sub.recurrence);
				await tx
					.update(schema.budgetSubscriptions)
					.set({ nextRunAt })
					.where(eq(schema.budgetSubscriptions.id, sub.id));
			});
			processed++;
		}
		return processed;
	}
}
