CREATE TABLE "free_prompt_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt_id" uuid NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "free_prompt_access_user_prompt_unique" UNIQUE("user_id","prompt_id")
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "gallery" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "free_prompt_access" ADD CONSTRAINT "free_prompt_access_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "free_prompt_access_user_id_idx" ON "free_prompt_access" USING btree ("user_id");