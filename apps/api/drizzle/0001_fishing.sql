CREATE TABLE "fish_catch" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weight_g" integer NOT NULL,
	"points" integer NOT NULL,
	"caught_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fish_catch" ADD CONSTRAINT "fish_catch_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fish_catch_caught_at_idx" ON "fish_catch" USING btree ("caught_at");