CREATE TYPE "public"."transaction_history_action" AS ENUM('create', 'update', 'status_change', 'delete', 'partial_repay', 'complete_repay', 'request_repay', 'accept_repay', 'reject_repay', 'add_payment');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'accepted', 'rejected', 'partially_paid', 'requested_repay', 'completed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('lend', 'borrow');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"ip_address" text DEFAULT 'Unknown',
	"user_agent" text DEFAULT 'Unknown',
	"device_name" varchar(255) DEFAULT 'Unknown Device',
	"device_type" varchar(50) DEFAULT 'Unknown',
	"two_factor_verified" boolean DEFAULT false NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"image_information" jsonb,
	"phone" varchar(20),
	"currency_code" text,
	"is_2fa_enabled" boolean DEFAULT false NOT NULL,
	"receive_transaction_emails" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verifications_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "transaction_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" integer,
	"transaction_public_id" text NOT NULL,
	"borrower_id" integer NOT NULL,
	"lender_id" integer NOT NULL,
	"currency" jsonb DEFAULT '{"code":"USD","name":"US Dollar","symbol":"$"}'::jsonb NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT 0 NOT NULL,
	"remaining_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"review_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"rejection_reason" text,
	"due_date" timestamp,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"completed_at" timestamp,
	"rejected_at" timestamp,
	"action" "transaction_history_action" NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_histories_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_extension" varchar(10) NOT NULL,
	"secure_url" text,
	"file_size" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"duration" numeric(10, 2),
	"storage_key" text NOT NULL,
	"media_type" text NOT NULL,
	"alt_text" text,
	"caption" text,
	"description" text,
	"tags" json,
	"storage_metadata" json,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200),
	"description" text,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"requested_user_id" integer NOT NULL,
	"connected_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" integer NOT NULL,
	"lender_id" integer NOT NULL,
	"currency" jsonb DEFAULT '{"code":"USD","name":"US Dollar","symbol":"$"}'::jsonb NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT 0 NOT NULL,
	"remaining_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"review_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"rejection_reason" text,
	"due_date" timestamp,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"completed_at" timestamp,
	"rejected_at" timestamp,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_currency_code_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currencies"("code") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_requested_user_id_users_id_fk" FOREIGN KEY ("requested_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_connected_user_id_users_id_fk" FOREIGN KEY ("connected_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_public_id_idx" ON "accounts" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_account_id_provider_id_idx" ON "accounts" USING btree ("account_id","provider_id");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_id_idx" ON "accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "accounts_access_token_expires_at_idx" ON "accounts" USING btree ("access_token_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_public_id_idx" ON "sessions" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_is_revoked_idx" ON "sessions" USING btree ("is_revoked");--> statement-breakpoint
CREATE INDEX "sessions_user_id_is_revoked_idx" ON "sessions" USING btree ("user_id","is_revoked");--> statement-breakpoint
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_public_id_idx" ON "users" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_email_verified_idx" ON "users" USING btree ("email_verified");--> statement-breakpoint
CREATE INDEX "users_is_2fa_enabled_idx" ON "users" USING btree ("is_2fa_enabled");--> statement-breakpoint
CREATE INDEX "users_name_lower_idx" ON "users" USING btree (LOWER("name"));--> statement-breakpoint
CREATE INDEX "users_email_lower_idx" ON "users" USING btree (LOWER("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_public_id_idx" ON "verifications" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verifications_value_idx" ON "verifications" USING btree ("value");--> statement-breakpoint
CREATE INDEX "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verifications_identifier_value_idx" ON "verifications" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "currencies_code_idx" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_histories_public_id_idx" ON "transaction_histories" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "transaction_histories_transaction_id_idx" ON "transaction_histories" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transaction_histories_borrower_id_idx" ON "transaction_histories" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "transaction_histories_lender_id_idx" ON "transaction_histories" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "transaction_histories_status_idx" ON "transaction_histories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaction_histories_action_idx" ON "transaction_histories" USING btree ("action");--> statement-breakpoint
CREATE INDEX "transaction_histories_occurred_at_idx" ON "transaction_histories" USING btree ("occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_templates_key_version_uq" ON "email_templates" USING btree ("key","version");--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_requested_connected_idx" ON "contacts" USING btree ("requested_user_id","connected_user_id");--> statement-breakpoint
CREATE INDEX "contacts_requested_user_id_idx" ON "contacts" USING btree ("requested_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_public_id_idx" ON "payments" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "payments_transaction_id_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_payment_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_public_id_idx" ON "transactions" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "transactions_borrower_id_idx" ON "transactions" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "transactions_lender_id_idx" ON "transactions" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "transactions_borrower_id_status_idx" ON "transactions" USING btree ("borrower_id","status");--> statement-breakpoint
CREATE INDEX "transactions_lender_id_status_idx" ON "transactions" USING btree ("lender_id","status");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_due_date_idx" ON "transactions" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "transactions_due_date_status_idx" ON "transactions" USING btree ("due_date","status");