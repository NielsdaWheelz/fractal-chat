ALTER TABLE "annotation" ADD COLUMN "start" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "annotation" ADD COLUMN "end" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "annotation" ADD COLUMN "quote" text;--> statement-breakpoint
ALTER TABLE "annotation" ADD COLUMN "prefix" text;--> statement-breakpoint
ALTER TABLE "annotation" ADD COLUMN "suffix" text;--> statement-breakpoint
ALTER TABLE "annotation" DROP COLUMN "highlights";