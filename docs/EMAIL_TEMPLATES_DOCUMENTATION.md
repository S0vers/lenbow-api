# Email Templates Documentation

This document describes all email templates used in the Lenbow loan application system and the
dynamic values (template variables) each template expects.

## Overview

All email templates use [Handlebars](https://handlebarsjs.com/) syntax for dynamic content
rendering. Templates support conditional blocks using `{{#if variable}}...{{/if}}` syntax.

---

## Template: Request Send

**File:** `requests-send.html` **Template Key:** `request_send` **Triggered When:** A borrower sends
a new loan request to a lender **Recipient:** Lender **Subject:**
`{{borrowerName}} requested loan from you`

### Dynamic Values

| Variable        | Type        | Required | Description                                   |
| --------------- | ----------- | -------- | --------------------------------------------- |
| `lenderName`    | string      | Yes      | Name of the person receiving the loan request |
| `borrowerName`  | string      | Yes      | Name of the person requesting the loan        |
| `amount`        | number      | Yes      | The loan amount being requested               |
| `requestDate`   | string/date | Yes      | Date when the request was created             |
| `dueDate`       | string/date | No       | Optional due date for loan repayment          |
| `description`   | string      | No       | Optional description/reason for the loan      |
| `transactionId` | string      | Yes      | Unique transaction identifier (UUID)          |
| `actionUrl`     | string      | Yes      | URL to review the request in the dashboard    |
| `supportEmail`  | string      | Yes      | Support contact email address                 |
| `year`          | number      | Yes      | Current year for copyright notice             |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'request_send',
	to: [{ email: lender.email, name: lender.name }],
	params: {
		lenderName: 'John Doe',
		borrowerName: 'Jane Smith',
		amount: 5000,
		requestDate: '2026-01-22',
		dueDate: '2026-02-22',
		description: 'Emergency medical expenses',
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/requests?search=abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Request Approved

**File:** `requests-approved.html` **Template Key:** `request_approved` **Triggered When:** A lender
approves a loan request **Recipient:** Borrower **Subject:** `Your Loan Request Has Been Approved`

### Dynamic Values

| Variable        | Type        | Required | Description                                    |
| --------------- | ----------- | -------- | ---------------------------------------------- |
| `borrowerName`  | string      | Yes      | Name of the person who requested the loan      |
| `lenderName`    | string      | Yes      | Name of the person who approved the request    |
| `amount`        | number      | Yes      | The approved loan amount                       |
| `requestDate`   | string/date | Yes      | Original request date                          |
| `acceptedAt`    | string/date | Yes      | Date when the request was approved             |
| `dueDate`       | string/date | No       | Optional due date for loan repayment           |
| `description`   | string      | No       | Optional description from the original request |
| `transactionId` | string      | Yes      | Unique transaction identifier (UUID)           |
| `actionUrl`     | string      | Yes      | URL to view transaction details                |
| `supportEmail`  | string      | Yes      | Support contact email address                  |
| `year`          | number      | Yes      | Current year for copyright notice              |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'request_approved',
	to: [{ email: borrower.email, name: borrower.name }],
	params: {
		borrowerName: 'Jane Smith',
		lenderName: 'John Doe',
		amount: 5000,
		requestDate: '2026-01-22',
		acceptedAt: '2026-01-23',
		dueDate: '2026-02-22',
		description: 'Emergency medical expenses',
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Request Rejected

**File:** `requests-rejected.html` **Template Key:** `request_rejected` **Triggered When:** A lender
rejects a loan request **Recipient:** Borrower **Subject:** `Your Loan Request Status Update`

### Dynamic Values

| Variable          | Type        | Required | Description                                    |
| ----------------- | ----------- | -------- | ---------------------------------------------- |
| `borrowerName`    | string      | Yes      | Name of the person who requested the loan      |
| `lenderName`      | string      | Yes      | Name of the person who rejected the request    |
| `amount`          | number      | Yes      | The requested loan amount                      |
| `requestDate`     | string/date | Yes      | Original request date                          |
| `rejectedAt`      | string/date | Yes      | Date when the request was rejected             |
| `rejectionReason` | string      | No       | Optional reason for rejection                  |
| `description`     | string      | No       | Optional description from the original request |
| `transactionId`   | string      | Yes      | Unique transaction identifier (UUID)           |
| `actionUrl`       | string      | Yes      | URL to view transaction details                |
| `supportEmail`    | string      | Yes      | Support contact email address                  |
| `year`            | number      | Yes      | Current year for copyright notice              |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'request_rejected',
	to: [{ email: borrower.email, name: borrower.name }],
	params: {
		borrowerName: 'Jane Smith',
		lenderName: 'John Doe',
		amount: 5000,
		requestDate: '2026-01-22',
		rejectedAt: '2026-01-23',
		rejectionReason: 'Unable to provide loan at this time',
		description: 'Emergency medical expenses',
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Repayment Requested

**File:** `repayment-requested.html` **Template Key:** `repayment_requested` **Triggered When:** A
borrower requests to repay (full or partial) a loan **Recipient:** Lender **Subject:**
`{{borrowerName}} wants to repay the loan`

### Dynamic Values

| Variable          | Type   | Required | Description                                      |
| ----------------- | ------ | -------- | ------------------------------------------------ |
| `lenderName`      | string | Yes      | Name of the lender who will review the repayment |
| `borrowerName`    | string | Yes      | Name of the borrower making the repayment        |
| `reviewAmount`    | number | Yes      | The amount being submitted for repayment         |
| `amount`          | number | Yes      | Original loan amount                             |
| `amountPaid`      | number | Yes      | Total amount paid so far (before this repayment) |
| `remainingAmount` | number | Yes      | Remaining balance after current payments         |
| `transactionId`   | string | Yes      | Unique transaction identifier (UUID)             |
| `actionUrl`       | string | Yes      | URL to review and approve/reject repayment       |
| `supportEmail`    | string | Yes      | Support contact email address                    |
| `year`            | number | Yes      | Current year for copyright notice                |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'repayment_requested',
	to: [{ email: lender.email, name: lender.name }],
	params: {
		lenderName: 'John Doe',
		borrowerName: 'Jane Smith',
		reviewAmount: 2000,
		amount: 5000,
		amountPaid: 1000,
		remainingAmount: 4000,
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Repayment Accepted

**File:** `repayment-accepted.html` **Template Key:** `repayment_accepted` **Triggered When:** A
lender accepts a repayment request from borrower **Recipient:** Borrower **Subject:**
`Your Repayment Has Been Accepted`

### Dynamic Values

| Variable          | Type   | Required | Description                                     |
| ----------------- | ------ | -------- | ----------------------------------------------- |
| `borrowerName`    | string | Yes      | Name of the borrower whose payment was accepted |
| `lenderName`      | string | Yes      | Name of the lender who accepted the payment     |
| `reviewAmount`    | number | Yes      | The amount that was accepted                    |
| `amount`          | number | Yes      | Original loan amount                            |
| `amountPaid`      | number | Yes      | Total amount paid including accepted payment    |
| `remainingAmount` | number | Yes      | Remaining balance after this payment            |
| `transactionId`   | string | Yes      | Unique transaction identifier (UUID)            |
| `actionUrl`       | string | Yes      | URL to view transaction details                 |
| `supportEmail`    | string | Yes      | Support contact email address                   |
| `year`            | number | Yes      | Current year for copyright notice               |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'repayment_accepted',
	to: [{ email: borrower.email, name: borrower.name }],
	params: {
		borrowerName: 'Jane Smith',
		lenderName: 'John Doe',
		reviewAmount: 2000,
		amount: 5000,
		amountPaid: 3000,
		remainingAmount: 2000,
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Repayment Rejected

**File:** `repayment-rejected.html` **Template Key:** `repayment_rejected` **Triggered When:** A
lender rejects a repayment request from borrower **Recipient:** Borrower **Subject:**
`Your Repayment Needs Attention`

### Dynamic Values

| Variable          | Type   | Required | Description                                     |
| ----------------- | ------ | -------- | ----------------------------------------------- |
| `borrowerName`    | string | Yes      | Name of the borrower whose payment was rejected |
| `lenderName`      | string | Yes      | Name of the lender who rejected the payment     |
| `reviewAmount`    | number | Yes      | The amount that was rejected                    |
| `amount`          | number | Yes      | Original loan amount                            |
| `amountPaid`      | number | Yes      | Total amount paid so far (unchanged)            |
| `remainingAmount` | number | Yes      | Remaining balance                               |
| `transactionId`   | string | Yes      | Unique transaction identifier (UUID)            |
| `actionUrl`       | string | Yes      | URL to view transaction details                 |
| `supportEmail`    | string | Yes      | Support contact email address                   |
| `year`            | number | Yes      | Current year for copyright notice               |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'repayment_rejected',
	to: [{ email: borrower.email, name: borrower.name }],
	params: {
		borrowerName: 'Jane Smith',
		lenderName: 'John Doe',
		reviewAmount: 2000,
		amount: 5000,
		amountPaid: 1000,
		remainingAmount: 4000,
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Loan Completed (Borrower)

**File:** `repayment-completed.html` **Template Key:** `repayment_completed` **Triggered When:** A
loan is fully repaid and marked as completed **Recipient:** Borrower **Subject:**
`Congratulations! Loan Fully Repaid`

### Dynamic Values

| Variable        | Type        | Required | Description                                  |
| --------------- | ----------- | -------- | -------------------------------------------- |
| `borrowerName`  | string      | Yes      | Name of the borrower who completed the loan  |
| `lenderName`    | string      | Yes      | Name of the lender                           |
| `amount`        | number      | Yes      | Total loan amount (fully repaid)             |
| `requestDate`   | string/date | Yes      | Original loan request date                   |
| `completedAt`   | string/date | Yes      | Date when loan was completed                 |
| `reviewAmount`  | number      | Yes      | Final payment amount that completed the loan |
| `transactionId` | string      | Yes      | Unique transaction identifier (UUID)         |
| `actionUrl`     | string      | Yes      | URL to view transaction history              |
| `supportEmail`  | string      | Yes      | Support contact email address                |
| `year`          | number      | Yes      | Current year for copyright notice            |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'repayment_completed',
	to: [{ email: borrower.email, name: borrower.name }],
	params: {
		borrowerName: 'Jane Smith',
		lenderName: 'John Doe',
		amount: 5000,
		requestDate: '2026-01-22',
		completedAt: '2026-02-15',
		reviewAmount: 2000,
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Template: Loan Completed (Lender)

**File:** `loan-repayment-completed-lender.html` **Template Key:** `repayment_completed_lender`
**Triggered When:** A loan is fully repaid and marked as completed **Recipient:** Lender
**Subject:** `Payment Received - Loan Fully Repaid`

### Dynamic Values

| Variable        | Type        | Required | Description                                   |
| --------------- | ----------- | -------- | --------------------------------------------- |
| `lenderName`    | string      | Yes      | Name of the lender receiving the full payment |
| `borrowerName`  | string      | Yes      | Name of the borrower who completed repayment  |
| `amount`        | number      | Yes      | Total loan amount received                    |
| `requestDate`   | string/date | Yes      | Original loan start date                      |
| `completedAt`   | string/date | Yes      | Date when loan was fully repaid               |
| `reviewAmount`  | number      | Yes      | Final payment amount that completed the loan  |
| `transactionId` | string      | Yes      | Unique transaction identifier (UUID)          |
| `actionUrl`     | string      | Yes      | URL to view completed transaction details     |
| `supportEmail`  | string      | Yes      | Support contact email address                 |
| `year`          | number      | Yes      | Current year for copyright notice             |

### Example Usage

```javascript
await brevoService.sendFromTemplate({
	templateKey: 'repayment_completed_lender',
	to: [{ email: lender.email, name: lender.name }],
	params: {
		lenderName: 'John Doe',
		borrowerName: 'Jane Smith',
		amount: 5000,
		requestDate: '2026-01-22',
		completedAt: '2026-02-15',
		reviewAmount: 2000,
		transactionId: 'abc123-def456-ghi789',
		actionUrl: 'https://app.lenbow.com/transactions/abc123',
		supportEmail: 'support@lenbow.com',
		year: 2026,
	},
});
```

---

## Common Variables Reference

### Shared Across All Templates

These variables appear in every email template:

- **`transactionId`** - Unique UUID identifier for the transaction
- **`actionUrl`** - Deep link to relevant page in the application
- **`supportEmail`** - Support contact email (typically `support@lenbow.com`)
- **`year`** - Current year for copyright notice in footer

### User Information

- **`borrowerName`** - Full name of the person borrowing money
- **`lenderName`** - Full name of the person lending money

### Financial Values

All monetary values should be formatted as numbers without currency symbols. The templates will
automatically display them with the `$` symbol.

- **`amount`** - Original loan amount
- **`amountPaid`** - Total amount paid to date
- **`remainingAmount`** - Outstanding balance
- **`reviewAmount`** - Specific payment amount under review

### Date Values

Dates should be formatted consistently (e.g., `YYYY-MM-DD` or `MMM DD, YYYY`). The format used
should be human-readable.

- **`requestDate`** - When loan was requested
- **`acceptedAt`** - When request was approved
- **`rejectedAt`** - When request was rejected
- **`completedAt`** - When loan was fully repaid

---

## Implementation Notes

### Date Formatting

Dates should be pre-formatted before passing to templates. Use a consistent format across the
application:

```typescript
const formatDate = (date: Date): string => {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

// Usage: formatDate(new Date()) => "Jan 22, 2026"
```

### Currency Formatting

Amounts should be passed as numbers. The templates display them with `$` prefix:

```typescript
// Pass as number
amount: 5000;
// Displays as: $5000

// For decimals
amount: 5000.5;
// Displays as: $5000.50
```

### Conditional Content

Use conditional blocks for optional content:

```handlebars
{{#if dueDate}}
	<p>Due Date: {{dueDate}}</p>
{{/if}}
```

### Action URLs

Generate action URLs with the transaction ID as search parameter:

```typescript
const actionUrl = `${process.env.APP_URL}/transactions/${transaction.publicId}`;
// or
const actionUrl = `${process.env.APP_URL}/requests?search=${transaction.publicId}`;
```

---

## Template Testing

When testing email templates, ensure all required variables are provided:

```typescript
// Minimal test data
const testParams = {
	borrowerName: 'Test Borrower',
	lenderName: 'Test Lender',
	amount: 1000,
	requestDate: new Date().toLocaleDateString(),
	transactionId: 'test-uuid-1234',
	actionUrl: 'https://localhost:3000/transactions/test-uuid-1234',
	supportEmail: 'support@example.com',
	year: new Date().getFullYear(),
};
```

---

## Related Files

- **Templates Directory:** `src/templates/`
- **Seeder:** `src/seeds/templateSeeder.ts`
- **Email Service:** `src/app/brevo/brevo.service.ts`
- **Template Service:** `src/app/template/template.service.ts`
- **Transaction Controller:** `src/app/transactions/transactions.controller.ts`

---

## Version History

- **v1.1** (2026-01-22) - Added dedicated lender completion template
  - Added `repayment_completed_lender` for lender-specific completion notifications
  - Now 8 email templates total
- **v1.0** (2026-01-22) - Initial documentation with 7 email templates
  - Request lifecycle (send, approved, rejected)
  - Repayment lifecycle (requested, accepted, rejected, completed)
