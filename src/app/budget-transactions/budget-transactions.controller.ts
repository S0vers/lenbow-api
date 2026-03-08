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
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { BudgetTransactionReturnType } from './@types/budget-transactions.types';
import {
	budgetTransactionQuerySchema,
	createBudgetTransactionSchema,
	updateBudgetTransactionSchema,
	type BudgetTransactionQuerySchemaType,
	type CreateBudgetTransactionDto,
	type UpdateBudgetTransactionDto,
} from './budget-transactions.schema';
import { BudgetTransactionsService } from './budget-transactions.service';

@Controller('budget-transactions')
export class BudgetTransactionsController {
	constructor(private readonly budgetTransactionsService: BudgetTransactionsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('')
	async list(
		@Req() req: Request,
		@Query() query: BudgetTransactionQuerySchemaType,
	): Promise<ApiResponse<BudgetTransactionReturnType[]>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = budgetTransactionQuerySchema.safeParse(query);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const result = await this.budgetTransactionsService.findAll(userId, validated.data);
		return createApiResponse(
			HttpStatus.OK,
			'Budget transactions fetched successfully',
			result.data,
			result.pagination,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':publicId')
	async getOne(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetTransactionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const transaction = await this.budgetTransactionsService.findOne(publicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Budget transaction fetched successfully',
			transaction,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post('')
	async create(
		@Body() body: CreateBudgetTransactionDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetTransactionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = createBudgetTransactionSchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const transaction = await this.budgetTransactionsService.create(userId, validated.data);
		return createApiResponse(
			HttpStatus.OK,
			'Budget transaction created successfully',
			transaction,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':publicId')
	async update(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() body: UpdateBudgetTransactionDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetTransactionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = updateBudgetTransactionSchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const transaction = await this.budgetTransactionsService.update(
			publicId,
			userId,
			validated.data,
		);
		return createApiResponse(
			HttpStatus.OK,
			'Budget transaction updated successfully',
			transaction,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':publicId')
	async delete(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		await this.budgetTransactionsService.delete(publicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Budget transaction deleted successfully',
			null,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':publicId/receipts/:mediaPublicId')
	async attachReceipt(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Param('mediaPublicId', ParseUUIDPipe) mediaPublicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		await this.budgetTransactionsService.attachReceipt(publicId, mediaPublicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Receipt attached successfully',
			null,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':publicId/receipts/:mediaPublicId')
	async detachReceipt(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Param('mediaPublicId', ParseUUIDPipe) mediaPublicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		await this.budgetTransactionsService.detachReceipt(publicId, mediaPublicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Receipt detached successfully',
			null,
		);
	}
}
