CREATE TABLE "author" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_authors" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"author_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_authors" ADD CONSTRAINT "document_authors_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_authors" ADD CONSTRAINT "document_authors_author_id_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "author_user_name_idx" ON "author" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "doc_author_idx" ON "document_authors" USING btree ("document_id","author_id");