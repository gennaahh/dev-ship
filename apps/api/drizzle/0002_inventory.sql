CREATE TABLE "gold_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_equipment" (
	"user_id" text PRIMARY KEY NOT NULL,
	"hat" text,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "player_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"weight_g" integer,
	"catch_id" integer,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gold_ledger" ADD CONSTRAINT "gold_ledger_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_equipment" ADD CONSTRAINT "player_equipment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_item" ADD CONSTRAINT "player_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_item" ADD CONSTRAINT "player_item_catch_id_fish_catch_id_fk" FOREIGN KEY ("catch_id") REFERENCES "public"."fish_catch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gold_ledger_user_id_idx" ON "gold_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "player_item_user_id_idx" ON "player_item" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_item_unique_idx" ON "player_item" USING btree ("user_id","item_id") WHERE "player_item"."item_id" <> 'fish';--> statement-breakpoint
-- I pesci presi prima dell'inventario ci entrano adesso.
INSERT INTO "player_item" ("user_id", "item_id", "weight_g", "catch_id", "acquired_at")
SELECT "user_id", 'fish', "weight_g", "id", "caught_at" FROM "fish_catch";
