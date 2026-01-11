import * as brevo from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType } from '../../core/env';
import { TemplateService } from '../template/template.service';

@Injectable()
export class BrevoService {
	private transactionalApi: brevo.TransactionalEmailsApi;

	constructor(
		private readonly templates: TemplateService,
		private configService: ConfigService<EnvType, true>,
	) {
		this.transactionalApi = new brevo.TransactionalEmailsApi();

		// Brevo SDK uses this auth name:
		// transactionalApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, YOUR_KEY)
		// (auth naming comes from SDK OpenAPI generation)
		this.transactionalApi.setApiKey(
			brevo.TransactionalEmailsApiApiKeys.apiKey,
			this.configService.get('BREVO_API_KEY', { infer: true }),
		);
	}

	async sendEmail(params: {
		to: { email: string; name?: string }[];
		subject: string;
		htmlContent?: string;
		textContent?: string;
		replyTo?: { email: string; name?: string };
	}) {
		const email = new brevo.SendSmtpEmail();

		email.sender = {
			email: this.configService.get('BREVO_SENDER_EMAIL', { infer: true }),
			name: this.configService.get('BREVO_SENDER_NAME', { infer: true }),
		};

		email.to = params.to;
		email.subject = params.subject;

		// Provide either htmlContent or templateId (templateId approach shown below)
		if (params.htmlContent) email.htmlContent = params.htmlContent;
		if (params.textContent) email.textContent = params.textContent;
		if (params.replyTo) email.replyTo = params.replyTo;

		// Sends using Brevo "Send a transactional email" endpoint under the hood
		// /v3/smtp/email
		return this.transactionalApi.sendTransacEmail(email);
	}

	async sendTemplateEmail(params: {
		to: { email: string; name?: string }[];
		templateId: number;
		params?: Record<string, any>; // template variables
		subject?: string; // optional (template may already define it)
	}) {
		const email = new brevo.SendSmtpEmail();

		email.sender = {
			email: this.configService.get('BREVO_SENDER_EMAIL', { infer: true }),
			name: this.configService.get('BREVO_SENDER_NAME', { infer: true }),
		};

		email.to = params.to;
		email.templateId = params.templateId;
		if (params.params) email.params = params.params;
		if (params.subject) email.subject = params.subject;

		return this.transactionalApi.sendTransacEmail(email);
	}

	async sendFromTemplate(opts: {
		templateKey: string;
		to: { email: string; name?: string }[];
		params: Record<string, any>;
		replyTo?: { email: string; name?: string };
	}) {
		const rendered = await this.templates.render(opts.templateKey, opts.params);

		const email = new brevo.SendSmtpEmail();
		email.sender = {
			email: this.configService.get('BREVO_SENDER_EMAIL', { infer: true }),
			name: this.configService.get('BREVO_SENDER_NAME', { infer: true }),
		};

		email.to = opts.to;
		email.subject = rendered.subject;
		email.htmlContent = rendered.html;
		if (rendered.text) email.textContent = rendered.text;
		if (opts.replyTo) email.replyTo = opts.replyTo;

		// Optional: include template version somewhere for debugging
		email.headers = { 'X-Template-Version': String(rendered.version) };

		return this.transactionalApi.sendTransacEmail(email);
	}
}
