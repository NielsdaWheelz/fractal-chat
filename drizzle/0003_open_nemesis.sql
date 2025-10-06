CREATE TABLE "annotation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"doc_id" text NOT NULL,
	"perm_ids" text[] NOT NULL,
	"body" text,
	"highlights" text
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text,
	"user_id" text NOT NULL,
	"annotation_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_doc_id_document_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_annotation_id_annotation_id_fk" FOREIGN KEY ("annotation_id") REFERENCES "public"."annotation"("id") ON DELETE cascade ON UPDATE no action;