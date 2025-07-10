CREATE TABLE "synthetic_data_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"domain" text NOT NULL,
	"resultStyle" text NOT NULL,
	"inputType" text NOT NULL,
	"youtubeUrl" text,
	"s3Key" text,
	"instruction" text,
	"generatedContent" text,
	"generatedContentKey" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "synthetic_data_content" ADD CONSTRAINT "synthetic_data_content_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synthetic_data_content" ADD CONSTRAINT "synthetic_data_content_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "synthetic_data_content_title_idx" ON "synthetic_data_content" USING btree ("title");