import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import schema from '../database/schema';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const SYSTEM_CATEGORIES = [
	{ name: 'Shopping', slug: 'shopping', icon: 'ShoppingBag' },
	{ name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed' },
	{ name: 'Transport', slug: 'transport', icon: 'Car' },
	{ name: 'Entertainment', slug: 'entertainment', icon: 'Film' },
	{ name: 'Movie', slug: 'movie', icon: 'Clapperboard' },
	{ name: 'Bills & Utilities', slug: 'bills-utilities', icon: 'Receipt' },
	{ name: 'Healthcare', slug: 'healthcare', icon: 'HeartPulse' },
	{ name: 'Income', slug: 'income', icon: 'TrendingUp' },
];

async function seedBudgetCategories() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(pool, { schema });

	console.log('🌱 Starting budget categories seeding...');

	try {
		for (const category of SYSTEM_CATEGORIES) {
			const existing = await db
				.select()
				.from(schema.budgetCategories)
				.where(
					and(
						eq(schema.budgetCategories.slug, category.slug),
						isNull(schema.budgetCategories.userId),
					),
				)
				.limit(1);

			if (existing.length > 0) {
				await db
					.update(schema.budgetCategories)
					.set({
						name: category.name,
						icon: category.icon,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(schema.budgetCategories.slug, category.slug),
							isNull(schema.budgetCategories.userId),
						),
					);
				console.log(`🔄 Updated category: ${category.slug}`);
			} else {
				await db.insert(schema.budgetCategories).values({
					userId: null,
					name: category.name,
					slug: category.slug,
					icon: category.icon,
				});
				console.log(`✅ Seeded category: ${category.slug}`);
			}
		}

		console.log('✨ Budget categories seeding completed successfully!');
	} catch (error) {
		console.error('❌ Error seeding budget categories:', error);
		throw error;
	} finally {
		await pool.end();
	}
}

// Run the seeder if executed directly
if (require.main === module) {
	seedBudgetCategories()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error);
			process.exit(1);
		});
}

export default seedBudgetCategories;
