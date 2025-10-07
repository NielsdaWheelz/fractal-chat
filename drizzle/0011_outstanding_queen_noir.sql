ALTER TABLE "annotation" RENAME COLUMN "doc_id" TO "document_id";--> statement-breakpoint
ALTER TABLE "annotation" DROP CONSTRAINT "annotation_doc_id_document_id_fk";
--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;