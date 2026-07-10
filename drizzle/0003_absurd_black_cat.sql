CREATE TABLE "user_country" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"country_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_country_user_id_country_code_unique" UNIQUE("user_id","country_code")
);
--> statement-breakpoint
CREATE TABLE "user_language" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_language_user_id_language_code_unique" UNIQUE("user_id","language_code")
);
--> statement-breakpoint
ALTER TABLE "user_country" ADD CONSTRAINT "user_country_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language" ADD CONSTRAINT "user_language_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;