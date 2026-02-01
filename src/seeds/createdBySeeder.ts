import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import schema from '../database/schema';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

async function seedCreatedBy() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(pool, { schema });

	console.log('🌱 Starting createdBy seeding...');

	try {
		// Fetch all transactions
		const transactions = await db.select().from(schema.transactions);

		console.log(`📊 Found ${transactions.length} transactions to update`);

		// Update each transaction's createdBy to borrowerId
		for (const transaction of transactions) {
			await db
				.update(schema.transactions)
				.set({ createdBy: transaction.borrowerId })
				.where(eq(schema.transactions.id, transaction.id));
		}

		console.log(`✅ Successfully updated createdBy for ${transactions.length} transactions`);
		console.log('✨ CreatedBy seeding completed successfully!');
	} catch (error) {
		console.error('❌ Error seeding createdBy:', error);
		throw error;
	} finally {
		await pool.end();
	}
}

// Run the seeder if executed directly
if (require.main === module) {
	seedCreatedBy()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error);
			process.exit(1);
		});
}

export default seedCreatedBy;
