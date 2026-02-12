CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_prompt_unique" UNIQUE("user_id","prompt_id")
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "user_id" text;--> statement-breakpoint
UPDATE "reviews" SET "user_id" = 'seed-user-' || "id" WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_prompt_unique" UNIQUE("user_id","prompt_id");