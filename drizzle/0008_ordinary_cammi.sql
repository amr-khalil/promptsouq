CREATE TABLE "feature_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_request_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_votes_user_request_unique" UNIQUE("user_id","feature_request_id")
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" uuid NOT NULL,
	"seller_id" text NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery_image_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_likes_user_image_unique" UNIQUE("user_id","gallery_image_id")
);
--> statement-breakpoint
CREATE TABLE "issue_status_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" uuid NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"note" text NOT NULL,
	"changed_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"reporter_id" text NOT NULL,
	"reporter_name" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feature_votes" ADD CONSTRAINT "feature_votes_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_likes" ADD CONSTRAINT "gallery_likes_gallery_image_id_gallery_images_id_fk" FOREIGN KEY ("gallery_image_id") REFERENCES "public"."gallery_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_status_changes" ADD CONSTRAINT "issue_status_changes_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feature_requests_vote_count" ON "feature_requests" USING btree ("vote_count");--> statement-breakpoint
CREATE INDEX "idx_feature_requests_created_at" ON "feature_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_feature_requests_status" ON "feature_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gallery_images_status" ON "gallery_images" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gallery_images_seller_id" ON "gallery_images" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_gallery_images_prompt_id" ON "gallery_images" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "idx_gallery_images_created_at" ON "gallery_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_issue_status_changes_issue_id" ON "issue_status_changes" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "idx_issues_reporter_id" ON "issues" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "idx_issues_status" ON "issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_issues_created_at" ON "issues" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");