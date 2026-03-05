CREATE TABLE "user_mfa_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "totp_secret" text,
  "is_enabled" boolean DEFAULT false,
  "setup_complete" boolean DEFAULT false,
  "backup_codes" text[],
  "used_backup_codes" text[] DEFAULT '{}',
  "last_totp_used_at" timestamp,
  "failed_attempts" integer DEFAULT 0,
  "locked_until" timestamp,
  "enabled_at" timestamp,
  "disabled_at" timestamp,
  "last_backup_generation" timestamp,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_mfa_settings"
  ADD CONSTRAINT "user_mfa_settings_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_mfa_settings_user_id_idx" ON "user_mfa_settings" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_mfa_settings_is_enabled_idx" ON "user_mfa_settings" USING btree ("is_enabled");
--> statement-breakpoint
CREATE INDEX "user_mfa_settings_locked_until_idx" ON "user_mfa_settings" USING btree ("locked_until");

