# Lenbow API

A secure and scalable loan application backend API built with NestJS, PostgreSQL, and Drizzle ORM.

## Description

This is the backend API for a loan application system, featuring secure authentication, CSRF
protection, and comprehensive user management. Built with modern technologies and best practices for
production-ready applications.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with session management
- 🛡️ **CSRF Protection** - Built-in CSRF token validation
- 🔑 **OAuth Integration** - Google OAuth 2.0 authentication support
- 📊 **Database ORM** - Drizzle ORM for type-safe database queries
- 🐘 **PostgreSQL** - Robust relational database with Docker support
- 🔒 **Password Encryption** - Bcrypt password hashing
- 🌐 **API Response Standardization** - Consistent response format across all endpoints
- 📝 **Request Logging** - Comprehensive request/response logging
- 🎯 **Device Tracking** - User agent and device information tracking
- 💰 **Budget Tracking** - Personal income/expense tracking with categories, receipts, and recurring subscriptions (processed via external cron endpoint)

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Passport.js (JWT & Google OAuth)
- **Security:** CSRF-CSRF, bcryptjs
- **Package Manager:** pnpm

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker (for PostgreSQL)

## Project Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Configure environment variables:** Create a `.env` file in the root directory with the
   following variables:

```env
# Application
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="postgresql://auth_project:auth_project@localhost:5666/auth_project?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# Postgres Docker Configuration
POSTGRES_USER=auth_project
POSTGRES_PASSWORD=auth_project
POSTGRES_DB=auth_project

# Budget cron (optional) - secret for POST /budget-subscriptions/process-due (external scheduler)
# BUDGET_CRON_SECRET=your_secret_here
```

3. **Start PostgreSQL with Docker:**

```bash
docker-compose up -d
```

4. **Generate and run database migrations:**

```bash
# Generate migration files
pnpm db:generate

# Push schema changes to database
pnpm db:push
```

## Running the Application

```bash
# Development mode with watch
pnpm dev

# Standard development mode
pnpm start

# Production mode
pnpm prod
```

The API will be available at `http://localhost:8080` (or your configured PORT).

## Database Management

```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio

# Generate new migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes directly
pnpm db:push

# Clear database
pnpm db:clear

# Seed budget categories (system categories)
pnpm db:seed:budget-categories
```

## Code Quality

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Build for production
pnpm build
```

## Project Structure

```
src/
├── app/
│   ├── auth/                 # Authentication module
│   ├── budget-categories/    # Budget categories CRUD
│   ├── budget-transactions/  # Budget transactions + receipts
│   ├── budget-subscriptions/ # Recurring subscriptions (process-due for external cron)
│   ├── overview/             # Dashboard overview (metrics, recent data, budget summary)
│   └── ...                   # contacts, currency, history, media, transactions, etc.
├── core/                     # Core utilities
├── csrf/                     # CSRF protection module
├── database/                 # Database configuration
└── models/
    └── drizzle/              # Drizzle ORM models (auth, budget, transactions, etc.)
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get user profile

### CSRF

- `GET /csrf` - Get CSRF token

### Budget (JWT required unless noted)

- `GET /budget-categories` - List categories (system + user)
- `POST /budget-categories` - Create custom category
- `PATCH /budget-categories/:id` - Update category
- `DELETE /budget-categories/:id` - Delete category
- `GET /budget-transactions` - List transactions (pagination, filters)
- `GET /budget-transactions/:id` - Get transaction
- `POST /budget-transactions` - Create transaction
- `PATCH /budget-transactions/:id` - Update transaction
- `DELETE /budget-transactions/:id` - Delete transaction
- `POST /budget-transactions/:id/receipts/:mediaPublicId` - Attach receipt
- `DELETE /budget-transactions/:id/receipts/:mediaPublicId` - Detach receipt
- `GET /budget-subscriptions` - List subscriptions
- `GET /budget-subscriptions/:id` - Get subscription
- `POST /budget-subscriptions` - Create subscription
- `PATCH /budget-subscriptions/:id` - Update subscription
- `DELETE /budget-subscriptions/:id` - Delete subscription
- `POST /budget-subscriptions/process-due` - Process due subscriptions (no JWT; requires `X-Cron-Secret` header; for external cron)

### Overview

- `GET /overview` - Dashboard overview (includes loan metrics and optional budget summary + recent budget transactions)

## Security Features

- JWT token-based authentication
- HTTP-only cookies for token storage
- CSRF token validation on state-changing requests
- Password hashing with bcrypt
- Session management with device tracking
- IP address and user agent logging

## Documentation

For additional documentation, see:

- [CSRF Implementation](docs/CSRF_IMPLEMENTATION.md)
- [Budget (Self-Accounting) Feature](docs/BUDGET_FEATURE.md)
- [Overview Feature](docs/OVERVIEW_FEATURE.md)
- [Testing Removal Guide](docs/REMOVE_TESTING.md)

## License

UNLICENSED - Private project
