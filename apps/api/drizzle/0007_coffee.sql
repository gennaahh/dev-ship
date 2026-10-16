CREATE TABLE "player_coffee" (
	"user_id" text PRIMARY KEY NOT NULL,
	"coffee_id" text NOT NULL,
	"until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_coffee" ADD CONSTRAINT "player_coffee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;