CREATE TABLE "synthetic_csv_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"synthetic_csv_content_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"format" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "synthetic_csv_file" ADD CONSTRAINT "synthetic_csv_file_synthetic_csv_content_id_synthetic_csv_content_id_fk" FOREIGN KEY ("synthetic_csv_content_id") REFERENCES "public"."synthetic_csv_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "synthetic_csv_file_content_idx" ON "synthetic_csv_file" USING btree ("synthetic_csv_content_id");