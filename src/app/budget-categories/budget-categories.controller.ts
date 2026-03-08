import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { BudgetCategoryReturnType } from './@types/budget-categories.types';
import {
	createBudgetCategorySchema,
	updateBudgetCategorySchema,
	type CreateBudgetCategoryDto,
	type UpdateBudgetCategoryDto,
} from './budget-categories.schema';
import { BudgetCategoriesService } from './budget-categories.service';

@Controller('budget-categories')
export class BudgetCategoriesController {
	constructor(private readonly budgetCategoriesService: BudgetCategoriesService) {}

	@UseGuards(JwtAuthGuard)
	@Get('')
	async list(@Req() req: Request): Promise<ApiResponse<BudgetCategoryReturnType[]>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const categories = await this.budgetCategoriesService.findAll(userId);
		return createApiResponse(HttpStatus.OK, 'Budget categories fetched successfully', categories);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':publicId')
	async getOne(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetCategoryReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const category = await this.budgetCategoriesService.findOne(publicId, userId);
		return createApiResponse(HttpStatus.OK, 'Budget category fetched successfully', category);
	}

	@UseGuards(JwtAuthGuard)
	@Post('')
	async create(
		@Body() body: CreateBudgetCategoryDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetCategoryReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = createBudgetCategorySchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const category = await this.budgetCategoriesService.create(userId, validated.data);
		return createApiResponse(HttpStatus.OK, 'Budget category created successfully', category);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':publicId')
	async update(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() body: UpdateBudgetCategoryDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetCategoryReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = updateBudgetCategorySchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const category = await this.budgetCategoriesService.update(publicId, userId, validated.data);
		return createApiResponse(HttpStatus.OK, 'Budget category updated successfully', category);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':publicId')
	async delete(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		await this.budgetCategoriesService.delete(publicId, userId);
		return createApiResponse(HttpStatus.OK, 'Budget category deleted successfully', null);
	}
}
