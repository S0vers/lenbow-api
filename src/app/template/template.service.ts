import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as Handlebars from 'handlebars';
import { DATABASE_CONNECTION } from '../../database/connection';
import schema from '../../database/schema';
import DrizzleService from '../../database/service';

type CompiledParts = {
	subject: Handlebars.TemplateDelegate;
	html: Handlebars.TemplateDelegate;
	text?: Handlebars.TemplateDelegate;
	version: number;
};

@Injectable()
export class TemplateService extends DrizzleService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		db: NodePgDatabase<typeof schema>,
	) {
		super(db);
	}

	private cache = new Map<string, CompiledParts>(); // key => compiled

	async getActiveTemplateCompiled(templateKey: string): Promise<CompiledParts> {
		const cached = this.cache.get(templateKey);
		if (cached) return cached;

		const tpl = await this.getDb().query.emailTemplates.findFirst({
			where: eq(schema.emailTemplates.key, templateKey),
		});

		if (!tpl) {
			throw new NotFoundException(`No active email template found for key="${templateKey}"`);
		}

		const compiled: CompiledParts = {
			version: tpl.version,
			subject: Handlebars.compile(tpl.subject),
			html: Handlebars.compile(tpl.html),
			text: tpl.text ? Handlebars.compile(tpl.text) : undefined,
		};

		this.cache.set(templateKey, compiled);
		return compiled;
	}

	// Call this after updating a template or via an admin endpoint
	invalidate(templateKey: string) {
		this.cache.delete(templateKey);
	}

	async render(templateKey: string, params: Record<string, any>) {
		const tpl = await this.getActiveTemplateCompiled(templateKey);
		return {
			subject: tpl.subject(params),
			html: tpl.html(params),
			text: tpl.text ? tpl.text(params) : undefined,
			version: tpl.version,
		};
	}
}
