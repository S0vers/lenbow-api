import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { EmailTemplateReturnType } from './@types/email-templates.types';
import {
	createEmailTemplateSchema,
	emailTemplateTestSendSchema,
	emailTemplatesQuerySchema,
	updateEmailTemplateSchema,
	type CreateEmailTemplateDto,
	type EmailTemplateTestSendDto,
	type EmailTemplatesQuerySchemaType,
	type UpdateEmailTemplateDto,
} from './email-templates.schema';
import { EmailTemplatesService } from './email-templates.service';

@Controller('email-templates')
export class EmailTemplatesController {
	constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

	@UseGuards(JwtAuthGuard)
	@Get('')
	async list(
		@Req() req: Request,
		@Query() query: EmailTemplatesQuerySchemaType,
	): Promise<ApiResponse<EmailTemplateReturnType[]>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		const validated = emailTemplatesQuerySchema.safeParse(query);
		if (!validated.success) {
			const messages = (validated.error.issues as { message: string }[])
				.map(issue => issue.message)
				.join(', ');
			throw new BadRequestException(messages);
		}

		return this.emailTemplatesService.list(userId, validated.data);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':publicId')
	async getOne(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<EmailTemplateReturnType>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		const template = await this.emailTemplatesService.findOne(userId, publicId);
		return createApiResponse(
			HttpStatus.OK,
			'Email template fetched successfully',
			template,
		) as ApiResponse<EmailTemplateReturnType>;
	}

	@UseGuards(JwtAuthGuard)
	@Post('')
	async create(
		@Body() body: CreateEmailTemplateDto,
		@Req() req: Request,
	): Promise<ApiResponse<EmailTemplateReturnType>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		const validated = createEmailTemplateSchema.safeParse(body);
		if (!validated.success) {
			const messages = (validated.error.issues as { message: string }[])
				.map(issue => issue.message)
				.join(', ');
			throw new BadRequestException(messages);
		}

		const template = await this.emailTemplatesService.create(userId, validated.data);
		return createApiResponse(
			HttpStatus.CREATED,
			'Email template created successfully',
			template,
		) as ApiResponse<EmailTemplateReturnType>;
	}

	@UseGuards(JwtAuthGuard)
	@Put(':publicId')
	async update(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() body: UpdateEmailTemplateDto,
		@Req() req: Request,
	): Promise<ApiResponse<EmailTemplateReturnType>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		const validated = updateEmailTemplateSchema.safeParse(body);
		if (!validated.success) {
			const messages = (validated.error.issues as { message: string }[])
				.map(issue => issue.message)
				.join(', ');
			throw new BadRequestException(messages);
		}

		const template = await this.emailTemplatesService.update(userId, publicId, validated.data);
		return createApiResponse(
			HttpStatus.OK,
			'Email template updated successfully',
			template,
		) as ApiResponse<EmailTemplateReturnType>;
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':publicId')
	async delete(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		await this.emailTemplatesService.delete(userId, publicId);

		return createApiResponse(
			HttpStatus.OK,
			'Email template deleted successfully',
			null,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':publicId/test-send')
	async testSend(
		@Param('publicId', ParseUUIDPipe) publicId: string,
		@Body() body: EmailTemplateTestSendDto,
		@Req() req: Request,
	): Promise<ApiResponse<null>> {
		const userId = req.user?.id;
		if (!userId) {
			throw new BadRequestException('User not authenticated');
		}

		const validated = emailTemplateTestSendSchema.safeParse(body);
		if (!validated.success) {
			const messages = (validated.error.issues as { message: string }[])
				.map(issue => issue.message)
				.join(', ');
			throw new BadRequestException(messages);
		}

		await this.emailTemplatesService.sendTest(userId, publicId, validated.data);

		return createApiResponse(
			HttpStatus.OK,
			'Test email sent successfully',
			null,
		);
	}
}

