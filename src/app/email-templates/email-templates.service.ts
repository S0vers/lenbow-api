import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { createApiResponse, type ApiResponse } from '../../core/api-response.interceptor';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';
import { BrevoService } from '../brevo/brevo.service';
import type {
	BuilderEmailTemplate,
	EmailBlock,
	EmailTemplateReturnType,
	RawHtmlEmailTemplate,
} from './@types/email-templates.types';
import type {
	CreateEmailTemplateDto,
	EmailTemplateTestSendDto,
	EmailTemplatesQuerySchemaType,
	UpdateEmailTemplateDto,
} from './email-templates.schema';

type WorkspaceEmailTemplateRow = typeof schema.workspaceEmailTemplates.$inferSelect & {
	userPublicId: string;
};

@Injectable()
export class EmailTemplatesService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
		private readonly brevoService: BrevoService,
	) {
		super(db);
	}

	private mapRowToReturnType(row: WorkspaceEmailTemplateRow): EmailTemplateReturnType {
		const base = {
			id: row.publicId,
			workspaceId: row.userPublicId,
			name: row.name,
			subject: row.subject,
			description: row.description,
			isDefault: row.isDefault,
			category: row.category,
			lastSentAt: row.lastSentAt,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};

		if (row.type === 'builder') {
			const blocks = (row.blocks as EmailBlock[] | null) ?? [];
			return {
				...(base as BuilderEmailTemplate),
				type: 'builder',
				blocks,
			};
		}

		return {
			...(base as RawHtmlEmailTemplate),
			type: 'raw_html',
			html: row.html ?? '',
			css: row.css ?? null,
		};
	}

	async list(
		userId: number,
		query: EmailTemplatesQuerySchemaType,
	): Promise<ApiResponse<EmailTemplateReturnType[]>> {
		const conditions = [eq(schema.workspaceEmailTemplates.userId, userId)];

		if (query.type) {
			conditions.push(eq(schema.workspaceEmailTemplates.type, query.type));
		}

		if (query.category) {
			conditions.push(eq(schema.workspaceEmailTemplates.category, query.category));
		}

		if (query.search) {
			const like = `%${query.search.toLowerCase()}%`;
			conditions.push(
				sql`(LOWER(${schema.workspaceEmailTemplates.name}) LIKE ${like} OR LOWER(${schema.workspaceEmailTemplates.subject}) LIKE ${like})`,
			);
		}

		const rows = await this.getDb()
			.select({
				id: schema.workspaceEmailTemplates.id,
				publicId: schema.workspaceEmailTemplates.publicId,
				userId: schema.workspaceEmailTemplates.userId,
				name: schema.workspaceEmailTemplates.name,
				subject: schema.workspaceEmailTemplates.subject,
				description: schema.workspaceEmailTemplates.description,
				type: schema.workspaceEmailTemplates.type,
				blocks: schema.workspaceEmailTemplates.blocks,
				html: schema.workspaceEmailTemplates.html,
				css: schema.workspaceEmailTemplates.css,
				isDefault: schema.workspaceEmailTemplates.isDefault,
				category: schema.workspaceEmailTemplates.category,
				lastSentAt: schema.workspaceEmailTemplates.lastSentAt,
				createdAt: schema.workspaceEmailTemplates.createdAt,
				updatedAt: schema.workspaceEmailTemplates.updatedAt,
				userPublicId: schema.users.publicId,
			})
			.from(schema.workspaceEmailTemplates)
			.innerJoin(schema.users, eq(schema.workspaceEmailTemplates.userId, schema.users.id))
			.where(and(...conditions))
			.orderBy(desc(schema.workspaceEmailTemplates.createdAt));

		const data = rows.map(r => this.mapRowToReturnType(r));

		return createApiResponse(
			200,
			'Email templates fetched successfully',
			data,
		);
	}

	async findOne(userId: number, publicId: string): Promise<EmailTemplateReturnType> {
		const row = await this.getDb()
			.select({
				id: schema.workspaceEmailTemplates.id,
				publicId: schema.workspaceEmailTemplates.publicId,
				userId: schema.workspaceEmailTemplates.userId,
				name: schema.workspaceEmailTemplates.name,
				subject: schema.workspaceEmailTemplates.subject,
				description: schema.workspaceEmailTemplates.description,
				type: schema.workspaceEmailTemplates.type,
				blocks: schema.workspaceEmailTemplates.blocks,
				html: schema.workspaceEmailTemplates.html,
				css: schema.workspaceEmailTemplates.css,
				isDefault: schema.workspaceEmailTemplates.isDefault,
				category: schema.workspaceEmailTemplates.category,
				lastSentAt: schema.workspaceEmailTemplates.lastSentAt,
				createdAt: schema.workspaceEmailTemplates.createdAt,
				updatedAt: schema.workspaceEmailTemplates.updatedAt,
				userPublicId: schema.users.publicId,
			})
			.from(schema.workspaceEmailTemplates)
			.innerJoin(schema.users, eq(schema.workspaceEmailTemplates.userId, schema.users.id))
			.where(
				and(
					eq(schema.workspaceEmailTemplates.publicId, publicId),
					eq(schema.workspaceEmailTemplates.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0] as WorkspaceEmailTemplateRow | undefined);

		if (!row) {
			throw new NotFoundException('Email template not found');
		}

		return this.mapRowToReturnType(row);
	}

	async create(
		userId: number,
		dto: CreateEmailTemplateDto,
	): Promise<EmailTemplateReturnType> {
		const [{ value: existingCount }] = await this.getDb()
			.select({ value: count() })
			.from(schema.workspaceEmailTemplates)
			.where(eq(schema.workspaceEmailTemplates.userId, userId));

		if (existingCount >= 50) {
			throw new BadRequestException('You have reached the maximum number of email templates.');
		}

		const insertData: typeof schema.workspaceEmailTemplates.$inferInsert = {
			userId,
			name: dto.name,
			subject: dto.subject,
			description: dto.description ?? null,
			type: dto.type,
			isDefault: dto.isDefault ?? false,
			category: dto.category ?? null,
			blocks: dto.type === 'builder' ? (dto.blocks as unknown) : null,
			html: dto.type === 'raw_html' ? dto.html : null,
			css: dto.type === 'raw_html' ? dto.css ?? null : null,
		};

		const [inserted] = await this.getDb()
			.insert(schema.workspaceEmailTemplates)
			.values(insertData)
			.returning();

		if (!inserted) {
			throw new BadRequestException('Failed to create email template');
		}

		return this.findOne(userId, inserted.publicId);
	}

	async update(
		userId: number,
		publicId: string,
		dto: UpdateEmailTemplateDto,
	): Promise<EmailTemplateReturnType> {
		const existing = await this.getDb()
			.select()
			.from(schema.workspaceEmailTemplates)
			.where(
				and(
					eq(schema.workspaceEmailTemplates.publicId, publicId),
					eq(schema.workspaceEmailTemplates.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) {
			throw new NotFoundException('Email template not found');
		}

		const updateData: Partial<typeof schema.workspaceEmailTemplates.$inferInsert> = {};

		if (dto.name !== undefined) updateData.name = dto.name;
		if (dto.subject !== undefined) updateData.subject = dto.subject;
		if (dto.description !== undefined) updateData.description = dto.description ?? null;
		if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;
		if (dto.category !== undefined) updateData.category = dto.category ?? null;

		if (dto.type && dto.type !== existing.type) {
			updateData.type = dto.type;
			if (dto.type === 'builder') {
				updateData.blocks = (dto as any).blocks ?? [];
				updateData.html = null;
				updateData.css = null;
			} else {
				updateData.blocks = null;
				updateData.html = (dto as any).html ?? '';
				updateData.css = (dto as any).css ?? null;
			}
		} else {
			// Type did not change – update per current type
			if (existing.type === 'builder' && 'blocks' in dto && dto.blocks !== undefined) {
				updateData.blocks = dto.blocks as unknown;
			}
			if (existing.type === 'raw_html') {
				if ('html' in dto && dto.html !== undefined) {
					updateData.html = dto.html;
				}
				if ('css' in dto && dto.css !== undefined) {
					updateData.css = dto.css ?? null;
				}
			}
		}

		if (Object.keys(updateData).length === 0) {
			return this.findOne(userId, publicId);
		}

		await this.getDb()
			.update(schema.workspaceEmailTemplates)
			.set(updateData as never)
			.where(
				and(
					eq(schema.workspaceEmailTemplates.publicId, publicId),
					eq(schema.workspaceEmailTemplates.userId, userId),
				),
			);

		return this.findOne(userId, publicId);
	}

	async delete(userId: number, publicId: string): Promise<void> {
		const existing = await this.getDb()
			.select()
			.from(schema.workspaceEmailTemplates)
			.where(
				and(
					eq(schema.workspaceEmailTemplates.publicId, publicId),
					eq(schema.workspaceEmailTemplates.userId, userId),
				),
			)
			.limit(1)
			.then(r => r[0]);

		if (!existing) {
			throw new NotFoundException('Email template not found');
		}

		await this.getDb()
			.delete(schema.workspaceEmailTemplates)
			.where(eq(schema.workspaceEmailTemplates.id, existing.id));
	}

	private renderForSend(
		template: EmailTemplateReturnType,
		data: Record<string, unknown>,
	): { subject: string; html: string; text?: string } {
		if (template.type === 'builder') {
			const title = template.subject || template.name;
			const html = `<html><body><h1>${this.escapeHtml(
				title,
			)}</h1><p>This is a placeholder builder email. Preview is richer in the dashboard UI.</p></body></html>`;
			const text = `${title}\n\nThis is a placeholder rendered builder template.`;
			return { subject: template.subject, html, text };
		}

		const interpolate = (input: string | null | undefined) => {
			if (!input) return '';
			return input.replace(/\{\{(\w+)\}\}/g, (_, key) => {
				const value = data[key];
				return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
			});
		};

		const rawTemplate = template;
		const interpolatedHtml = interpolate(rawTemplate.html);
		const interpolatedCss = interpolate(rawTemplate.css ?? '');
		const combined =
			interpolatedCss.trim().length > 0
				? `<style>${interpolatedCss}</style>\n${interpolatedHtml}`
				: interpolatedHtml;
		const html = this.sanitizeEmailHtml(combined);
		const text = `${template.subject}\n\n${interpolatedHtml.replace(/<[^>]+>/g, '')}`;

		return { subject: template.subject, html, text };
	}

	private escapeHtml(value: string) {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	private sanitizeEmailHtml(html: string): string {
		let output = html.replace(/<\s*script[\s\S]*?<\/\s*script\s*>/gi, '');

		output = output.replace(/\son[a-z]+\s*=\s*"(.*?)"/gi, '');
		output = output.replace(/\son[a-z]+\s*=\s*'(.*?)'/gi, '');

		output = output.replace(
			/\s(href|src)\s*=\s*"(.*?)"/gi,
			(_, attr, value) => {
				const safe = typeof value === 'string' ? value : String(value);
				return ` ${attr}="${this.sanitizeUrl(safe)}"`;
			},
		);
		output = output.replace(
			/\s(href|src)\s*=\s*'(.*?)'/gi,
			(_, attr, value) => {
				const safe = typeof value === 'string' ? value : String(value);
				return ` ${attr}="${this.sanitizeUrl(safe)}"`;
			},
		);

		return output;
	}

	private sanitizeUrl(raw: string): string {
		try {
			const url = new URL(raw, 'https://placeholder.local');
			const allowed = ['http:', 'https:', 'mailto:'];
			if (!allowed.includes(url.protocol)) {
				return '#';
			}
			return raw;
		} catch {
			return '#';
		}
	}

	async sendTest(
		userId: number,
		publicId: string,
		dto: EmailTemplateTestSendDto,
	): Promise<void> {
		const template = await this.findOne(userId, publicId);

		const rendered = this.renderForSend(template, dto.sampleData ?? {});

		await this.brevoService.sendEmail({
			to: [{ email: dto.to }],
			subject: rendered.subject,
			htmlContent: rendered.html,
			textContent: rendered.text,
		});

		await this.getDb()
			.update(schema.workspaceEmailTemplates)
			.set({ lastSentAt: new Date() })
			.where(eq(schema.workspaceEmailTemplates.publicId, publicId));
	}
}

