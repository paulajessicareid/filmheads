CREATE TABLE "user_genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"genre" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_genre_user_id_genre_unique" UNIQUE("user_id","genre")
);
--> statement-breakpoint
ALTER TABLE "user_genre" ADD CONSTRAINT "user_genre_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;