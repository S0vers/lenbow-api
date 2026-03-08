# Budget (Self-Accounting) Feature

## Overview

The Budget feature provides **personal** income and expense tracking, separate from the lend/borrow (loan) transactions. Users can record budget transactions, organize them with categories (system and custom), attach optional receipts, and define subscriptions that are processed by an external cron calling a dedicated API endpoint.

## Data Model

### Tables

- **budget_categories** – System categories (`user_id` NULL) and user-defined categories. Unique on `(user_id, slug)`.
- **budget_transactions** – Single in/out entries: `name`, `amount`, `type` (in | out), `currency`, `category_id`, `date`, `note`, `details`.
- **budget_transaction_receipts** – Junction linking transactions to `media` for receipt attachments.
- **budget_subscriptions** – Recurring templates: `name`, `amount`, `category_id`, `recurrence` (weekly | monthly | yearly), `next_run_at`, `is_active`.

### Enums

- `budget_transaction_type`: `in`, `out`
- `budget_recurrence`: `weekly`, `monthly`, `yearly`

## API Endpoints

All budget endpoints (except process-due) require **JWT authentication**.

### Budget Categories

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/budget-categories`      | List system + user's custom categories |
| GET    | `/budget-categories/:id`  | Get one category (by publicId)       |
| POST   | `/budget-categories`      | Create custom category               |
| PATCH  | `/budget-categories/:id`  | Update custom category               |
| DELETE | `/budget-categories/:id`  | Delete custom category (system read-only) |

### Budget Transactions

| Method | Endpoint                                              | Description                    |
|--------|--------------------------------------------------------|--------------------------------|
| GET    | `/budget-transactions`                                 | List with pagination & filters |
| GET    | `/budget-transactions/:id`                             | Get one transaction           |
| POST   | `/budget-transactions`                                 | Create transaction            |
| PATCH  | `/budget-transactions/:id`                             | Update transaction            |
| DELETE | `/budget-transactions/:id`                             | Delete transaction            |
| POST   | `/budget-transactions/:id/receipts/:mediaPublicId`     | Attach receipt (media by publicId) |
| DELETE | `/budget-transactions/:id/receipts/:mediaPublicId`     | Detach receipt                |

**List query params:** `page`, `limit`, `sortBy`, `sortOrder`, `from`, `to`, `type` (in | out), `categoryId` (category publicId).

### Budget Subscriptions

| Method | Endpoint                       | Description        |
|--------|--------------------------------|--------------------|
| GET    | `/budget-subscriptions`        | List user's subscriptions |
| GET    | `/budget-subscriptions/:id`    | Get one subscription      |
| POST   | `/budget-subscriptions`        | Create subscription        |
| PATCH  | `/budget-subscriptions/:id`   | Update subscription        |
| DELETE | `/budget-subscriptions/:id`   | Delete subscription        |

### Process Due Subscriptions (External Cron)

| Method | Endpoint                              | Auth              | Description |
|--------|----------------------------------------|-------------------|-------------|
| POST   | `/budget-subscriptions/process-due`    | `X-Cron-Secret`   | Process due subscriptions and create budget transactions |

**Authentication:** No JWT. Request must include header:

```http
X-Cron-Secret: <BUDGET_CRON_SECRET>
```

`BUDGET_CRON_SECRET` must be set in the API environment. If missing or invalid, the endpoint returns `401`.

**Response:** `200 OK` with body:

```json
{
  "statusCode": 200,
  "message": "Due subscriptions processed",
  "data": { "processed": 3 }
}
```

**Example (external cron):**

```bash
curl -X POST "https://your-api.com/budget-subscriptions/process-due" \
  -H "X-Cron-Secret: YOUR_BUDGET_CRON_SECRET"
```

Run this daily (e.g. via system cron, GitHub Actions, or a scheduler service).

## Environment

| Variable            | Required | Description |
|---------------------|----------|-------------|
| `BUDGET_CRON_SECRET` | No       | Secret for `POST /budget-subscriptions/process-due`. If set, the header `X-Cron-Secret` must match. If unset, the endpoint returns 401. |

## Seeding System Categories

To seed default budget categories (e.g. Shopping, Food, Transport):

```bash
pnpm db:seed:budget-categories
```

## Overview Integration

The **GET /overview** response includes optional budget data when the user has budget activity:

- **budgetSummary** – `totalIncomeThisMonth`, `totalExpenseThisMonth`, `balanceThisMonth` (current calendar month).
- **recentBudgetTransactions** – Latest budget transactions (same limit as `recentLimit`).

See [OVERVIEW_FEATURE.md](OVERVIEW_FEATURE.md) for the full overview response shape.
