CREATE TABLE "synthetic_csv_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"domain" text,
	"resultStyle" text,
	"inputType" text,
	"s3Key" text,
	"header_schema" text,
	"instruction" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "synthetic_csv_content" ADD CONSTRAINT "synthetic_csv_content_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synthetic_csv_content" ADD CONSTRAINT "synthetic_csv_content_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "synthetic_csv_content_title_idx" ON "synthetic_csv_content" USING btree ("title");