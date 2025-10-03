CREATE TABLE "document_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"text" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"authors" text,
	"published_time" text,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "embedding";