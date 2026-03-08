# Lenbow API - Technical Documentation

## Project Overview

**Lenbow API** is a secure, scalable, and production-ready backend application built with modern
technologies. It provides a comprehensive API for managing loan transactions, user authentication,
contacts management, and CSRF protection. The project follows industry best practices and
enterprise-grade architectural patterns.

**Project Name:** loan-app-api **Version:** 0.0.1 **License:** UNLICENSED **Generated
Documentation:** 2026-01-03

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Core Technologies & Frameworks](#core-technologies--frameworks)
5. [Database Schema & ORM](#database-schema--orm)
6. [Authentication & Security](#authentication--security)
7. [API Endpoints](#api-endpoints)
8. [Modules & Features](#modules--features)
9. [Configuration & Environment](#configuration--environment)
10. [Development Setup](#development-setup)
11. [Build & Deployment](#build--deployment)
12. [Code Quality & Linting](#code-quality--linting)
13. [Dependencies Overview](#dependencies-overview)

---

## Technology Stack

### Core Framework & Language

- **Framework:** NestJS v11.1.9 - Enterprise-grade Node.js framework with built-in modular
  architecture
- **Language:** TypeScript v5.9.3 - Strongly typed superset of JavaScript for type safety
- **Runtime:** Node.js (v18 or higher) - JavaScript runtime environment
- **Package Manager:** pnpm v10.27.0 - Fast, disk space-efficient package manager

### Database

- **Primary Database:** PostgreSQL (latest) - Advanced open-source relational database
- **ORM:** Drizzle ORM v0.45.1 - Type-safe SQL query builder with TypeScript support
- **Database Migration Tool:** Drizzle Kit v0.31.8 - Database schema management and migrations
- **Database Driver:** pg v8.16.3 - PostgreSQL client for Node.js

### Authentication & Security

- **JWT Library:** @nestjs/jwt v11.0.2 - JWT token generation and validation
- **Passport Strategy:** @nestjs/passport v11.0.5 - Authentication middleware
- **Passport JWT:** passport-jwt v4.0.1 - JWT strategy for Passport
- **Google OAuth 2.0:** passport-google-oauth20 v2.0.0 - Google OAuth authentication
- **Password Hashing:** bcryptjs v3.0.3 - Industry-standard password encryption
- **CSRF Protection:** csrf-csrf v4.0.3 - Double CSRF token protection
- **Encryption:** Node.js built-in crypto module (AES-256-GCM)

### HTTP & API Layer

- **Express Integration:** @nestjs/platform-express v11.1.9 - Express adapter for NestJS
- **Cookie Handling:** cookie-parser v1.4.7 - Cookie parsing middleware
- **HTTP Client:** axios v1.13.2 - Promise-based HTTP client
- **CORS Middleware:** Built-in NestJS CORS support

### Utilities & Helpers

- **Configuration Management:** @nestjs/config v4.0.2 - Environment variable management
- **Validation:** zod v4.1.13 - TypeScript-first schema validation
- **Reactive Programming:** rxjs v7.8.2 - Reactive extensions library
- **Device Detection:** ua-parser-js v2.0.7 - User agent parsing
- **Browser Detection:** bowser v2.13.1 - Browser capabilities detection
- **Phone Validation:** libphonenumber-js v1.12.33 - International phone number validation
- **Cloud Storage:** cloudinary v2.8.0 - Image upload and management service
- **Environment Variables:** dotenv v17.2.3 - Environment variable loading
- **Metadata Reflection:** reflect-metadata v0.2.2 - Metadata reflection for decorators

### Development & Build Tools

- **CLI:** @nestjs/cli v11.0.14 - NestJS command-line interface
- **Compiler:** TypeScript v5.9.3 with source maps
- **Build Tool:** ts-loader v9.5.4 - TypeScript webpack loader
- **Linter:** ESLint v9.39.1 with typescript-eslint
- **Code Formatter:** Prettier v3.7.4 with import sorting plugin
- **Type Checking:** TypeScript strict mode enabled
- **Cross-Platform Env:** cross-env v10.1.0 - Cross-platform environment variable setting
- **Runtime Loader:** tsconfig-paths v4.2.0 - Path alias support
- **Source Maps:** source-map-support v0.5.21 - Source map support for stack traces
- **Node Types:** @types/node v25.0.1 - TypeScript definitions for Node.js

### Development Dependencies

- **ESLint Plugins:**
  - @eslint/js v9.39.1
  - @eslint/eslintrc v3.3.3
  - typescript-eslint v8.49.0
  - eslint-plugin-prettier v5.5.4
  - eslint-config-prettier v10.1.8

- **Prettier Plugins:**
  - prettier v3.7.4
  - @trivago/prettier-plugin-sort-imports v6.0.0

- **Type Definitions:**
  - @types/express v5.0.6
  - @types/cookie-parser v1.4.10
  - @types/passport-jwt v4.0.1
  - @types/passport-google-oauth20 v2.0.17
  - @types/pg v8.16.0

---

## Architecture Overview

### Architectural Pattern: Modular Monolith

The application follows NestJS modular architecture with clear separation of concerns:

```
Application Layer (Controllers)
        ↓
Service Layer (Business Logic)
        ↓
Data Access Layer (Database Service)
        ↓
Database (PostgreSQL with Drizzle ORM)
```

### Request Flow

```
HTTP Request
    ↓
CORS Middleware → Cookie Parser → Request Logger
    ↓
Route Handler (Controller)
    ↓
Guards (JWT, CSRF, Auth)
    ↓
Service (Business Logic)
    ↓
Database Service (Drizzle ORM)
    ↓
PostgreSQL Database
    ↓
Response Interceptor (Standardized Format)
    ↓
HTTP Response
```

### Key Architectural Decisions

1. **Dependency Injection:** Uses NestJS built-in DI system for loose coupling
2. **Global Filters:** Centralized exception handling via HttpExceptionFilter
3. **Global Interceptors:** Consistent API response format via ApiResponseInterceptor
4. **Middleware Stack:** Request logging, CORS, cookie parsing, and CSRF protection
5. **Service-oriented:** Business logic separated from HTTP layer
6. **Type-safe Queries:** Drizzle ORM ensures compile-time type safety

---

## Project Structure

```
loan-app-api/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module definition
│   ├── app.controller.ts                # Root controller
│   │
│   ├── @types/
│   │   └── express.d.ts                 # Express type extensions
│   │
│   ├── app/                             # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts       # Authentication endpoints
│   │   │   ├── auth.service.ts          # Authentication business logic
│   │   │   ├── auth.module.ts           # Auth module definition
│   │   │   ├── auth.guard.ts            # JWT & Google OAuth guards
│   │   │   ├── auth.schema.ts           # Request validation schemas
│   │   │   ├── auth.session.ts          # Session management
│   │   │   ├── @types/                  # Type definitions
│   │   │   └── strategies/              # Passport strategies
│   │   │
│   │   ├── contacts/
│   │   │   ├── contacts.controller.ts   # Contact endpoints
│   │   │   ├── contacts.service.ts      # Contact business logic
│   │   │   ├── contacts.module.ts       # Contacts module definition
│   │   │   ├── @types/                  # Type definitions
│   │   │   └── contacts.schema.ts       # Request validation
│   │   │
│   │   └── transactions/
│   │       ├── transactions.controller.ts   # Transaction endpoints
│   │       ├── transactions.service.ts      # Transaction business logic
│   │       ├── transactions.module.ts       # Transactions module definition
│   │       ├── transactions.schema.ts       # Request validation schemas
│   │       ├── @types/                      # Type definitions
│   │       └── constants.ts                 # Domain constants
│   │
│   ├── budget-categories/                   # Budget categories (system + user)
│   ├── budget-transactions/                 # Budget transactions + receipts
│   ├── budget-subscriptions/              # Recurring subscriptions (process-due for external cron)
│   ├── overview/                           # Dashboard overview (metrics, budget summary)
│   │
│   ├── core/                            # Core/shared utilities
│   │   ├── api-response.interceptor.ts  # Response standardization
│   │   ├── http-exception.filter.ts     # Global exception handling
│   │   ├── route-logger.ts              # Request logging middleware
│   │   ├── app.helper.ts                # Helper functions
│   │   ├── constants.ts                 # Application constants
│   │   ├── env.ts                       # Environment validation (Zod)
│   │   ├── logger.ts                    # Logger utility
│   │   ├── messages.ts                  # Standard messages
│   │   ├── pagination.ts                # Pagination helpers
│   │   │
│   │   ├── validators/
│   │   │   ├── baseQuery.schema.ts      # Base query validation
│   │   │   └── commonRules.ts           # Validation rules
│   │   │
│   │   ├── crypto/
│   │   │   ├── crypto.service.ts        # AES-256-GCM encryption
│   │   │   └── crypto.module.ts         # Crypto module
│   │   │
│   │   └── cloudinary/
│   │       └── upload.ts                # Image upload service
│   │
│   ├── csrf/                            # CSRF protection
│   │   ├── csrf.service.ts              # CSRF token management
│   │   ├── csrf.guard.ts                # CSRF validation guard
│   │   ├── csrf.controller.ts           # CSRF token endpoint
│   │   ├── csrf.decorator.ts            # CSRF decorator
│   │   └── csrf.module.ts               # CSRF module definition
│   │
│   ├── database/                        # Database layer
│   │   ├── connection.ts                # PostgreSQL connection pool
│   │   ├── database.module.ts           # Database module
│   │   ├── schema.ts                    # Auto-generated schema exports
│   │   ├── service.ts                   # Base Drizzle service
│   │   ├── types.ts                     # Type definitions
│   │   ├── helpers.ts                   # Database helpers
│   │   └── clean.ts                     # Database cleanup utility
│   │
│   └── models/
│       └── drizzle/
│           ├── auth.model.ts            # Users, Sessions, Accounts schemas
│           ├── budget.model.ts          # Budget categories, transactions, receipts, subscriptions
│           ├── transactions.model.ts   # Lend/borrow transactions, Contacts, Payments
│           ├── relation.model.ts        # Table relationships
│           └── enum.model.ts            # Database enums
│
├── .drizzle/                            # Auto-generated migrations
│   └── migrations/                      # SQL migration files
│
├── pgdata/                              # PostgreSQL data (Docker)
│   └── 18/docker/                       # PostgreSQL configuration
│
├── docs/                                # Documentation
│   ├── BUDGET_FEATURE.md                # Budget (self-accounting) API and process-due
│   ├── CSRF_IMPLEMENTATION.md           # CSRF protection details
│   ├── OVERVIEW_FEATURE.md              # Overview endpoint and dashboard data
│   └── REMOVE_TESTING.md                # Testing guidelines
│
├── Configuration Files
│   ├── docker-compose.yml               # Docker PostgreSQL setup
│   ├── drizzle.config.ts                # Drizzle ORM configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── tsconfig.build.json              # Build TypeScript config
│   ├── nest-cli.json                    # NestJS CLI configuration
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── package.json                     # Project dependencies & scripts
│   ├── pnpm-workspace.yaml              # pnpm workspace configuration
│   ├── pnpm-lock.yaml                   # Dependency lock file
│   ├── routes.json                      # Auto-generated API routes
│   └── update-schema.mjs                # Schema auto-generation script
│
└── README.md                            # Project documentation
```

---

## Core Technologies & Frameworks

### NestJS (v11.1.9)

NestJS is the backbone framework providing:

- **Module System:** Encapsulation of features into logical units
- **Dependency Injection:** Automatic dependency resolution and injection
- **Decorators:** Use of TypeScript decorators for metadata definition
- **Middleware:** Request processing pipeline
- **Guards:** Route protection and access control
- **Interceptors:** Cross-cutting concerns (logging, response transformation)
- **Filters:** Centralized exception handling
- **Pipes:** Data validation and transformation

### TypeScript (v5.9.3)

Strongly typed language providing:

- **Type Safety:** Compile-time type checking
- **IntelliSense:** Better IDE support
- **Decorator Support:** With `experimentalDecorators` and `emitDecoratorMetadata` enabled
- **Module System:** ES6 module support with `nodenext` resolution

### Express.js (via @nestjs/platform-express)

HTTP server framework providing:

- **Request/Response Handling:** HTTP protocol support
- **Middleware Support:** Custom middleware integration
- **Routing:** URL pattern matching and handler dispatch
- **Static File Serving:** Asset delivery

---

## Database Schema & ORM

### ORM: Drizzle ORM

**Why Drizzle ORM?**

- Type-safe SQL queries
- No runtime migrations
- Compile-time query validation
- Full TypeScript support
- Lightweight and performant

### Database Design

#### 1. Authentication Schema

**Users Table**

```
id (PK): serial - Unique user identifier
publicId (UNIQUE): uuid - Public-facing user identifier
name: text - User display name
email (UNIQUE): text - User email address
password: text - Bcrypt hashed password
emailVerified: boolean - Email verification status
image: text - Profile image URL
imageInformation: json - Image metadata (Cloudinary)
phone: varchar(20) - User phone number
is2faEnabled: boolean - Two-factor authentication enabled
createdAt: timestamp - Account creation time
updatedAt: timestamp - Account update time

Indexes:
- publicId (unique)
- email (unique)
- emailVerified
- is2faEnabled
- name (case-insensitive LOWER)
- email (case-insensitive LOWER)
```

**Sessions Table**

```
id (PK): serial - Session record ID
publicId (UNIQUE): uuid - Public session identifier
token (UNIQUE): text - JWT session token
ipAddress: text - Client IP address
userAgent: text - Browser/client information
deviceName: varchar(255) - Device identifier
deviceType: varchar(50) - Device type (mobile, desktop, etc.)
twoFactorVerified: boolean - 2FA verification status
userId (FK): integer → users.id - Session owner
expiresAt: timestamp - Session expiration time
isRevoked: boolean - Session revocation status
createdAt: timestamp - Session creation time
updatedAt: timestamp - Session update time

Indexes:
- publicId (unique)
- token (unique)
- userId
- expiresAt
- isRevoked
- (userId, isRevoked) - Composite for active sessions query
- (userId, expiresAt) - Composite for expiration check
```

**Accounts Table** (OAuth & Provider Accounts)

```
id (PK): serial - Account record ID
publicId (UNIQUE): uuid - Public account identifier
accountId: text - Provider account ID
providerId: text - OAuth provider identifier (google, etc.)
userId (FK): integer → users.id - Account owner
accessToken: text - OAuth access token
refreshToken: text - OAuth refresh token
idToken: text - OIDC ID token
accessTokenExpiresAt: timestamp - Access token expiration
refreshTokenExpiresAt: timestamp - Refresh token expiration
scope: text - OAuth permission scope
password: text - Local password (if applicable)
createdAt: timestamp - Record creation time
updatedAt: timestamp - Record update time

Indexes:
- publicId (unique)
- (accountId, providerId) (unique)
- userId
- providerId
- accessTokenExpiresAt
```

**Verifications Table** (Email, 2FA, etc.)

```
id (PK): serial
code: text - Verification code
type: enum - Verification type
userId (FK): integer → users.id
expiresAt: timestamp
verified: boolean
createdAt: timestamp
```

#### 2. Transaction Schema

**Contacts Table** (User connections)

```
id (PK): serial - Contact record ID
requestedUserId (FK): integer → users.id - User who initiated connection
connectedUserId (FK): integer → users.id - User being connected with
createdAt: timestamp - Connection time
updatedAt: timestamp - Update time

Indexes:
- (requestedUserId, connectedUserId) (unique)
- requestedUserId
```

**Transactions Table** (Loans/Borrowing)

```
id (PK): serial - Transaction record ID
publicId (UNIQUE): uuid - Public transaction identifier
borrowerId (FK): integer → users.id - Borrower (receives money)
lenderId (FK): integer → users.id - Lender (provides money)
amount: decimal(10,2) - Loan amount
amountPaid: decimal(10,2) - Amount paid so far (default: 0)
remainingAmount: decimal(10,2) - Outstanding balance
reviewAmount: decimal(10,2) - Amount pending for repayment
status: enum - Transaction status (pending, accepted, partially_paid, completed, rejected, requested_repay)
description: text - Loan description/purpose
rejectionReason: text - Reason if rejected
dueDate: timestamp - Payment due date
requestDate: timestamp - When request was created (default: NOW)
acceptedAt: timestamp - When request was accepted
completedAt: timestamp - When fully paid
rejectedAt: timestamp - When rejected
createdAt: timestamp
updatedAt: timestamp

Indexes:
- publicId (unique)
- borrowerId
- lenderId
- (borrowerId, status) - For user's borrow history
- (lenderId, status) - For user's lend history
- status
- dueDate
- (dueDate, status)
```

**Payments Table** (Payment records)

```
id (PK): serial - Payment record ID
publicId (UNIQUE): uuid - Public payment identifier
transactionId (FK): integer → transactions.id - Associated transaction
amount: decimal(10,2) - Payment amount
paymentDate: timestamp - When payment was made (default: NOW)
notes: text - Payment notes/reference
createdAt: timestamp
updatedAt: timestamp

Indexes:
- publicId (unique)
- transactionId
```

### Enum Types

**Transaction Status:**

- `pending` - Request created, awaiting acceptance
- `accepted` - Request accepted, loan active
- `partially_paid` - Some amount repaid
- `completed` - Fully repaid
- `rejected` - Request rejected
- `requested_repay` - Repayment request initiated

**Transaction Type:**

- `lend` - User is lending money
- `borrow` - User is borrowing money

### Key Database Features

1. **Cascade Delete:** Foreign key constraints with ON DELETE CASCADE
2. **Unique Constraints:** Prevent duplicate records
3. **Composite Indexes:** Optimize common query patterns
4. **Case-Insensitive Search:** LOWER() indexes for email/name
5. **Decimal Precision:** 10 digits total, 2 decimal places for currency
6. **Timestamps:** createdAt, updatedAt for audit trail
7. **Public IDs:** UUID for external API references (security through obscurity)

---

## Authentication & Security

### Authentication Methods

#### 1. JWT-Based Session Authentication

**Process:**

1. User logs in with email/password
2. Password validated against bcrypt hash
3. JWT token generated with encrypted payload (AES-256-GCM)
4. Session record created in database
5. Token sent to client as HttpOnly cookie
6. Subsequent requests include token in Authorization header or x-csrf-token

**Token Structure:**

```typescript
{
	sub: string; // Encrypted user ID
	email: string; // Encrypted user email
	iat: number; // Issued at
	exp: number; // Expiration time
}
```

**Session Timeout:** 7 days (configurable via `sessionTimeout` constant)

#### 2. OAuth 2.0 - Google Authentication

**Flow:**

1. User initiates Google login
2. Redirected to Google authorization endpoint
3. User grants permissions
4. Callback handler receives authorization code
5. Backend exchanges code for tokens
6. User account created/linked
7. Session created, user authenticated

**Stored Data:**

- accessToken (Google access token)
- refreshToken (for token refresh)
- idToken (OIDC identity token)
- accountId (Google user ID)
- providerId (always "google")

### Security Measures

#### Password Encryption

- **Algorithm:** bcryptjs with salt rounds
- **Implementation:** `bcrypt.hash()` and `bcrypt.compare()`
- **Strength:** Industry-standard password hashing

#### JWT Token Encryption

- **Algorithm:** AES-256-GCM
- **Key Derivation:** scryptSync with 256-bit output
- **IV Generation:** Random 16-byte IV per encryption
- **Auth Tag:** 16-byte authentication tag
- **Storage Format:** Base64(IV + AuthTag + CipherText)

#### CSRF Protection

- **Method:** Double CSRF Token Pattern
- **Library:** csrf-csrf v4.0.3
- **Implementation:**
  - Token stored in HTTP-only cookie (server-generated)
  - Token also provided in response body
  - Client includes token in `x-csrf-token` header
  - Server validates both tokens match
- **Size:** 32-byte tokens
- **Timeout:** 1 hour (configurable)
- **Error Handling:** 403 Forbidden for mismatched tokens

#### CORS Protection

- **Allowed Origins:** Configurable via `ORIGIN_URL` environment variable
- **Credentials:** Enabled for cookie-based auth
- **Methods:** GET, POST, PUT, DELETE
- **Headers:** Content-Type, Authorization, x-csrf-token, ngrok-skip-browser-warning
- **Max Age:** 3600 seconds

#### Cookie Security

- **HttpOnly:** Prevents JavaScript access
- **Secure Flag:** Enforced in production
- **SameSite:** Configurable (Lax/Strict)
- **Domain:** Configurable for multiple domains
- **Blacklist:** Prevents free hosting domains (Vercel, Heroku, etc.)

#### Request Validation

- **Schema Validation:** Zod library
- **Type Safety:** Full TypeScript type checking
- **Endpoint-specific:** Each endpoint defines its own schema

### Authentication Guards

**JwtAuthGuard:**

- Validates JWT tokens
- Extracts user information
- Applied to protected routes

**GoogleAuthGuard:**

- Handles OAuth callback
- Manages redirect flow
- Error handling with descriptive messages

### Session Management

**Features:**

- Device tracking (user agent parsing)
- IP address logging
- Device name/type detection
- Two-factor verification flag
- Session revocation support
- Expiration tracking

**Device Detection:**

- `ua-parser-js` - Parse user agent string
- `bowser` - Browser capabilities detection
- Device Type: mobile, tablet, desktop

---

## API Endpoints

### Total Routes: 38+ (including budget and overview)

#### Authentication Endpoints

| Endpoint                | Method | Handler        | Description                   |
| ----------------------- | ------ | -------------- | ----------------------------- |
| `/auth/google`          | GET    | googleLogin    | Initiates Google OAuth login  |
| `/auth/google/callback` | GET    | googleCallback | Google OAuth callback handler |
| `/auth/login`           | POST   | login          | Email/password login          |
| `/auth/logout`          | POST   | logout         | Logout user session           |
| `/auth/me`              | GET    | getProfile     | Fetch current user profile    |
| `/auth/register`        | POST   | register       | Create new user account       |

#### CSRF Endpoint

| Endpoint | Method | Handler      | Description                |
| -------- | ------ | ------------ | -------------------------- |
| `/csrf`  | GET    | getCsrfToken | Get CSRF token for session |

#### Contacts Endpoints

| Endpoint              | Method | Handler                 | Description             |
| --------------------- | ------ | ----------------------- | ----------------------- |
| `/contacts/:publicId` | GET    | getContactByPublicId    | Get contact details     |
| `/contacts/connected` | GET    | getConnectedContactList | List connected contacts |

#### Transactions Endpoints

| Endpoint                                   | Method | Handler            | Description                       |
| ------------------------------------------ | ------ | ------------------ | --------------------------------- |
| `/transactions`                            | GET    | getTransactionList | List transactions with pagination |
| `/transactions`                            | POST   | createTransaction  | Create new transaction            |
| `/transactions`                            | DELETE | deleteTransaction  | Delete transactions (bulk)        |
| `/transactions/:publicId`                  | GET    | getTransaction     | Get transaction details           |
| `/transactions/:publicId/repayment/accept` | PUT    | acceptTransaction  | Accept repayment request          |
| `/transactions/:publicId/repayment/reject` | PUT    | rejectTransaction  | Reject repayment request          |

#### Budget Endpoints

| Endpoint                                                    | Method | Description                                      |
| ----------------------------------------------------------- | ------ | ------------------------------------------------ |
| `/budget-categories`                                        | GET    | List budget categories (system + user)           |
| `/budget-categories`                                        | POST   | Create custom category                           |
| `/budget-categories/:publicId`                              | GET    | Get one category                                 |
| `/budget-categories/:publicId`                              | PATCH  | Update custom category                           |
| `/budget-categories/:publicId`                              | DELETE | Delete custom category                           |
| `/budget-transactions`                                      | GET    | List budget transactions (pagination, filters)  |
| `/budget-transactions`                                      | POST   | Create budget transaction                        |
| `/budget-transactions/:publicId`                           | GET    | Get one transaction                              |
| `/budget-transactions/:publicId`                           | PATCH  | Update transaction                               |
| `/budget-transactions/:publicId`                           | DELETE | Delete transaction                               |
| `/budget-transactions/:publicId/receipts/:mediaPublicId`   | POST   | Attach receipt                                   |
| `/budget-transactions/:publicId/receipts/:mediaPublicId`   | DELETE | Detach receipt                                   |
| `/budget-subscriptions`                                     | GET    | List subscriptions                               |
| `/budget-subscriptions`                                     | POST   | Create subscription                              |
| `/budget-subscriptions/process-due`                         | POST   | Process due subscriptions (X-Cron-Secret; no JWT)|
| `/budget-subscriptions/:publicId`                          | GET    | Get one subscription                             |
| `/budget-subscriptions/:publicId`                          | PATCH  | Update subscription                              |
| `/budget-subscriptions/:publicId`                          | DELETE | Delete subscription                              |

#### Root Endpoint

| Endpoint | Method | Handler | Description                  |
| -------- | ------ | ------- | ---------------------------- |
| `/`      | GET    | getRoot | Health check / root endpoint |

### Response Format

All endpoints return standardized responses:

```typescript
{
  statusCode: number;        // HTTP status code
  message: string;           // Response message
  data?: T;                  // Response payload
  timestamp: string;         // ISO timestamp
  path: string;              // Request path
  pagination?: {
    totalItems: number;
    limit: number;
    offset: number;
    currentPage: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }
}
```

---

## Modules & Features

### 1. Auth Module

**Responsibility:** User authentication, session management, profile management

**Components:**

- **AuthController** - HTTP endpoints for auth operations
- **AuthService** - Business logic for authentication
- **AuthGuard** - JWT and OAuth protection
- **AuthSession** - Session creation and management
- **Strategies** - Passport.js strategies (JWT, Google)

**Key Features:**

- User registration with email validation
- Email/password login
- Google OAuth integration
- Session management with device tracking
- Profile retrieval and management
- Logout with session revocation

**Database Dependencies:** users, sessions, accounts, verifications tables

### 2. Contacts Module

**Responsibility:** Managing user connections and contacts

**Components:**

- **ContactsController** - Contact endpoints
- **ContactsService** - Contact business logic

**Key Features:**

- Fetch specific contact by public ID
- List all connected contacts
- Connection creation/management
- Deduplication of bidirectional connections

**Database Dependencies:** contacts, users tables

### 3. Budget Categories Module

**Responsibility:** System and user-defined budget categories for income/expense classification

**Components:**

- **BudgetCategoriesController** – CRUD endpoints for categories
- **BudgetCategoriesService** – List (system + user), create, update, delete (user-scoped; system categories read-only)

**Key Features:**

- List returns system categories (`user_id` NULL) and the current user's custom categories
- Create/update/delete only for custom categories (user-owned)
- Slug optional on create (auto-derived from name); unique per user

**Database Dependencies:** budget_categories, users tables

### 4. Budget Transactions Module

**Responsibility:** Personal income/expense transactions with optional receipt attachments

**Components:**

- **BudgetTransactionsController** – List, get one, create, update, delete, attach/detach receipts
- **BudgetTransactionsService** – CRUD, pagination, filters (date range, type, category), receipt linking via media publicId

**Key Features:**

- Transactions have name, amount, type (in | out), currency, category, date, note, details
- Receipts linked via junction table to existing `media` table (attach/detach by media publicId)
- List supports pagination and filtering

**Database Dependencies:** budget_transactions, budget_categories, budget_transaction_receipts, media, users tables

### 5. Budget Subscriptions Module

**Responsibility:** Recurring expense templates; processing is triggered by an external cron via a dedicated endpoint

**Components:**

- **BudgetSubscriptionsController** – CRUD for subscriptions; **POST /process-due** (no JWT; protected by `X-Cron-Secret` header)
- **BudgetSubscriptionsService** – CRUD, `next_run_at` computation, `processDueSubscriptions()` (creates budget_transactions and advances `next_run_at`)

**Key Features:**

- Subscriptions: name, amount, category, recurrence (weekly | monthly | yearly), next_run_at, is_active
- **Process-due endpoint:** Call `POST /budget-subscriptions/process-due` with header `X-Cron-Secret: <BUDGET_CRON_SECRET>`. Processes all due subscriptions (creates one budget transaction per subscription and advances next_run_at). No internal cron; intended for external scheduler (e.g. system cron, GitHub Actions).
- Environment: optional `BUDGET_CRON_SECRET`; if set, process-due requires matching header

**Database Dependencies:** budget_subscriptions, budget_categories, budget_transactions, users tables

### 6. Transactions Module

**Responsibility:** Managing loan requests and repayments

**Components:**

- **TransactionsController** - Transaction endpoints
- **TransactionsService** - Transaction business logic

**Key Features:**

- Create loan request
- Accept/reject requests
- Request repayment
- Track payment progress
- List transactions with filtering and sorting
- Delete transactions
- Calculate remaining amounts

**Filtering & Sorting:**

- Filter by type (lend, borrow)
- Filter by status (pending, accepted, etc.)
- Sort by multiple fields (id, name, email, amount, status, type, requestDate, createdAt)
- Pagination support (limit, offset)

**Database Dependencies:** transactions, contacts, users, payments tables

### 4. CSRF Module

**Responsibility:** Double CSRF token protection

**Components:**

- **CsrfService** - Token generation and validation
- **CsrfGuard** - Route protection via CSRF validation
- **CsrfController** - Token endpoint
- **CsrfDecorator** - Custom decorator for route protection

**Key Features:**

- Generate CSRF tokens
- Validate tokens on state-changing requests
- Cookie-based token storage
- Request header validation
- Error handling with user-friendly messages

### 5. Database Module

**Responsibility:** Database connection and access

**Components:**

- **DatabaseModule** - Module definition
- **Connection** - PostgreSQL connection pool setup
- **Service** - Base Drizzle service class
- **Schema** - Auto-generated schema exports
- **Helpers** - Database utility functions

**Features:**

- Connection pooling for performance
- Global database availability
- Type-safe database access
- Schema auto-generation from models

### 6. Crypto Module

**Responsibility:** Encryption/decryption operations

**Components:**

- **CryptoService** - AES-256-GCM encryption
- **CryptoModule** - Module definition

**Key Features:**

- Encrypt sensitive data (user ID, email in JWT)
- AES-256-GCM algorithm
- Secure key derivation via scrypt
- Base64 encoding for transport

**Usage:** JWT payload encryption, secure data storage

### 7. Core Module (Shared)

**Responsibilities:** Cross-cutting concerns and utilities

**Components:**

- **ApiResponseInterceptor** - Standardized response format
- **HttpExceptionFilter** - Centralized exception handling
- **RouteLogger** - Request/response logging
- **Validators** - Zod-based validation schemas
- **CloudinaryImageService** - Image upload/management
- **Constants** - Application-wide constants

**Features:**

- Consistent API responses
- Comprehensive error handling
- Request logging middleware
- Input validation
- Image upload to Cloudinary
- Device blacklist management

---

## Configuration & Environment

### Environment Variables

**Required Variables:**

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/loan_app_db

# Server Configuration
PORT=3000                               # API server port
NODE_ENV=development                   # Environment mode

# Session & Security
SECRET=your-random-secret-key           # Encryption secret (min 32 chars)
COOKIE_DOMAIN=localhost                 # Cookie domain

# CORS & API Configuration
ORIGIN_URL=http://localhost:3000        # Comma-separated allowed origins
API_URL=http://localhost:3000/api       # API base URL

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Environment Validation

**Tool:** Zod schema validation

**Validation Rules:**

- All required variables checked
- NODE_ENV must be 'development' or 'production'
- PORT must be numeric
- URLs must be valid strings
- Missing variables throw descriptive errors

**Error Handling:**

- Errors logged with color (red text)
- Application exits on validation failure
- Clear error messages for debugging

### Configuration Sources

1. **.env file** - Local development configuration
2. **Environment variables** - Production/deployment
3. **Validation** - Via Zod schema

### TypeScript Configuration

**tsconfig.json Settings:**

```json
{
	"compilerOptions": {
		"module": "nodenext", // ES modules
		"moduleResolution": "nodenext", // Node resolution
		"target": "ES2023", // Modern JavaScript target
		"lib": ["ES2023"], // Library support
		"declaration": true, // Generate .d.ts files
		"removeComments": true, // Strip comments in output
		"sourceMap": true, // Debug source maps
		"outDir": "./dist", // Build output
		"baseUrl": "./", // Path resolution
		"strict": true, // Strict type checking
		"strictNullChecks": true, // Null/undefined checking
		"noImplicitAny": true, // No implicit any types
		"emitDecoratorMetadata": true, // Emit decorator metadata
		"experimentalDecorators": true, // Enable decorators
		"esModuleInterop": true, // CommonJS/ESM interop
		"skipLibCheck": true, // Skip lib type checking
		"forceConsistentCasingInFileNames": true,
		"noFallthroughCasesInSwitch": true
	}
}
```

---

## Development Setup

### Prerequisites

- **Node.js:** v18 or higher
- **pnpm:** v10.27.0 or compatible
- **Docker:** For PostgreSQL (optional, can use external DB)
- **Git:** Version control

### Installation Steps

1. **Clone Repository**

```bash
git clone <repository-url>
cd loan-app-api
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Setup Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d

# Generate schema (auto-runs as predev)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Optionally seed data
pnpm db:seed
```

5. **Start Development Server**

```bash
pnpm dev
```

Server runs on `http://localhost:3000`

### Database Management Commands

```bash
# View/manage database in GUI
pnpm db:studio

# Generate migration files
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Push schema changes
pnpm db:push

# Clear all data (development only)
pnpm db:clear
```

### Development Scripts

```bash
pnpm dev              # Start with hot reload
pnpm start            # Start normally
pnpm debug            # Debug with inspector
pnpm build            # Compile to dist/
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm prod             # Run production build
```

---

## Build & Deployment

### Build Process

```bash
# Pre-build: Generate schema
# Via update-schema.mjs script

# Compile TypeScript to JavaScript
pnpm build
```

**Output:** `dist/` directory with compiled JavaScript

**Build Features:**

- Source maps generation
- Decorator metadata emission
- Comment stripping
- No-op comments removal

### Production Setup

```bash
# Set environment
export NODE_ENV=production

# Install production dependencies only
pnpm install --prod

# Run compiled application
pnpm prod
```

### Docker Deployment

**PostgreSQL Container:**

```bash
docker-compose up -d postgres
```

**Environment Variables Required:**

- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_PORT

### Deployment Considerations

1. **HTTPS:** Use secure HTTPS in production
2. **CORS:** Configure allowed origins properly
3. **Secrets:** Use environment variables for all secrets
4. **Database:** Use managed PostgreSQL service
5. **Node Env:** Always set NODE_ENV=production
6. **Session Timeout:** Configure for your use case
7. **Image Storage:** Use Cloudinary or similar service
8. **Rate Limiting:** Implement for production (not included)
9. **Monitoring:** Setup logging/monitoring solutions
10. **Backup:** Database backup strategy

---

## Code Quality & Linting

### ESLint Configuration

**Configuration File:** `eslint.config.mjs` (Flat Config)

**Extends:**

- `@eslint/js` - ESLint recommended rules
- `typescript-eslint` - TypeScript specific rules
- `prettier/recommended` - Prettier integration

**Disabled Rules:**

- `@typescript-eslint/no-explicit-any` - Allow any types
- `@typescript-eslint/no-floating-promises` - Disabled
- `@typescript-eslint/no-unsafe-argument` - Warn instead of error
- `@typescript-eslint/no-unsafe-call` - Allow unsafe calls
- `@typescript-eslint/no-unsafe-assignment` - Allow unsafe assignment
- `@typescript-eslint/no-unsafe-member-access` - Allow unsafe access
- `prettier/prettier` - Prettier formatting disabled

**Enabled Warnings:**

- `@typescript-eslint/no-unused-vars` - Warn on unused variables

### Prettier Configuration

**Purpose:** Code formatting

**Features:**

- Import sorting via `@trivago/prettier-plugin-sort-imports`
- Consistent code style
- Integrated with ESLint

**Usage:**

```bash
pnpm format    # Format all files
```

### Code Style Standards

1. **TypeScript Strict Mode:** Enabled
2. **Type Safety:** No implicit any types
3. **Naming:** Consistent camelCase
4. **Formatting:** Prettier enforced
5. **Comments:** Required for complex logic
6. **Tests:** Unit tests recommended (not included in base)

### Running Quality Checks

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Build (includes type checking)
pnpm build
```

---

## Dependencies Overview

### Direct Dependencies (26)

#### NestJS Core

- `@nestjs/common` - Common utilities
- `@nestjs/core` - Core framework
- `@nestjs/config` - Environment configuration
- `@nestjs/platform-express` - Express adapter
- `@nestjs/jwt` - JWT handling
- `@nestjs/passport` - Passport integration
- `@nestjs/mapped-types` - DTO type mapping

#### Database & ORM

- `drizzle-orm` - Type-safe ORM
- `drizzle-kit` - Schema management
- `pg` - PostgreSQL driver
- `@types/pg` - TypeScript definitions

#### Authentication & Security

- `passport` - Authentication middleware
- `passport-jwt` - JWT strategy
- `passport-google-oauth20` - Google OAuth
- `bcryptjs` - Password hashing
- `csrf-csrf` - CSRF protection

#### Utilities

- `axios` - HTTP client
- `zod` - Schema validation
- `cloudinary` - Image service
- `cookie-parser` - Cookie middleware
- `libphonenumber-js` - Phone validation
- `ua-parser-js` - User agent parsing
- `bowser` - Browser detection
- `dotenv` - Environment loading
- `reflect-metadata` - Metadata reflection
- `rxjs` - Reactive extensions

### Development Dependencies (23)

#### TypeScript & Compilation

- `typescript` - TypeScript compiler
- `ts-loader` - Webpack TypeScript loader
- `ts-node` - TypeScript runtime
- `tsconfig-paths` - Path alias support
- `@types/node` - Node.js definitions

#### Linting & Formatting

- `eslint` - Code linter
- `typescript-eslint` - TypeScript ESLint support
- `eslint-plugin-prettier` - Prettier integration
- `eslint-config-prettier` - Prettier config
- `prettier` - Code formatter
- `@trivago/prettier-plugin-sort-imports` - Import sorting

#### Build Tools

- `@nestjs/cli` - NestJS CLI
- `@nestjs/schematics` - Scaffolding templates
- `cross-env` - Cross-platform env vars
- `source-map-support` - Source map support

#### Type Definitions

- `@types/express` - Express types
- `@types/cookie-parser` - Cookie parser types
- `@types/passport-jwt` - Passport JWT types
- `@types/passport-google-oauth20` - Google OAuth types

#### Other

- `@eslint/js` - ESLint JavaScript rules
- `@eslint/eslintrc` - ESLint config loader
- `globals` - Global variable definitions

### Peer Dependencies (Implicit)

- `express` - HTTP server (via @nestjs/platform-express)
- `node-postgres` - PostgreSQL pool (via drizzle-orm)

### Package Manager

- **pnpm** v10.27.0 - Fast, efficient package manager
- **npm alternative:** Yes, `package.json` is compatible
- **Yarn alternative:** Yes, compatible with Yarn v3+

---

## Additional Technical Details

### Encryption Implementation

**Symmetric Encryption:** AES-256-GCM

```typescript
Algorithm: AES-256-GCM
Key Length: 256 bits (32 bytes)
IV Length: 128 bits (16 bytes)
Auth Tag Length: 128 bits (16 bytes)
Key Derivation: scryptSync(secret, 'salt', 32)
Format: Base64(IV + AuthTag + CipherText)
```

**Use Cases:**

- JWT payload encryption (user ID, email)
- Secure data transmission
- Credential storage

### Request/Response Logging

**Middleware:** `appLogger` - Custom request logger

**Logs:**

- Request method and path
- Query parameters
- Request body (sanitized)
- Response status code
- Response time
- Timestamp

### Device Tracking

**Tracked Information:**

- User agent string
- Device name/type
- Browser/OS information
- IP address
- Two-factor verification status

**Purpose:**

- Security audit trail
- Device management
- Location tracking
- Session security

### Error Handling

**Global Filter:** `HttpExceptionFilter`

**Features:**

- Catches all HTTP exceptions
- Transforms into standardized format
- Logs errors for debugging
- Returns appropriate status codes
- Sanitizes error messages

**Error Response Format:**

```json
{
	"statusCode": 400,
	"message": "Error description",
	"timestamp": "2026-01-03T13:50:29.873Z",
	"path": "/api/endpoint"
}
```

### Pagination Support

**Query Parameters:**

- `limit` - Items per page (default: 10)
- `offset` - Number of items to skip (default: 0)
- `page` - Page number (alternative to offset)

**Response Metadata:**

- Total items count
- Current page
- Total pages
- Has previous/next page
- Previous/next page numbers

### Image Management

**Service:** Cloudinary

**Features:**

- Upload user profile images
- Automatic image optimization
- Cloud storage
- Image metadata tracking
- Public URL generation

**Configuration:**

```typescript
{
	cloudName: string;
	apiKey: string;
	apiSecret: string;
	folder: string; // 'user_profiles'
}
```

### Type Safety

**Implementation:**

1. **Strict TypeScript:** All strict flags enabled
2. **Zod Validation:** Runtime schema validation
3. **Drizzle ORM:** Compile-time query safety
4. **Type Definitions:** Comprehensive types for all modules
5. **No Any Types:** Minimized use of `any` keyword

---

## Performance Optimizations

### Database

1. **Connection Pooling:** PostgreSQL connection pool management
2. **Indexes:** Strategic indexes on frequently queried columns
3. **Composite Indexes:** Optimize multi-column queries
4. **Query Optimization:** Drizzle ORM generates optimized SQL

### Application

1. **Caching:** Built-in NestJS caching capabilities
2. **Lazy Loading:** Modules loaded on demand
3. **Middleware Optimization:** Efficient request processing
4. **Response Streaming:** For large datasets

### Frontend

1. **CORS Preflight Caching:** 3600 second max age
2. **HttpOnly Cookies:** Reduced payload size
3. **Compression:** Server-side compression (if configured)

---

## Security Summary

### Layers of Protection

| Layer              | Technology       | Details                |
| ------------------ | ---------------- | ---------------------- |
| **Network**        | HTTPS/TLS        | In production          |
| **Authentication** | JWT + Encryption | AES-256-GCM            |
| **Session**        | Database-backed  | With expiration        |
| **Authorization**  | Guards           | Route-level protection |
| **CSRF**           | Double token     | Cookie + header        |
| **Passwords**      | bcryptjs         | Industry standard      |
| **Encryption**     | AES-256-GCM      | Sensitive data         |
| **CORS**           | Whitelist        | Origin validation      |
| **Input**          | Zod validation   | Schema enforcement     |
| **Output**         | Sanitized        | Standardized format    |

---

## Monitoring & Logging

### Request Logging

**Captured:**

- Request timestamp
- HTTP method and path
- Query parameters
- Request body
- Response status
- Response time

### Error Logging

**Captured:**

- Error message
- Stack trace
- Request details
- Timestamp
- Path that failed

### Available Tools

1. **Built-in Logger:** NestJS logger utility
2. **Request Logger Middleware:** `appLogger`
3. **Route Logger:** `logAllRoutes` function
4. **Custom Logging:** Can be extended as needed

---

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Design:** No server-side state (JWT-based)
2. **Database-backed Sessions:** Shared session store
3. **Load Balancer:** Can distribute across multiple instances

### Vertical Scaling

1. **Connection Pooling:** Efficient database connections
2. **Memory Management:** RxJS for efficient streams
3. **Lazy Loading:** Modules loaded on demand

### Future Enhancements

1. **Caching Layer:** Redis for performance
2. **Message Queue:** For async operations
3. **Monitoring:** Application performance monitoring
4. **Rate Limiting:** Prevent abuse
5. **API Versioning:** For backward compatibility

---

## Summary

The **Lenbow API** is a comprehensive, production-ready backend application demonstrating
enterprise-grade architecture and security practices. Built with modern technologies (NestJS,
TypeScript, PostgreSQL), it implements:

- **Robust Authentication:** JWT + OAuth 2.0
- **Strong Security:** AES-256-GCM encryption, CSRF protection, bcrypt hashing
- **Type Safety:** Full TypeScript with Drizzle ORM
- **Scalability:** Modular architecture, connection pooling
- **Developer Experience:** Hot reload, linting, formatting tools
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Database Design:** Normalized schema with strategic indexes
- **Error Handling:** Global filters and standardized responses
- **API Standards:** RESTful endpoints with pagination support

This project serves as an excellent foundation for building secure, scalable loan management or
financial applications.

---

**Documentation Generated:** January 3, 2026 **Last Updated:** 2026-01-03T13:50:29.873Z
