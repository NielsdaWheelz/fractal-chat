CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"textContent" text,
	"authors" text NOT NULL,
	"published_time" text NOT NULL
);
