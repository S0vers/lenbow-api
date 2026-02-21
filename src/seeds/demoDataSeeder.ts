import * as bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import schema from '../database/schema';
import { users } from '../models/drizzle/auth.model';
import { contacts, payments, transactions } from '../models/drizzle/transactions.model';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

interface DemoUser {
	name: string;
	email: string;
	password: string;
	phone: string;
}

const demoUsers: DemoUser[] = [
	{
		name: 'Demo User One',
		email: 'demo1@example.com',
		password: 'Demo123!',
		phone: '+1234567001',
	},
	{
		name: 'Demo User Two',
		email: 'demo2@example.com',
		password: 'Demo123!',
		phone: '+1234567002',
	},
	{
		name: 'Demo User Three',
		email: 'demo3@example.com',
		password: 'Demo123!',
		phone: '+1234567003',
	},
	{
		name: 'Demo User Four',
		email: 'demo4@example.com',
		password: 'Demo123!',
		phone: '+1234567004',
	},
	{
		name: 'Demo User Five',
		email: 'demo5@example.com',
		password: 'Demo123!',
		phone: '+1234567005',
	},
];

// Helper function to calculate dates
const daysAgo = (days: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
};

const daysFromNow = (days: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date;
};

async function seedDemoData() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(pool, { schema });

	console.log('🌱 Starting demo data seeding...');

	try {
		// Step 1: Seed demo users
		console.log('\n👥 Seeding demo users...');
		const userIds: number[] = [];

		for (const demoUser of demoUsers) {
			// Check if user already exists
			const existing = await db
				.select()
				.from(users)
				.where(eq(users.email, demoUser.email))
				.limit(1);

			let userId: number;

			if (existing.length > 0) {
				// Update existing user
				const hashedPassword = await bcrypt.hash(demoUser.password, 10);
				const [updated] = await db
					.update(users)
					.set({
						name: demoUser.name,
						password: hashedPassword,
						phone: demoUser.phone,
						emailVerified: true,
						currencyCode: 'USD',
						receiveTransactionEmails: false,
						updatedAt: new Date(),
					})
					.where(eq(users.email, demoUser.email))
					.returning({ id: users.id });
				userId = updated.id;
				console.log(`🔄 Updated user: ${demoUser.email} (ID: ${userId})`);
			} else {
				// Insert new user
				const hashedPassword = await bcrypt.hash(demoUser.password, 10);
				const [inserted] = await db
					.insert(users)
					.values({
						name: demoUser.name,
						email: demoUser.email,
						password: hashedPassword,
						phone: demoUser.phone,
						emailVerified: true,
						currencyCode: 'USD',
						receiveTransactionEmails: false,
					})
					.returning({ id: users.id });
				userId = inserted.id;
				console.log(`✅ Created user: ${demoUser.email} (ID: ${userId})`);
			}

			userIds.push(userId);
		}

		// Step 2: Seed contact relationships
		console.log('\n👥 Seeding contact relationships...');
		const contactPairs = [
			[0, 1], // User 1 ↔ User 2
			[0, 2], // User 1 ↔ User 3
			[1, 3], // User 2 ↔ User 4
			[2, 4], // User 3 ↔ User 5
			[3, 4], // User 4 ↔ User 5
		];

		for (const [idx1, idx2] of contactPairs) {
			const userId1 = userIds[idx1];
			const userId2 = userIds[idx2];

			// Check if contact already exists
			const existing = await db
				.select()
				.from(contacts)
				.where(and(eq(contacts.requestedUserId, userId1), eq(contacts.connectedUserId, userId2)))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(contacts).values({
					requestedUserId: userId1,
					connectedUserId: userId2,
				});
				console.log(`✅ Created contact: User ${userId1} ↔ User ${userId2}`);
			} else {
				console.log(`🔄 Contact already exists: User ${userId1} ↔ User ${userId2}`);
			}
		}

		// Step 3: Seed transactions
		console.log('\n💰 Seeding transactions...');

		interface TransactionData {
			borrowerId: number;
			lenderId: number;
			amount: number;
			amountPaid: number;
			remainingAmount: number;
			reviewAmount: number;
			status:
				| 'pending'
				| 'accepted'
				| 'rejected'
				| 'partially_paid'
				| 'requested_repay'
				| 'completed';
			description: string;
			rejectionReason?: string;
			dueDate: Date;
			requestDate: Date;
			acceptedAt?: Date;
			completedAt?: Date;
			rejectedAt?: Date;
			createdBy: number;
		}

		const transactionData: TransactionData[] = [
			// Transaction 1: Pending
			{
				borrowerId: userIds[0],
				lenderId: userIds[1],
				amount: 1000,
				amountPaid: 0,
				remainingAmount: 1000,
				reviewAmount: 0,
				status: 'pending',
				description: 'Initial loan request for new laptop',
				dueDate: daysFromNow(30),
				requestDate: new Date(),
				createdBy: userIds[0],
			},
			// Transaction 2: Accepted
			{
				borrowerId: userIds[1],
				lenderId: userIds[2],
				amount: 500,
				amountPaid: 0,
				remainingAmount: 500,
				reviewAmount: 0,
				status: 'accepted',
				description: 'Emergency medical expenses',
				dueDate: daysFromNow(60),
				requestDate: daysAgo(3),
				acceptedAt: daysAgo(2),
				createdBy: userIds[1],
			},
			// Transaction 3: Rejected
			{
				borrowerId: userIds[2],
				lenderId: userIds[0],
				amount: 2000,
				amountPaid: 0,
				remainingAmount: 2000,
				reviewAmount: 0,
				status: 'rejected',
				description: 'Business investment loan',
				rejectionReason: 'Insufficient funds available',
				dueDate: daysFromNow(90),
				requestDate: daysAgo(2),
				rejectedAt: daysAgo(1),
				createdBy: userIds[2],
			},
			// Transaction 4: Partially Paid
			{
				borrowerId: userIds[3],
				lenderId: userIds[1],
				amount: 1500,
				amountPaid: 700,
				remainingAmount: 800,
				reviewAmount: 0,
				status: 'partially_paid',
				description: 'Home renovation loan',
				dueDate: daysFromNow(45),
				requestDate: daysAgo(16),
				acceptedAt: daysAgo(15),
				createdBy: userIds[3],
			},
			// Transaction 5: Requested Repay
			{
				borrowerId: userIds[4],
				lenderId: userIds[2],
				amount: 800,
				amountPaid: 0,
				remainingAmount: 800,
				reviewAmount: 300,
				status: 'requested_repay',
				description: 'Car repair expenses',
				dueDate: daysFromNow(20),
				requestDate: daysAgo(11),
				acceptedAt: daysAgo(10),
				createdBy: userIds[4],
			},
			// Transaction 6: Completed
			{
				borrowerId: userIds[0],
				lenderId: userIds[3],
				amount: 600,
				amountPaid: 600,
				remainingAmount: 0,
				reviewAmount: 0,
				status: 'completed',
				description: 'Vacation trip funding',
				dueDate: daysFromNow(15),
				requestDate: daysAgo(31),
				acceptedAt: daysAgo(30),
				completedAt: daysAgo(5),
				createdBy: userIds[0],
			},
		];

		const transactionIds: number[] = [];

		for (const txData of transactionData) {
			// Check if transaction already exists with same borrower and lender
			const existing = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.borrowerId, txData.borrowerId),
						eq(transactions.lenderId, txData.lenderId),
						eq(transactions.description, txData.description),
					),
				)
				.limit(1);

			let transactionId: number;

			if (existing.length > 0) {
				// Update existing transaction
				const [updated] = await db
					.update(transactions)
					.set({
						amount: txData.amount,
						amountPaid: txData.amountPaid,
						remainingAmount: txData.remainingAmount,
						reviewAmount: txData.reviewAmount,
						status: txData.status,
						description: txData.description,
						rejectionReason: txData.rejectionReason,
						dueDate: txData.dueDate,
						requestDate: txData.requestDate,
						acceptedAt: txData.acceptedAt,
						completedAt: txData.completedAt,
						rejectedAt: txData.rejectedAt,
						currency: {
							code: 'USD',
							name: 'US Dollar',
							symbol: '$',
						},
						updatedAt: new Date(),
					})
					.where(eq(transactions.id, existing[0].id))
					.returning({ id: transactions.id });
				transactionId = updated.id;
				console.log(`🔄 Updated transaction: ${txData.description} (ID: ${transactionId})`);
			} else {
				// Insert new transaction
				const [inserted] = await db
					.insert(transactions)
					.values({
						borrowerId: txData.borrowerId,
						lenderId: txData.lenderId,
						amount: txData.amount,
						amountPaid: txData.amountPaid,
						remainingAmount: txData.remainingAmount,
						reviewAmount: txData.reviewAmount,
						status: txData.status,
						description: txData.description,
						rejectionReason: txData.rejectionReason,
						dueDate: txData.dueDate,
						requestDate: txData.requestDate,
						acceptedAt: txData.acceptedAt,
						completedAt: txData.completedAt,
						rejectedAt: txData.rejectedAt,
						createdBy: txData.createdBy,
						currency: {
							code: 'USD',
							name: 'US Dollar',
							symbol: '$',
						},
					})
					.returning({ id: transactions.id });
				transactionId = inserted.id;
				console.log(`✅ Created transaction: ${txData.description} (ID: ${transactionId})`);
			}

			transactionIds.push(transactionId);
		}

		// Step 4: Seed payment records
		console.log('\n💳 Seeding payment records...');

		// Payments for Transaction 4 (Partially Paid - index 3)
		const paymentsForTx4 = [
			{
				transactionId: transactionIds[3],
				amount: 300,
				paymentDate: daysAgo(10),
				notes: 'First installment',
			},
			{
				transactionId: transactionIds[3],
				amount: 250,
				paymentDate: daysAgo(5),
				notes: 'Second installment',
			},
			{
				transactionId: transactionIds[3],
				amount: 150,
				paymentDate: daysAgo(2),
				notes: 'Third installment',
			},
		];

		// Payments for Transaction 6 (Completed - index 5)
		const paymentsForTx6 = [
			{
				transactionId: transactionIds[5],
				amount: 400,
				paymentDate: daysAgo(20),
				notes: 'Partial repayment',
			},
			{
				transactionId: transactionIds[5],
				amount: 200,
				paymentDate: daysAgo(5),
				notes: 'Final payment - loan completed',
			},
		];

		const allPayments = [...paymentsForTx4, ...paymentsForTx6];

		for (const paymentData of allPayments) {
			// Delete existing payments for this transaction to avoid duplicates
			await db.delete(payments).where(eq(payments.transactionId, paymentData.transactionId));
		}

		// Insert all payments fresh
		for (const paymentData of allPayments) {
			await db.insert(payments).values(paymentData);
			console.log(
				`✅ Created payment: $${paymentData.amount} for transaction ${paymentData.transactionId}`,
			);
		}

		console.log('\n✨ Demo data seeding completed successfully!');
		console.log('\n📊 Summary:');
		console.log(`   • ${userIds.length} demo users created/updated`);
		console.log(`   • ${contactPairs.length} contact relationships established`);
		console.log(`   • ${transactionIds.length} transactions created (all 6 statuses)`);
		console.log(`   • ${allPayments.length} payment records created`);
		console.log('\n🔐 Login credentials for testing:');
		console.log('   Email: demo1@example.com (or demo2, demo3, demo4, demo5)');
		console.log('   Password: Demo123!');
	} catch (error) {
		console.error('❌ Error seeding demo data:', error);
		throw error;
	} finally {
		await pool.end();
	}
}

// Run the seeder if executed directly
if (require.main === module) {
	seedDemoData()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error);
			process.exit(1);
		});
}

export default seedDemoData;
