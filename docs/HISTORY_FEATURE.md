# History Feature

This document describes the History feature for tracking user actions on transactions. For now, only
actions performed on the `transactions` model are recorded.

## Scope

- Record actions a user takes that affect a transaction.
- Store what action occurred, who performed it, when it happened, and optional contextual details.
- Only transaction-related actions are recorded at this time. No other models are tracked.

## Schema

Table: `transaction_histories`

Columns:

- `id` (serial, PK)
- `public_id` (uuid, unique): Public identifier for external references
- `transaction_id` (int, nullable, FK → `transactions.id`, **on delete set null**): Target
  transaction. This is nullable so history rows persist even after a transaction is deleted.
- `actor_user_id` (int, FK → `users.id`, on delete cascade): User who performed the action
- `action` (`transaction_history_action` enum): What happened
- `details` (jsonb, nullable): Optional structured metadata about the action (e.g., previous/new
  values, reason)
- `occurred_at` (timestamp, default now): When the action occurred
- `created_at`, `updated_at` (timestamps): Standard timestamps

Indexes:

- `transaction_id`
- `actor_user_id`
- `action`
- `occurred_at`

## Actions Enum

Enum: `transaction_history_action`

Initial values:

- `create`: A transaction was created
- `update`: A transaction was updated (generic changes)
- `status_change`: Status changed (e.g., pending → accepted)
- `delete`: Transaction deleted
- `partial_repay`: Partial repayment processed
- `complete_repay`: Transaction fully repaid
- `request_repay`: Repayment requested
- `accept_repay`: Repayment request accepted
- `reject_repay`: Repayment request rejected
- `add_payment`: A payment record was added for the transaction

You can extend this list as new actions are introduced.

## Relations

- `users -> transaction_histories`: one-to-many via `actor_user_id`
- `transactions -> transaction_histories`: one-to-many via `transaction_id` (nullable if transaction
  deleted)
- `transaction_histories -> users`: many-to-one (actor)
- `transaction_histories -> transactions`: many-to-one (target, nullable)

## Example Usage

- Insert a history record after a service method mutates a transaction:

```ts
await db.insert(schema.transactionHistories).values({
	transactionId: tx.id,
	actorUserId: currentUserId,
	action: 'status_change',
	details: { from: oldStatus, to: newStatus },
});
```

- Fetch transaction with recent history:

```ts
const data = await db.query.transactions.findFirst({
	where: eq(schema.transactions.publicId, publicId),
	with: {
		histories: {
			orderBy: (h, { desc }) => [desc(h.occurredAt)],
			limit: 20,
		},
	},
});
```

## Migrations

This project auto-generates `src/database/schema.ts` from model files before DB operations.

To apply changes:

1. Add/edit model files (done in this change):
   - `src/models/drizzle/history.model.ts`
   - `src/models/drizzle/enum.models.ts`
   - `src/models/drizzle/relation.model.ts`
2. Push to database:

```bash
pnpm db:push
```

Drizzle will create the enum and table with indexes. Use `pnpm db:studio` to inspect.
