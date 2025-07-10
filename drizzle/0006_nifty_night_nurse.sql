CREATE TABLE "synthetic_data_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"synthetic_data_content_id" uuid NOT NULL,
	"s3Key" text NOT NULL,
	"format" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "synthetic_data_file" ADD CONSTRAINT "synthetic_data_file_synthetic_data_content_id_synthetic_data_content_id_fk" FOREIGN KEY ("synthetic_data_content_id") REFERENCES "public"."synthetic_data_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "synthetic_data_file_content_idx" ON "synthetic_data_file" USING btree ("synthetic_data_content_id");--> statement-breakpoint
ALTER TABLE "synthetic_data_content" DROP COLUMN "generatedContent";--> statement-breakpoint
ALTER TABLE "synthetic_data_content" DROP COLUMN "generatedContentKey";