import z from 'zod';

import {
	validateArray,
	validateEnum,
	validateString,
	validateUrl,
} from '../../core/validators/commonRules';

export const emailTemplateTypeEnum = ['builder', 'raw_html'] as const;

export type EmailTemplateType = (typeof emailTemplateTypeEnum)[number];

const emailTemplateTypeSchema = validateEnum('Template type', emailTemplateTypeEnum);

export type EmailBlockType =
	| 'hero'
	| 'text'
	| 'button'
	| 'image'
	| 'divider'
	| 'spacer'
	| 'two_column'
	| 'heading'
	| 'list'
	| 'quote'
	| 'social_icons'
	| 'footer';

const baseIdSchema = validateString('ID', { min: 1, max: 128 });
const baseNameSchema = validateString('Name', { min: 1, max: 128 });
const baseSubjectSchema = validateString('Subject', { min: 1, max: 200 });
const baseDescriptionSchema = validateString('Description', { max: 500 }).optional().nullable();

// -----------------------------
// Block schemas (discriminated)
// -----------------------------

const heroBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('hero'),
	props: z.object({
		title: validateString('Hero title', { min: 1, max: 120 }),
		subtitle: validateString('Hero subtitle', { max: 400 }).optional().nullable(),
		buttonLabel: validateString('Hero button label', { min: 1, max: 60 }),
		buttonHref: validateUrl('Hero button URL').optional().nullable(),
		align: validateEnum('Hero alignment', ['left', 'center', 'right'] as const).optional(),
		backgroundColor: validateString('Hero background color', { max: 32 }).optional(),
		textColor: validateString('Hero text color', { max: 32 }).optional(),
		buttonColor: validateString('Hero button color', { max: 32 }).optional(),
		paddingY: z.number().int().min(0).max(96).optional(),
		paddingX: z.number().int().min(0).max(96).optional(),
	}),
});

const textBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('text'),
	props: z.object({
		content: validateString('Text content', { min: 1, max: 4000 }),
		align: validateEnum('Text alignment', ['left', 'center', 'right'] as const).optional(),
		textColor: validateString('Text color', { max: 32 }).optional(),
	}),
});

const buttonBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('button'),
	props: z.object({
		label: validateString('Button label', { min: 1, max: 80 }),
		href: validateUrl('Button URL'),
		align: validateEnum('Button alignment', ['left', 'center', 'right'] as const).optional(),
		backgroundColor: validateString('Button background color', { max: 32 }).optional(),
		textColor: validateString('Button text color', { max: 32 }).optional(),
	}),
});

const imageBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('image'),
	props: z.object({
		src: validateUrl('Image URL'),
		alt: validateString('Image alt text', { max: 200 }).optional().nullable(),
		href: validateUrl('Image link URL').optional().nullable(),
		align: validateEnum('Image alignment', ['left', 'center', 'right'] as const).optional(),
		width: z.number().int().min(1).max(1200).optional(),
		borderRadius: z.number().int().min(0).max(48).optional(),
	}),
});

const dividerBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('divider'),
	props: z.object({
		color: validateString('Divider color', { max: 32 }).optional(),
		thickness: z.number().int().min(1).max(8).optional(),
		marginY: z.number().int().min(0).max(96).optional(),
	}),
});

const spacerBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('spacer'),
	props: z.object({
		height: z.number().int().min(4).max(128),
	}),
});

const twoColumnBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('two_column'),
	props: z.object({
		leftTitle: validateString('Left title', { max: 120 }).optional().nullable(),
		leftContent: validateString('Left content', { max: 2000 }).optional().nullable(),
		rightTitle: validateString('Right title', { max: 120 }).optional().nullable(),
		rightContent: validateString('Right content', { max: 2000 }).optional().nullable(),
		stackOnMobile: z.boolean().optional(),
	}),
});

const headingBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('heading'),
	props: z.object({
		text: validateString('Heading text', { min: 1, max: 200 }),
		level: z.number().int().min(1).max(3).optional(),
		align: validateEnum('Heading alignment', ['left', 'center', 'right'] as const).optional(),
		color: validateString('Heading color', { max: 32 }).optional(),
		marginBottom: z.number().int().min(0).max(64).optional(),
	}),
});

const listBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('list'),
	props: z.object({
		items: validateArray(
			'List items',
			validateString('List item', { min: 1, max: 200 }),
			{ min: 1, max: 20 },
		),
		style: validateEnum('List style', ['bullet', 'numbered'] as const).optional(),
	}),
});

const quoteBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('quote'),
	props: z.object({
		text: validateString('Quote text', { min: 1, max: 400 }),
		author: validateString('Quote author', { max: 120 }).optional().nullable(),
	}),
});

const socialIconsBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('social_icons'),
	props: z.object({
		items: validateArray(
			'Social links',
			z.object({
				type: validateEnum('Social network', ['twitter', 'facebook', 'linkedin', 'instagram', 'website'] as const),
				href: validateUrl('Social URL'),
			}),
			{ min: 1, max: 10 },
		),
		align: validateEnum('Social icons alignment', ['left', 'center', 'right'] as const).optional(),
	}),
});

const footerBlockSchema = z.object({
	id: baseIdSchema,
	type: z.literal('footer'),
	props: z.object({
		text: validateString('Footer text', { min: 1, max: 400 }),
		unsubscribeUrl: validateUrl('Unsubscribe URL').optional().nullable(),
	}),
});

export const EmailBlockSchema = z.discriminatedUnion('type', [
	heroBlockSchema,
	textBlockSchema,
	buttonBlockSchema,
	imageBlockSchema,
	dividerBlockSchema,
	spacerBlockSchema,
	twoColumnBlockSchema,
	headingBlockSchema,
	listBlockSchema,
	quoteBlockSchema,
	socialIconsBlockSchema,
	footerBlockSchema,
]);

// -----------------------------
// Template schemas
// -----------------------------

const baseTemplateSchema = z.object({
	name: baseNameSchema,
	subject: baseSubjectSchema,
	description: baseDescriptionSchema,
	type: emailTemplateTypeSchema,
	isDefault: z.boolean().optional(),
	category: validateString('Category', { max: 64 }).optional().nullable(),
});

export const builderTemplateSchema = baseTemplateSchema.extend({
	type: z.literal('builder'),
	blocks: validateArray('Blocks', EmailBlockSchema, { min: 0, max: 60 }),
});

export const rawHtmlTemplateSchema = baseTemplateSchema.extend({
	type: z.literal('raw_html'),
	html: validateString('HTML content', { min: 1, max: 20000 }),
	css: validateString('CSS content', { max: 8000 }).optional().nullable(),
});

export const createEmailTemplateSchema = z.discriminatedUnion('type', [
	builderTemplateSchema,
	rawHtmlTemplateSchema,
]);

export const updateEmailTemplateSchema = z.discriminatedUnion('type', [
	builderTemplateSchema.partial(),
	rawHtmlTemplateSchema.partial(),
]);

export const emailTemplatesQuerySchema = z.object({
	type: emailTemplateTypeSchema.optional(),
	search: validateString('Search', { max: 200 }).optional(),
	category: validateString('Category', { max: 64 }).optional(),
});

export const emailTemplateTestSendSchema = z.object({
	to: validateString('Recipient email', { min: 1, max: 255 }),
	sampleData: z.record(z.string(), z.any()).optional(),
});

export type CreateEmailTemplateDto = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateDto = z.infer<typeof updateEmailTemplateSchema>;
export type EmailTemplatesQuerySchemaType = z.infer<typeof emailTemplatesQuerySchema>;
export type EmailTemplateTestSendDto = z.infer<typeof emailTemplateTestSendSchema>;

