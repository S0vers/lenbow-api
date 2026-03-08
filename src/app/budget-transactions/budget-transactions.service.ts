import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, lte, or, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PaginatedResponse } from '../../core/api-response.interceptor';
import PaginationManager from '../../core/pagination';
import { DATABASE_CONNECTION } from '../../database/connection';
import { orderByColumn } from '../../database/helpers';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import type { BudgetTransactionReturnType } from './@types/budget-transactions.types';
import type {
	BudgetTransactionQuerySchemaType,
	CreateBudgetTransactionDto,
	UpdateBudgetTransactionDto,
} from './budget-transactions.schema';

@Injectable()
export class BudgetTransactionsService extends DrizzleService {
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

	async findAll(
		userId: number,
		query: BudgetTransactionQuerySchemaType,
	): Promise<PaginatedResponse<BudgetTransactionReturnType>> {
		const fromDate = query.from ? new Date(query.from) : undefined;
		const toDate = query.to ? new Date(query.to) : undefined;
		if (toDate) toDate.setHours(23, 59, 59, 999);

		const conditions = [eq(schema.budgetTransactions.userId, userId)];
		if (fromDate) conditions.push(gte(schema.budgetTransactions.date, fromDate));
		if (toDate) conditions.push(lte(schema.budgetTransactions.date, toDate));
		if (query.type) conditions.push(eq(schema.budgetTransactions.type, query.type));
		if (query.categoryId) {
			const catId = await this.resolveCategoryId(query.categoryId, userId);
			if (catId !== null) conditions.push(eq(schema.budgetTransactions.categoryId, catId));
		}

		const whereClause = and(...conditions);

		let totalItems = 0;
		let offset = 0;
		let pagination = undefined;

		if (query.page && query.limit) {
			const [{ value: total }] = await this.getDb()
				.select({ value: count() })
				.from(schema.budgetTransactions)
				.where(whereClause);
			totalItems = total;
			const pm = new PaginationManager(query.page, query.limit, totalItems);
			const result = pm.createPagination();
			pagination = result.pagination;
			offset = result.offset;
		}

		const orderBy = orderByColumn(
			schema.budgetTransactions,
			query.sortBy,
			query.sortOrder,
		) ?? desc(schema.budgetTransactions.date);

		const limit = query.limit ?? 50;
		const rows = await this.getDb()
			.select({
				internalId: schema.budgetTransactions.id,
				id: schema.budgetTransactions.publicId,
				userId: schema.budgetTransactions.userId,
				name: schema.budgetTransactions.name,
				amount: schema.budgetTransactions.amount,
				type: schema.budgetTransactions.type,
				currency: schema.budgetTransactions.currency,
				categoryId: schema.budgetCategories.publicId,
				categoryName: schema.budgetCategories.name,
				date: schema.budgetTransactions.date,
				note: schema.budgetTransactions.note,
				details: schema.budgetTransactions.details,
				createdAt: schema.budgetTransactions.createdAt,
				updatedAt: schema.budgetTransactions.updatedAt,
			})
			.from(schema.budgetTransactions)
			.leftJoin(
				schema.budgetCategories,
				eq(schema.budgetTransactions.categoryId, schema.budgetCategories.id),
			)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		const receiptCounts =
			rows.length > 0
				? await this.getDb()
						.select({
							budgetTransactionId: schema.budgetTransactionReceipts.budgetTransactionId,
							count: count(),
						})
						.from(schema.budgetTransactionReceipts)
						.where(
							sql`${schema.budgetTransactionReceipts.budgetTransactionId} IN (${sql.join(
								rows.map(r => sql`${r.internalId}`),
								sql`, `,
							)})`,
						)
						.groupBy(schema.budgetTransactionReceipts.budgetTransactionId)
				: [];

		const countMap = new Map(receiptCounts.map(r => [r.budgetTransactionId, r.count]));

		const data: BudgetTransactionReturnType[] = rows.map(r => ({
			id: r.id,
			userId: r.userId,
			name: r.name,
			amount: Number(r.amount),
			type: r.type,
			currency: r.currency,
			categoryId: r.categoryId,
			categoryName: r.categoryName,
			date: r.date,
			note: r.note,
			details: r.details,
			receiptCount: countMap.get(r.internalId) ?? 0,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}));

		return { data, pagination };
	}

	async findOne(publicId: string, userId: number): Promise<BudgetTransactionReturnType> {
		const row = await this.getDb()
			.select({
				internalId: schema.budgetTransactions.id,
				id: schema.budgetTransactions.publicId,
				userId: schema.budgetTransactions.userId,
				name: schema.budgetTransactions.name,
				amount: schema.budgetTransactions.amount,
				type: schema.budgetTransactions.type,
				currency: schema.budgetTransactions.currency,
				categoryId: schema.budgetCategories.publicId,
				categoryName: schema.budgetCategories.name,
				date: schema.budgetTransactions.date,
				note: schema.budgetTransactions.note,
				details: schema.budgetTransactions.details,
				createdAt: schema.budgetTransactions.createdAt,
				updatedAt: schema.budgetTransactions.updatedAt,
			})
			.from(schema.budgetTransactions)
			.leftJoin(
				schema.budgetCategories,
				eq(schema.budgetTransactions.categoryId, schema.budgetCategories.id),
			)
			.where(
				and(
					eq(schema.budgetTransactions.publicId, publicId),
					eq(schema.budgetTransactions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!row) throw new NotFoundException('Budget transaction not found');

		const [receiptRow] = await this.getDb()
			.select({ count: count() })
			.from(schema.budgetTransactionReceipts)
			.where(eq(schema.budgetTransactionReceipts.budgetTransactionId, row.internalId));

		return {
			id: row.id,
			userId: row.userId,
			name: row.name,
			amount: Number(row.amount),
			type: row.type,
			currency: row.currency,
			categoryId: row.categoryId,
			categoryName: row.categoryName,
			date: row.date,
			note: row.note,
			details: row.details,
			receiptCount: receiptRow?.count ?? 0,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}

	async create(
		userId: number,
		dto: CreateBudgetTransactionDto,
	): Promise<BudgetTransactionReturnType> {
		const categoryId = await this.resolveCategoryId(dto.categoryId, userId);
		const currency = dto.currency ?? {
			code: 'USD',
			name: 'US Dollar',
			symbol: '$',
		};

		const [inserted] = await this.getDb()
			.insert(schema.budgetTransactions)
			.values({
				userId,
				name: dto.name,
				amount: dto.amount,
				type: dto.type,
				currency,
				categoryId,
				date: dto.date,
				note: dto.note ?? null,
				details: dto.details ?? null,
			})
			.returning();

		if (!inserted) throw new BadRequestException('Failed to create budget transaction');
		return this.findOne(inserted.publicId, userId);
	}

	async update(
		publicId: string,
		userId: number,
		dto: UpdateBudgetTransactionDto,
	): Promise<BudgetTransactionReturnType> {
		const existing = await this.getDb()
			.select()
			.from(schema.budgetTransactions)
			.where(
				and(
					eq(schema.budgetTransactions.publicId, publicId),
					eq(schema.budgetTransactions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) throw new NotFoundException('Budget transaction not found');

		const categoryId =
			dto.categoryId !== undefined
				? await this.resolveCategoryId(dto.categoryId, userId)
				: undefined;

		const updateData: Record<string, unknown> = {};
		if (dto.name !== undefined) updateData.name = dto.name;
		if (dto.amount !== undefined) updateData.amount = dto.amount;
		if (dto.type !== undefined) updateData.type = dto.type;
		if (dto.currency !== undefined) updateData.currency = dto.currency;
		if (categoryId !== undefined) updateData.categoryId = categoryId;
		if (dto.date !== undefined) updateData.date = dto.date;
		if (dto.note !== undefined) updateData.note = dto.note;
		if (dto.details !== undefined) updateData.details = dto.details;

		await this.getDb()
			.update(schema.budgetTransactions)
			.set(updateData as never)
			.where(eq(schema.budgetTransactions.publicId, publicId));

		return this.findOne(publicId, userId);
	}

	async delete(publicId: string, userId: number): Promise<void> {
		const existing = await this.getDb()
			.select()
			.from(schema.budgetTransactions)
			.where(
				and(
					eq(schema.budgetTransactions.publicId, publicId),
					eq(schema.budgetTransactions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) throw new NotFoundException('Budget transaction not found');

		await this.getDb()
			.delete(schema.budgetTransactions)
			.where(eq(schema.budgetTransactions.publicId, publicId));
	}

	async attachReceipt(
		transactionPublicId: string,
		mediaPublicId: string,
		userId: number,
	): Promise<void> {
		const tx = await this.getDb()
			.select({ id: schema.budgetTransactions.id })
			.from(schema.budgetTransactions)
			.where(
				and(
					eq(schema.budgetTransactions.publicId, transactionPublicId),
					eq(schema.budgetTransactions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);
		if (!tx) throw new NotFoundException('Budget transaction not found');

		const mediaRow = await this.getDb()
			.select()
			.from(schema.media)
			.where(
				and(
					eq(schema.media.publicId, mediaPublicId),
					eq(schema.media.uploadedBy, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);
		if (!mediaRow) throw new NotFoundException('Media not found');

		await this.getDb().insert(schema.budgetTransactionReceipts).values({
			budgetTransactionId: tx.id,
			mediaId: mediaRow.id,
		});
	}

	async detachReceipt(
		transactionPublicId: string,
		mediaPublicId: string,
		userId: number,
	): Promise<void> {
		const tx = await this.getDb()
			.select({ id: schema.budgetTransactions.id })
			.from(schema.budgetTransactions)
			.where(
				and(
					eq(schema.budgetTransactions.publicId, transactionPublicId),
					eq(schema.budgetTransactions.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);
		if (!tx) throw new NotFoundException('Budget transaction not found');

		const mediaRow = await this.getDb()
			.select({ id: schema.media.id })
			.from(schema.media)
			.where(eq(schema.media.publicId, mediaPublicId))
			.limit(1)
			.then(r => r[0]);
		if (!mediaRow) throw new NotFoundException('Media not found');

		await this.getDb()
			.delete(schema.budgetTransactionReceipts)
			.where(
				and(
					eq(schema.budgetTransactionReceipts.budgetTransactionId, tx.id),
					eq(schema.budgetTransactionReceipts.mediaId, mediaRow.id),
				),
			);
	}
}
