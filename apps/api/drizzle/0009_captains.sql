CREATE TABLE "captain_week" (
	"week_start" date NOT NULL,
	"rank" integer NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"points" integer NOT NULL,
	"hat" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "captain_week_week_start_rank_pk" PRIMARY KEY("week_start","rank")
);
--> statement-breakpoint
ALTER TABLE "captain_week" ADD CONSTRAINT "captain_week_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;