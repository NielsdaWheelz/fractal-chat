CREATE TYPE "public"."permission_level" AS ENUM('read', 'write', 'admin');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TYPE "public"."resource" ADD VALUE 'group';--> statement-breakpoint
ALTER TABLE "permission" ALTER COLUMN "principalType" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."principal";--> statement-breakpoint
CREATE TYPE "public"."principal" AS ENUM('user', 'group');--> statement-breakpoint
ALTER TABLE "permission" ALTER COLUMN "principalType" SET DATA TYPE "public"."principal" USING "principalType"::"public"."principal";--> statement-breakpoint
ALTER TABLE "annotation" ADD COLUMN "visibility" "visibility";--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "visibility" "visibility";--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "permissionLevel" "permission_level" DEFAULT 'read' NOT NULL;