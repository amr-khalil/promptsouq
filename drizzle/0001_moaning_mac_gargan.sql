CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"prompt_id" uuid NOT NULL,
	"price_at_purchase" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"amount_total" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
-- Pre-production: truncate seed data before type conversion (integer → uuid)
TRUNCATE TABLE "reviews" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "prompts" CASCADE;--> statement-breakpoint
-- Drop FK from reviews → prompts before altering types
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_prompt_id_prompts_id_fk";--> statement-breakpoint
-- Drop serial default before type change
ALTER TABLE "prompts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
-- Drop the serial sequence
DROP SEQUENCE IF EXISTS "prompts_id_seq";--> statement-breakpoint
-- Convert prompts.id from integer to uuid
ALTER TABLE "prompts" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
-- Convert reviews.prompt_id from integer to uuid
ALTER TABLE "reviews" ALTER COLUMN "prompt_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
-- Re-add FK from reviews → prompts
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;
