import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/app/auth/auth.guard';
import type { TransactionReturnType } from 'src/app/transactions/@types/transactions.types';
import {
	validateTransactionSchema,
	type ValidateTransactionDto,
	type ValidateUpdateTransactionDto,
} from 'src/app/transactions/transactions.schema';
import { createApiResponse, type ApiResponse } from 'src/core/api-response.interceptor';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@UseGuards(JwtAuthGuard)
	@Get('create')
	async createTransaction(
		@Body() validateTransactionDto: ValidateTransactionDto,
	): Promise<ApiResponse<TransactionReturnType>> {
		// Validate the incoming data
		const validate = validateTransactionSchema.safeParse(validateTransactionDto);
		if (!validate.success) {
			throw new BadRequestException(
				`Validation failed: ${validate.error.issues.map(issue => issue.message).join(', ')}`,
			);
		}

		// Create the transaction
		const transaction = await this.transactionsService.createTransaction(validate.data);

		const responseTransaction: TransactionReturnType = {
			...transaction,
			id: transaction.publicId,
		};

		return createApiResponse(
			HttpStatus.CREATED,
			'Transaction created successfully',
			responseTransaction,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':publicId/status')
	async updateTransactionStatus(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() statusDto: ValidateUpdateTransactionDto['status'],
	): Promise<ApiResponse<TransactionReturnType>> {
		// Validate incoming status
		const validate = validateTransactionSchema.shape.status.safeParse(statusDto);
		if (!validate.success) {
			throw new BadRequestException(
				`Validation failed: ${validate.error.issues.map(issue => issue.message).join(', ')}`,
			);
		}

		// Fetch the transaction by its public ID
		const transaction = await this.transactionsService.getTransactionByPublicId(publicId);

		// Check eligibility for status update
		const eligibility = this.transactionsService.checkEligibilityForUpdatingStatus(
			transaction,
			validate.data,
		);

		if (!eligibility) {
			throw new BadRequestException(
				`Status update not allowed from ${transaction.status} to ${validate.data}`,
			);
		}

		// Update the transaction status
		const updatedTransaction = await this.transactionsService.updateTransactionStatus(
			transaction.id,
			validate.data,
		);

		const responseTransaction: TransactionReturnType = {
			...updatedTransaction,
			id: updatedTransaction.publicId,
		};

		return createApiResponse(
			HttpStatus.OK,
			'Transaction status updated successfully',
			responseTransaction,
		);
	}
}
