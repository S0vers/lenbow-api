import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import type { BudgetCategoryReturnType } from './@types/budget-categories.types';
import type { CreateBudgetCategoryDto, UpdateBudgetCategoryDto } from './budget-categories.schema';

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

@Injectable()
export class BudgetCategoriesService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	async findAll(userId: number): Promise<BudgetCategoryReturnType[]> {
		const rows = await this.getDb()
			.select({
				id: schema.budgetCategories.publicId,
				userId: schema.budgetCategories.userId,
				name: schema.budgetCategories.name,
				slug: schema.budgetCategories.slug,
				icon: schema.budgetCategories.icon,
				createdAt: schema.budgetCategories.createdAt,
				updatedAt: schema.budgetCategories.updatedAt,
			})
			.from(schema.budgetCategories)
			.where(
				or(
					isNull(schema.budgetCategories.userId),
					eq(schema.budgetCategories.userId, userId),
				),
			)
			.orderBy(schema.budgetCategories.name);

		return rows.map(r => ({
			id: r.id,
			userId: r.userId,
			name: r.name,
			slug: r.slug,
			icon: r.icon,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
		}));
	}

	async findOne(publicId: string, userId: number): Promise<BudgetCategoryReturnType> {
		const row = await this.getDb()
			.select({
				id: schema.budgetCategories.publicId,
				userId: schema.budgetCategories.userId,
				name: schema.budgetCategories.name,
				slug: schema.budgetCategories.slug,
				icon: schema.budgetCategories.icon,
				createdAt: schema.budgetCategories.createdAt,
				updatedAt: schema.budgetCategories.updatedAt,
			})
			.from(schema.budgetCategories)
			.where(
				and(
					eq(schema.budgetCategories.publicId, publicId),
					or(
						isNull(schema.budgetCategories.userId),
						eq(schema.budgetCategories.userId, userId),
					),
				),
			)
			.limit(1)
			.then(res => res[0]);

		if (!row) throw new NotFoundException('Budget category not found');
		return row as BudgetCategoryReturnType;
	}

	async create(userId: number, dto: CreateBudgetCategoryDto): Promise<BudgetCategoryReturnType> {
		const slug = dto.slug ?? toSlug(dto.name);

		// Check slug uniqueness for this user (custom categories only)
		const existing = await this.getDb()
			.select()
			.from(schema.budgetCategories)
			.where(
				and(
					eq(schema.budgetCategories.userId, userId),
					eq(schema.budgetCategories.slug, slug),
				),
			)
			.limit(1)
			.then(res => res[0]);

		if (existing) {
			throw new BadRequestException(`Category with slug "${slug}" already exists`);
		}

		const [inserted] = await this.getDb()
			.insert(schema.budgetCategories)
			.values({
				userId,
				name: dto.name,
				slug,
				icon: dto.icon ?? null,
			})
			.returning({
				id: schema.budgetCategories.publicId,
				userId: schema.budgetCategories.userId,
				name: schema.budgetCategories.name,
				slug: schema.budgetCategories.slug,
				icon: schema.budgetCategories.icon,
				createdAt: schema.budgetCategories.createdAt,
				updatedAt: schema.budgetCategories.updatedAt,
			});

		if (!inserted) throw new BadRequestException('Failed to create budget category');
		return inserted as BudgetCategoryReturnType;
	}

	async update(
		publicId: string,
		userId: number,
		dto: UpdateBudgetCategoryDto,
	): Promise<BudgetCategoryReturnType> {
		const category = await this.getDb()
			.select()
			.from(schema.budgetCategories)
			.where(eq(schema.budgetCategories.publicId, publicId))
			.limit(1)
			.then(res => res[0]);

		if (!category) throw new NotFoundException('Budget category not found');
		if (category.userId === null) {
			throw new BadRequestException('System categories cannot be updated');
		}
		if (category.userId !== userId) {
			throw new NotFoundException('Budget category not found');
		}

		const slug = dto.slug ?? (dto.name ? toSlug(dto.name) : undefined);
		if (slug !== undefined) {
			const existing = await this.getDb()
				.select()
				.from(schema.budgetCategories)
				.where(
					and(
						eq(schema.budgetCategories.userId, userId),
						eq(schema.budgetCategories.slug, slug),
						ne(schema.budgetCategories.publicId, publicId),
					),
				)
				.limit(1)
				.then(res => res[0]);
			if (existing) {
				throw new BadRequestException(`Category with slug "${slug}" already exists`);
			}
		}

		const updateData: Record<string, unknown> = {};
		if (dto.name !== undefined) updateData.name = dto.name;
		if (slug !== undefined) updateData.slug = slug;
		if (dto.icon !== undefined) updateData.icon = dto.icon;

		const [updated] = await this.getDb()
			.update(schema.budgetCategories)
			.set(updateData as never)
			.where(eq(schema.budgetCategories.publicId, publicId))
			.returning({
				id: schema.budgetCategories.publicId,
				userId: schema.budgetCategories.userId,
				name: schema.budgetCategories.name,
				slug: schema.budgetCategories.slug,
				icon: schema.budgetCategories.icon,
				createdAt: schema.budgetCategories.createdAt,
				updatedAt: schema.budgetCategories.updatedAt,
			});

		if (!updated) throw new NotFoundException('Budget category not found');
		return updated as BudgetCategoryReturnType;
	}

	async delete(publicId: string, userId: number): Promise<void> {
		const category = await this.getDb()
			.select({ userId: schema.budgetCategories.userId })
			.from(schema.budgetCategories)
			.where(eq(schema.budgetCategories.publicId, publicId))
			.limit(1)
			.then(res => res[0]);

		if (!category) throw new NotFoundException('Budget category not found');
		if (category.userId === null) {
			throw new BadRequestException('System categories cannot be deleted');
		}
		if (category.userId !== userId) {
			throw new NotFoundException('Budget category not found');
		}

		await this.getDb()
			.delete(schema.budgetCategories)
			.where(eq(schema.budgetCategories.publicId, publicId));
	}
}
