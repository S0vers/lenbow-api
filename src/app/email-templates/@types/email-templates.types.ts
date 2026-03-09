export type EmailTemplateType = 'builder' | 'raw_html';

export type EmailBlockType =
	| 'hero'
	| 'text'
	| 'button'
	| 'image'
	| 'divider'
	| 'spacer'
	| 'two_column';

export interface EmailBlock {
	id: string;
	type: EmailBlockType;
	props: Record<string, unknown>;
	children?: EmailBlock[];
}

export interface EmailTemplateBase {
	id: string; // publicId
	workspaceId: string;
	name: string;
	subject: string;
	description?: string | null;
	isDefault?: boolean;
	category?: string | null;
	lastSentAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface BuilderEmailTemplate extends EmailTemplateBase {
	type: Extract<EmailTemplateType, 'builder'>;
	blocks: EmailBlock[];
}

export interface RawHtmlEmailTemplate extends EmailTemplateBase {
	type: Extract<EmailTemplateType, 'raw_html'>;
	html: string;
	css?: string | null;
}

export type EmailTemplateReturnType = BuilderEmailTemplate | RawHtmlEmailTemplate;

