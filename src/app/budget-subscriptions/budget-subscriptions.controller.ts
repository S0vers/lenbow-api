import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { BudgetSubscriptionReturnType } from './@types/budget-subscriptions.types';
import {
	createBudgetSubscriptionSchema,
	updateBudgetSubscriptionSchema,
	type CreateBudgetSubscriptionDto,
	type UpdateBudgetSubscriptionDto,
} from './budget-subscriptions.schema';
import { BudgetSubscriptionsService } from './budget-subscriptions.service';

@Controller('budget-subscriptions')
export class BudgetSubscriptionsController {
	constructor(
		private readonly budgetSubscriptionsService: BudgetSubscriptionsService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * Process due budget subscriptions (create transactions and advance next_run_at).
	 * Called by an external cron/scheduler. Requires X-Cron-Secret header matching BUDGET_CRON_SECRET.
	 */
	@Post('process-due')
	async processDue(
		@Headers('x-cron-secret') cronSecret: string,
	): Promise<ApiResponse<{ processed: number }>> {
		const expected = this.configService.get<string>('BUDGET_CRON_SECRET');
		if (!expected) {
			throw new UnauthorizedException('Budget cron not configured (BUDGET_CRON_SECRET missing)');
		}
		if (!cronSecret || cronSecret !== expected) {
			throw new UnauthorizedException('Invalid or missing X-Cron-Secret');
		}
		const processed = await this.budgetSubscriptionsService.processDueSubscriptions();
		return createApiResponse(
			HttpStatus.OK,
			'Due subscriptions processed',
			{ processed },
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('')
	async list(@Req() req: Request): Promise<ApiResponse<BudgetSubscriptionReturnType[]>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const subscriptions = await this.budgetSubscriptionsService.findAll(userId);
		return createApiResponse(
			HttpStatus.OK,
			'Budget subscriptions fetched successfully',
			subscriptions,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':publicId')
	async getOne(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetSubscriptionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const subscription = await this.budgetSubscriptionsService.findOne(publicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Budget subscription fetched successfully',
			subscription,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post('')
	async create(
		@Body() body: CreateBudgetSubscriptionDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetSubscriptionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = createBudgetSubscriptionSchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const subscription = await this.budgetSubscriptionsService.create(userId, validated.data);
		return createApiResponse(
			HttpStatus.OK,
			'Budget subscription created successfully',
			subscription,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':publicId')
	async update(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() body: UpdateBudgetSubscriptionDto,
		@Req() req: Request,
	): Promise<ApiResponse<BudgetSubscriptionReturnType>> {
		const userId = req.user?.id;
		if (!userId) throw new BadRequestException('User not authenticated');
		const validated = updateBudgetSubscriptionSchema.safeParse(body);
		if (!validated.success) {
			throw new BadRequestException(
				validated.error.issues.map(i => i.message).join(', '),
			);
		}
		const subscription = await this.budgetSubscriptionsService.update(
			publicId,
			userId,
			validated.data,
		);
		return createApiResponse(
			HttpStatus.OK,
			'Budget subscription updated successfully',
			subscription,
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
		await this.budgetSubscriptionsService.delete(publicId, userId);
		return createApiResponse(
			HttpStatus.OK,
			'Budget subscription deleted successfully',
			null,
		);
	}
}
