CREATE TABLE "player_score" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_score" ADD CONSTRAINT "player_score_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "player_score_created_at_idx" ON "player_score" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "player_score_user_id_idx" ON "player_score" USING btree ("user_id");--> statement-breakpoint
-- Le missioni salvate finora hanno needs e reward come stringa JSON invece che come oggetto (il
-- jsonb di drizzle col driver bun-sql, vedi schema.ts): si rimettono a posto.
UPDATE "office_mission" SET "needs" = ("needs" #>> '{}')::jsonb WHERE jsonb_typeof("needs") = 'string';--> statement-breakpoint
UPDATE "office_mission" SET "reward" = ("reward" #>> '{}')::jsonb WHERE jsonb_typeof("reward") = 'string';--> statement-breakpoint
-- I punti fatti finora: le catture (coi loro punti), le scoperte in miniera (5 per moneta di
-- valore; le pietre non erano registrate) e le missioni consegnate (2 per moneta del premio).
-- Le run nel dungeon non erano salvate: contano da adesso.
INSERT INTO "player_score" ("user_id", "game", "points", "created_at")
SELECT "user_id", 'fishing', "points", "caught_at" FROM "fish_catch";--> statement-breakpoint
INSERT INTO "player_score" ("user_id", "game", "points", "created_at")
SELECT "user_id", 'mining', "value" * 5, "found_at" FROM "mine_find";--> statement-breakpoint
INSERT INTO "player_score" ("user_id", "game", "points", "created_at")
SELECT "taken_by", 'mission', ("reward"->>'gold')::int * 2, "finished_at" FROM "office_mission" WHERE "status" = 'done' AND "taken_by" IS NOT NULL;
