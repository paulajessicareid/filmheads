CREATE TABLE "fh_recommendation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"batch_generated_at" timestamp NOT NULL,
	"tmdb_id" integer,
	"title" text NOT NULL,
	"poster_path" text,
	"genres" text,
	"director" text,
	"country" text,
	"language" text,
	"is_independent" boolean DEFAULT false NOT NULL,
	"pitch" text,
	"fun_fact" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fh_recommendation" ADD CONSTRAINT "fh_recommendation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;