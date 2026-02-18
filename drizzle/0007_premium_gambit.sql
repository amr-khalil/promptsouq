CREATE TABLE "marketplace_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"commission_rate" real DEFAULT 0.2 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "deleted_at" timestamp with time zone;