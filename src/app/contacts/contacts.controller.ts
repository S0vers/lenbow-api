import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import type { ConnectedContactList } from './@types/contacts.types';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
	constructor(
		private readonly contactsService: ContactsService,
		private readonly authService: AuthService,
	) {}

	@UseGuards(JwtAuthGuard)
	@Get('/connected')
	async getConnectedContactList(@Req() req: Request): Promise<ApiResponse<ConnectedContactList[]>> {
		const currentUserId = req.user?.id;

		const contacts = await this.contactsService.getConnectedContacts(currentUserId!);

		return createApiResponse(HttpStatus.OK, 'Connected contacts fetched successfully', contacts);
	}

	@UseGuards(JwtAuthGuard)
	@Get('/:publicId')
	async getContactByPublicId(
		@Param('publicId', ParseUUIDPipe) publicId: string,
	): Promise<ApiResponse<ConnectedContactList>> {
		const user = await this.authService.findUserByPublicId(publicId);

		const contact: ConnectedContactList = {
			userId: user.publicId,
			name: user.name,
			email: user.email,
			image: user.image,
			phone: user.phone,
			connectedAt: user.createdAt,
		};

		return createApiResponse(HttpStatus.OK, 'Contact fetched successfully', contact);
	}
}
