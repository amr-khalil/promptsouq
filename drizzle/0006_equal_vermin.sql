CREATE TABLE "credit_balances" (
	"user_id" text PRIMARY KEY NOT NULL,
	"subscription_credits" integer DEFAULT 0 NOT NULL,
	"topup_credits" integer DEFAULT 0 NOT NULL,
	"stripe_customer_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_balances_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "credit_topup_packs" (
	"id" text PRIMARY KEY NOT NULL,
	"credits" integer NOT NULL,
	"price" integer NOT NULL,
	"stripe_price_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"credit_source" text NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"balance_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"prompt_id" uuid NOT NULL,
	"generation_type" text NOT NULL,
	"model" text NOT NULL,
	"input_prompt" text NOT NULL,
	"result_text" text,
	"result_image_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"credits_consumed" integer DEFAULT 0 NOT NULL,
	"credit_source" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"monthly_credits" integer NOT NULL,
	"monthly_price" integer NOT NULL,
	"six_month_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"stripe_price_id_monthly" text NOT NULL,
	"stripe_price_id_six_month" text NOT NULL,
	"stripe_price_id_yearly" text NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"theme" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"billing_cycle" text NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_user_id" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_created_at" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_generations_user_id" ON "generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_generations_prompt_id" ON "generations" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "idx_generations_created_at" ON "generations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_sub_id" ON "user_subscriptions" USING btree ("stripe_subscription_id");