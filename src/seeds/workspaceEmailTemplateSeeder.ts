import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import schema from '../database/schema';
import { users } from '../models/drizzle/auth.model';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

type BuilderTemplateSeed = {
	type: 'builder';
	name: string;
	subject: string;
	description?: string;
	category?: string | null;
	isDefault?: boolean;
	blocks: unknown;
};

type RawHtmlTemplateSeed = {
	type: 'raw_html';
	name: string;
	subject: string;
	description?: string;
	category?: string | null;
	isDefault?: boolean;
	html: string;
	css?: string | null;
};

type WorkspaceEmailTemplateSeed = BuilderTemplateSeed | RawHtmlTemplateSeed;

const DEFAULT_WORKSPACE_TEMPLATES: WorkspaceEmailTemplateSeed[] = [
	{
		type: 'builder',
		name: 'Welcome to Lenbow',
		subject: 'Welcome to Lenbow, {{firstName}}',
		description: 'Friendly welcome email you can personalize for new contacts.',
		category: 'Getting started',
		isDefault: true,
		blocks: [
			{
				id: 'hero',
				type: 'hero',
				props: {
					title: 'Welcome to Lenbow',
					subtitle:
						'A calmer way to remember who owes what. Share clear, friendly summaries instead of messy spreadsheets.',
					buttonLabel: 'Open your dashboard',
					buttonHref: '{{actionUrl}}',
					align: 'center',
					backgroundColor: '#020617',
					textColor: '#e5e7eb',
					buttonColor: '#22c55e',
					paddingY: 32,
					paddingX: 24,
				},
			},
			{
				id: 'intro-text',
				type: 'text',
				props: {
					content:
						'Hi {{firstName}},\n\nHere’s a quick snapshot of your current loans and repayments. You can tweak this email or duplicate it any time you need a clean update.',
					align: 'left',
					textColor: '#0f172a',
				},
			},
			{
				id: 'summary-heading',
				type: 'heading',
				props: {
					text: 'What you can see at a glance',
					level: 2,
					align: 'left',
					color: '#0f172a',
					marginBottom: 12,
				},
			},
			{
				id: 'summary-list',
				type: 'list',
				props: {
					items: [
						'Who you owe and how much.',
						'Who owes you and what is overdue.',
						'Friendly timelines instead of confusing spreadsheets.',
					],
					style: 'bullet',
				},
			},
			{
				id: 'primary-cta',
				type: 'button',
				props: {
					label: 'View details in Lenbow',
					href: '{{actionUrl}}',
					align: 'center',
					backgroundColor: '#22c55e',
					textColor: '#0f172a',
				},
			},
			{
				id: 'footer',
				type: 'footer',
				props: {
					text: 'You are receiving this email because you use Lenbow to keep track of personal loans and repayments.',
					unsubscribeUrl: '{{unsubscribeUrl}}',
				},
			},
		],
	},
	{
		type: 'builder',
		name: 'Friendly payment reminder',
		subject: 'Quick reminder about your payment, {{firstName}}',
		description: 'Gentle reminder template for upcoming or overdue payments.',
		category: 'Reminders',
		isDefault: false,
		blocks: [
			{
				id: 'reminder-heading',
				type: 'heading',
				props: {
					text: 'Just a quick reminder',
					level: 2,
					align: 'left',
					color: '#0f172a',
					marginBottom: 8,
				},
			},
			{
				id: 'reminder-text',
				type: 'text',
				props: {
					content:
						'Hi {{firstName}},\n\nThis is a friendly reminder about your upcoming payment.\n\nBelow is a short summary – feel free to adjust the copy before sending.',
					align: 'left',
					textColor: '#0f172a',
				},
			},
			{
				id: 'two-column-summary',
				type: 'two_column',
				props: {
					leftTitle: 'Loan details',
					leftContent:
						'Original amount: ${{amount}}\nAlready paid: ${{amountPaid}}\nRemaining: ${{remainingAmount}}',
					rightTitle: 'Key dates',
					rightContent:
						'Requested on: {{requestDate}}\nDue date: {{dueDate}}\nReference: {{transactionId}}',
					stackOnMobile: true,
				},
			},
			{
				id: 'reminder-cta',
				type: 'button',
				props: {
					label: 'View or update the agreement',
					href: '{{actionUrl}}',
					align: 'center',
					backgroundColor: '#0ea5e9',
					textColor: '#0f172a',
				},
			},
			{
				id: 'reminder-footer',
				type: 'footer',
				props: {
					text: 'If you have already made this payment, you can safely ignore this email.\n\nYou can unsubscribe from future reminders at any time.',
					unsubscribeUrl: '{{unsubscribeUrl}}',
				},
			},
		],
	},
	{
		type: 'raw_html',
		name: 'Simple announcement',
		subject: 'Update from {{workspaceName}}',
		description: 'Clean announcement layout for product updates or important notes.',
		category: 'Announcements',
		isDefault: false,
		html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Update from {{workspaceName}}</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #0b1120;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #f9fafb;
      }
      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #020617;
        border-radius: 16px;
        padding: 24px 24px 20px;
        border: 1px solid rgba(148, 163, 184, 0.35);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        background: rgba(56, 189, 248, 0.08);
        color: #7dd3fc;
      }
      h1 {
        margin: 16px 0 8px;
        font-size: 22px;
        line-height: 1.2;
      }
      p {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.6;
        color: #e5e7eb;
      }
      .card {
        margin-top: 16px;
        padding: 16px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.4);
      }
      .cta {
        display: inline-block;
        margin-top: 16px;
        padding: 9px 18px;
        border-radius: 999px;
        background: #22c55e;
        color: #022c22;
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
      }
      .meta {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid rgba(30, 64, 175, 0.6);
        font-size: 11px;
        color: #9ca3af;
      }
      a.meta-link {
        color: #7dd3fc;
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <span class="badge">Update</span>
      <h1>{{headline}}</h1>
      <p>Hi {{firstName}},</p>
      <p>
        Here&apos;s a quick update from <strong>{{workspaceName}}</strong>. You can tweak this
        template in the Lenbow builder to match your tone and brand.
      </p>
      <div class="card">
        <p><strong>What&apos;s new</strong></p>
        <p>{{body}}</p>
      </div>
      <a class="cta" href="{{actionUrl}}">Open in Lenbow</a>
      <div class="meta">
        <p>
          You are receiving this because you have an active relationship with {{workspaceName}}.
          If this wasn&apos;t meant for you, you can
          <a href="{{unsubscribeUrl}}" class="meta-link">unsubscribe here</a>.
        </p>
      </div>
    </div>
  </body>
</html>`,
	},
];

async function seedWorkspaceEmailTemplates() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(pool, { schema });

	console.log('🌱 Starting workspace email templates seeding...');

	try {
		const allUsers = await db.select().from(users);

		if (allUsers.length === 0) {
			console.log('ℹ️ No users found. Skipping workspace email template seeding.');
			return;
		}

		for (const user of allUsers) {
			console.log(`\n👤 Seeding templates for user ID ${user.id} (${user.email})`);

			for (const template of DEFAULT_WORKSPACE_TEMPLATES) {
				const existing = await db
					.select({ id: schema.workspaceEmailTemplates.id })
					.from(schema.workspaceEmailTemplates)
					.where(
						and(
							eq(schema.workspaceEmailTemplates.userId, user.id),
							eq(schema.workspaceEmailTemplates.name, template.name),
							eq(schema.workspaceEmailTemplates.type, template.type),
						),
					)
					.limit(1);

				const baseValues = {
					userId: user.id,
					name: template.name,
					subject: template.subject,
					description: template.description ?? null,
					type: template.type,
					isDefault: template.isDefault ?? false,
					category: template.category ?? null,
				};

				if (existing.length > 0) {
					console.log(`⏭  Skipping existing workspace template for user: ${template.name}`);
				} else {
					await db.insert(schema.workspaceEmailTemplates).values({
						...baseValues,
						blocks: template.type === 'builder' ? template.blocks : null,
						html: template.type === 'raw_html' ? template.html : null,
						css: template.type === 'raw_html' ? template.css ?? null : null,
					} as never);
					console.log(`✅ Seeded workspace template: ${template.name}`);
				}
			}
		}

		console.log('\n✨ Workspace email templates seeding completed successfully!');
	} catch (error) {
		console.error('❌ Error seeding workspace email templates:', error);
		throw error;
	} finally {
		await pool.end();
	}
}

// Run the seeder if executed directly
if (require.main === module) {
	seedWorkspaceEmailTemplates()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error);
			process.exit(1);
		});
}

export default seedWorkspaceEmailTemplates;

