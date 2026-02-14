CREATE TABLE "seller_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"stripe_account_id" text,
	"country" text,
	"charges_enabled" boolean DEFAULT false NOT NULL,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"details_submitted" boolean DEFAULT false NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_profiles_stripe_account_id_unique" UNIQUE("stripe_account_id")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "referral_source" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "commission_rate" real;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "seller_payout_amount" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "seller_stripe_account_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "seller_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "status" text DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "generation_type" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "model_version" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "max_tokens" integer;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "temperature" real;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "example_outputs" text[];--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "example_prompts" jsonb;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
CREATE INDEX "idx_prompts_seller_id" ON "prompts" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_prompts_status" ON "prompts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_prompts_seller_status" ON "prompts" USING btree ("seller_id","status");