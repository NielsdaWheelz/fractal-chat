DROP INDEX "author_user_name_idx";--> statement-breakpoint
DROP INDEX "doc_author_idx";--> statement-breakpoint
ALTER TABLE "author" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "authors";