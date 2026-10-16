CREATE TABLE "mine_find" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"value" integer NOT NULL,
	"found_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_equipment" ADD COLUMN "weapon" text;--> statement-breakpoint
ALTER TABLE "player_equipment" ADD COLUMN "armor" text;--> statement-breakpoint
ALTER TABLE "mine_find" ADD CONSTRAINT "mine_find_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mine_find_found_at_idx" ON "mine_find" USING btree ("found_at");