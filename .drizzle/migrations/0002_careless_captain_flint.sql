CREATE TYPE "public"."budget_recurrence" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."budget_transaction_type" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"icon" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_categories_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "budget_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"currency" jsonb DEFAULT '{"code":"USD","name":"US Dollar","symbol":"$"}'::jsonb NOT NULL,
	"name" varchar(255) NOT NULL,
	"recurrence" "budget_recurrence" NOT NULL,
	"next_run_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_subscriptions_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "budget_transaction_receipts" (
	"budget_transaction_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_transaction_receipts_budget_transaction_id_media_id_pk" PRIMARY KEY("budget_transaction_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "budget_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" "budget_transaction_type" NOT NULL,
	"currency" jsonb DEFAULT '{"code":"USD","name":"US Dollar","symbol":"$"}'::jsonb NOT NULL,
	"category_id" integer,
	"date" timestamp with time zone NOT NULL,
	"note" text,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_transactions_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "user_mfa_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"totp_secret" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"setup_complete" boolean DEFAULT false NOT NULL,
	"backup_codes" text[],
	"used_backup_codes" text[] DEFAULT '{}',
	"last_totp_used_at" timestamp,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"enabled_at" timestamp,
	"disabled_at" timestamp,
	"last_backup_generation" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_subscriptions" ADD CONSTRAINT "budget_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_subscriptions" ADD CONSTRAINT "budget_subscriptions_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transaction_receipts" ADD CONSTRAINT "budget_transaction_receipts_budget_transaction_id_budget_transactions_id_fk" FOREIGN KEY ("budget_transaction_id") REFERENCES "public"."budget_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transaction_receipts" ADD CONSTRAINT "budget_transaction_receipts_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_settings" ADD CONSTRAINT "user_mfa_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budget_categories_public_id_idx" ON "budget_categories" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_categories_user_id_slug_idx" ON "budget_categories" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "budget_categories_user_id_idx" ON "budget_categories" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_subscriptions_public_id_idx" ON "budget_subscriptions" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "budget_subscriptions_user_id_idx" ON "budget_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budget_subscriptions_next_run_at_idx" ON "budget_subscriptions" USING btree ("next_run_at");--> statement-breakpoint
CREATE INDEX "budget_transaction_receipts_budget_transaction_id_idx" ON "budget_transaction_receipts" USING btree ("budget_transaction_id");--> statement-breakpoint
CREATE INDEX "budget_transaction_receipts_media_id_idx" ON "budget_transaction_receipts" USING btree ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_transactions_public_id_idx" ON "budget_transactions" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "budget_transactions_user_id_idx" ON "budget_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budget_transactions_date_idx" ON "budget_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "budget_transactions_type_idx" ON "budget_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "budget_transactions_category_id_idx" ON "budget_transactions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_user_id_idx" ON "user_mfa_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_is_enabled_idx" ON "user_mfa_settings" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "user_mfa_settings_locked_until_idx" ON "user_mfa_settings" USING btree ("locked_until");