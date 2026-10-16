CREATE TABLE "office_mission" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot" integer NOT NULL,
	"difficulty" text NOT NULL,
	"requester" text NOT NULL,
	"title" text NOT NULL,
	"needs" jsonb NOT NULL,
	"reward" jsonb NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"taken_by" text,
	"taken_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "office_mission" ADD CONSTRAINT "office_mission_taken_by_user_id_fk" FOREIGN KEY ("taken_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "office_mission_open_slot_idx" ON "office_mission" USING btree ("slot") WHERE "office_mission"."status" = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "office_mission_taken_idx" ON "office_mission" USING btree ("taken_by") WHERE "office_mission"."status" = 'taken';--> statement-breakpoint
CREATE INDEX "office_mission_taken_by_idx" ON "office_mission" USING btree ("taken_by");--> statement-breakpoint
CREATE INDEX "office_mission_status_idx" ON "office_mission" USING btree ("status","finished_at");