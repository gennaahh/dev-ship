# Dev City

A small Vue 3 single page application: a cartoon city for the dev team.

## The city

The home page is a city. In the middle of the square stands a big billboard whose screen switches every 5 seconds between the **dev-ship** (the working week as a ship's voyage, see below), the weekly **leaderboard** (for now with made-up data, just a demo) and the **changelog** of the latest changes (scrollable when zoomed in, it starts back from the top every time it shows up).

- Click the billboard to zoom in on it: the frame and a bit of the city stay in view. Up close the dev-ship shows its time slider, the tabs under the screen switch view by hand, and the rotation pauses while the pointer is on the screen. Click the city, press "Torna in città" or Esc to zoom back out.
- Double-click the **Dev-ship** label under the billboard screen to open the dev-ship alone, full screen, without the rest of the interface (handy on a wall screen). Esc or another double-click closes it.
- Under the billboard there is the **square** (`#/piazza`). Inside it is seen from above like the rooms of Club Penguin: click where you want to go and your character walks there. A few demo characters stroll around and chat. The **shop** stall on the left opens a catalog where you can try colours and hats on a preview; logged-in players buy them with gold coins and wear them right away.
- Around the billboard there are the **mine**, the **dungeon**, the **office**, the **museum** and the **fishing spot**. Click one to fly to its door and go inside (`#/miniera`, `#/dungeon`, `#/ufficio`, `#/museo`, `#/pesca`). The museum is a draft for now; the `−` button folds the info panel of every interior.
- The **fishing spot** (`#/pesca`) is the first game. Seen from high above, it has a lake with 10 chairs around it and a big meadow where players walk and chat like in the plaza. Logged-in players click a free chair to walk there and sit down, one player per chair (whoever gets there first). A fish bites after 10 to 20 minutes, and 3 times out of 4 it stays on the hook. Its weight is 1–4.9 kg, or 5–20 kg one time in ten, and every kilo is worth 10 points. A billboard in the top left cycles between the leaderboard of today, this week (from Monday) and all time, and the latest catches. Fish of 5 kg or more get a full-screen celebration that everyone at the lake sees. Standing up, walking away or leaving frees the chair. Without login, or in demo mode, you stroll on your own while the leaderboard crew fishes.
- The **mine** (`#/miniera`) is the second idle game, built like the fishing spot: players walk and chat in a gallery seen from the front, with 8 ore veins at the foot of the rock wall. Click a free vein to walk there and start digging, one player per vein. Every 4 to 6 minutes a **stone** comes off, and every 15 to 25 minutes (on its own clock) you **find** something in the rock: an ore (copper, iron, silver, a gold nugget) or a gem (quartz, amethyst, emerald, ruby, diamond), the rarer the more valuable. Nothing escapes, unlike fish. Everything sells (stone 1 gold, a diamond 60) or goes into crafting weapons and armour. Finds from the gold nugget up get the full-screen celebration everyone in the mine sees, and a board on the wall cycles between the miners of today, this week and all time (by the value of their finds) and the latest finds. Balanced against fishing: selling everything, the mine makes about 25 gold an hour and fishing about 19, plus the dungeon tickets that only come from the lake (`bun packages/shared/scripts/mine-balance.ts`).
- The **office** (`#/ufficio`) has the **mission board**: there are always 4 missions on it (two easy, one medium, one hard), each one a request from somebody in the city for fish, soups, stones, ores, gems or dungeon materials, with its reward already on the note. Rewards are gold, worth about 1.5 times what the items would sell for (materials and soups, which don't sell, count for what they take to get), and hard missions bring a dungeon ticket half of the time. As soon as somebody takes a mission, a new one of the same difficulty takes its place, so the board never fills up with hard leftovers. The board also shows who is working on what and the latest missions done. One mission at a time: the clipboard in the top right corner (or **M**) opens it, with what you have against what it asks; it gets a tick when everything is in the inventory. **Complete** hands the items over (fish are the lightest ones, as in the kitchen) and pays the reward; **Cancel** throws the mission away and you can't take another one for an hour. Without login, or in demo mode, the board can only be looked at.
- Logged-in players have an **inventory**. Their character, name and gold coins are in the top right corner: click it, or press **I**, to open it. It holds the fish you caught, each with its weight, and the hats and colours you bought, and it shows what you are wearing (one hat and one colour). Sell fish for 1 gold per kilo, rounded per fish; special fish (5 kg or more) are worth 3 times as much (they stay on the leaderboard), spend the gold at the plaza shop, and wear what you own: everyone sees your look in the plaza and at the lake. Fish caught before the inventory existed are in it too.
- Next to the inventory there is the **crafting** window (the anvil, or press **R**), with five benches. In the **kitchen**, 3 fish make 1 **fish soup**, and the cook always takes your lightest fish, so the big and special ones stay for selling. Soups go into the inventory and can't be sold: they are for the dungeon. The two **forges** make 6 **weapons** (stone club, copper, iron and silver swords, the hotfix hammer, the diamond debugger) and 6 **armours** (bug-hide vest, copper mail, iron plate, silver armour, incident-scale armour, uptime armour) out of mine ores and gems plus dungeon materials: fangs, crystals and kernel cores for weapons, hides, silk and scales for armour; the higher the tier, the rarer the ingredients. Each recipe shows what you have and what is missing, and the stats against what you wear. Wear one weapon and one armour from the character window (**C**): they count in the dungeon. Two more benches make 6 **fishing rods** and 6 **pickaxes** (copper rod to the git fetch rod, stone pickaxe to the git bisect pickaxe): held from the character window, they shorten the wait at the lake and in the mine (5% to 30% by tier) and make the rare stuff more likely (special fish, uncommon and rare finds), and everyone sees the tool in your hands. At the same tier a rod and a pickaxe add about the same gold per hour (up to +60%, `bun packages/shared/scripts/mine-balance.ts`). Weapons, armour and tools can't be sold, but they can be traded.
- One catch in 15 also brings up a **bottle** with a **dungeon ticket** inside. In the **dungeon** (`#/dungeon`) a ticket buys one run: you start with 100 HP (more with armour) and waves of bug monsters come, stronger each time, with a boss every 5 waves (20 waves at most). The run plays by itself: you only watch (or skip to the end). When you drop to 50 HP or less you drink a soup (+30 HP) automatically, as long as you have any. Your weapon sets the damage of every hit (12–18 with the starting wooden sword, up to 32–45), your armour adds HP and stops part of every blow (5% to 30%): each tier brings back roughly 15–40% more gold per ticket, and even the best gear doesn't clear all 20 waves without plenty of soups. Monsters drop gold and **materials** for the weapons and armour of the forges: two common (bug hide, bug fang), two uncommon (web silk, cache crystal) and two rare ones, almost only from the boss (incident scale, kernel core), one of each tier for armour and one for weapons. You keep everything even when you lose. Soups are worth it: on average each one brings back about 10–15 gold plus materials, more than the 3 small fish it costs. Without login there is a practice run with no rewards.

Characters are drawn by `src/city/Avatar.vue` from a "look" (`{ color, hat }`, see `src/city/avatar.js`), so customisation only has to save that object.

## The dev-ship

The screen of the billboard shows the working week as a ship's voyage.

**Live demo:** https://dev-ship.netlify.app

## How it works

- The ship leaves the **port** (left) on **Monday at 09:00**.
- It sails steadily to reach the **buoy** (right) on **Wednesday at 13:30**, the halfway point of the week.
- It turns around at the buoy and gets back to port on **Friday at 18:00**.
- Outside working hours it stays moored in port. The view zooms in on the ship for a close-up of the port at work: a crane loads containers into the hold and a worker repairs the hull.
- While sailing, from 18:00 until work resumes at 09:00 the next morning, the view zooms in on the crew resting on deck under the stars: hammocks, a deck chair and a lantern.
- Every day from 13:00 to 14:00 there is a lunch break on board, with the same zoom in/zoom out. Lunch wins when the ship is also in port.

Sea monsters show up only at certain times, and only in the open sea view:

- the **Kraken** comes up every day from 11:11 to 11:16;
- a **pterodactyl** flies by once a week, for 5 minutes, on a weekday picked at random (the pick is fixed for each week, so reloading doesn't change it);
- **Poseidon** comes out on Wednesday afternoon (14:00–18:00) to push the ship home after it turns at the buoy;
- on **Friday**, for the first 5 minutes of every hour, a **plane** crosses the sky towing a banner that says "Dai che è venerdì!".

The weather changes too: every day, for one hour picked at random, there is a **storm** (dark clouds, rain, lightning and a rolling ship) or **fog** over the sea. Like the pterodactyl, the pick only uses hours when the open sea is on screen, and it stays fixed for the week.

The position follows your local time. Use the slider at the top of the zoomed billboard to simulate any moment of the week, and press "Torna all'ora attuale" to go back to live time. You can also open a given moment directly with `?at=2026-09-23T13:30`.

The backend is being prototyped (see `docs/adr/0001-stack-backend.md`). For now there are:

- **login with GitHub**: press "Accedi con GitHub" in the bottom left corner. No passwords. In development you can also log in with just a name (see Backend below);
- **fishing**: the game server (`FishingRoom`) moves the players around the lake, runs the chairs, the bite timer, the bottles and the chat, and it saves every catch in PostgreSQL (`fish_catch`). The API serves the leaderboard at `GET /api/fishing/leaderboard`, with the top 10 of today, this week and all time (Italian time) and the latest 10 catches;
- **inventory and gold**: every catch also goes into the player's inventory (`player_item`). Gold is a ledger (`gold_ledger`): every sale and purchase is a row and the balance is their sum, so it never goes below zero. What each player wears (hat, colour, weapon, armour, rod and pickaxe) is in `player_equipment`, which the plaza, fishing and mine rooms read to show everyone's look (the lake and the mine also read the rod and the pickaxe for their timers and odds) and the dungeon reads for the gear. The API serves `GET /api/inventory` and `POST /api/inventory/sell` (fish), `/api/inventory/sell-items` (stones, ores and gems), `/api/inventory/equip`, `/api/inventory/craft` and `/api/shop/buy`, logged in only. Fish are one row each (with their weight); everything else is one row per player with a `quantity` (soups, tickets, materials, minerals, weapons, armour and tools). Item ids, names and prices live in one catalog shared by the API and the frontend (`packages/shared/src/catalog.ts`);
- **mining**: the game server (`MineRoom`) moves the players in the mine, runs the veins and the two clocks of every miner (stones and finds, rules in `packages/shared/src/mine.ts`), and saves what is found in the inventory; ores and gems also go in `mine_find`, from which the API serves the mine board at `GET /api/mine/leaderboard`;
- **trades between players**: in the plaza, at the lake and in the mine, right-click (long press on phones) another player and pick "Richiedi scambio". If they accept, a trade window opens for both: each side puts in gold, fish, soups, tickets, materials, minerals, weapons, armour and hats (not colours, they are free). Then the usual double confirmation: both press "Pronto" (the offers lock; it unlocks 3 seconds after the last change, so nobody can swap things at the last second), then both press "Conferma scambio". Any change to an offer takes back both confirmations. The game server (`apps/game/src/trade.ts`, shared by `PlazaRoom`, `FishingRoom` and `MineRoom`) checks every offer against the database and makes the trade in one transaction, checking everything again; a worn hat, or the last copy of a worn weapon or armour, that changes hands comes off. Leaving the room, or losing the connection, cancels the trade;
- **dungeon runs**: `POST /api/dungeon/run` uses a ticket, simulates the whole run on the server with the weapon and armour worn (`packages/shared/src/dungeon.ts`, a pure function the frontend also uses for the practice run) and saves the soups drunk, the gold and the materials in one transaction. The response carries the run's timeline, which the dungeon plays back. To tune the monsters and drops, `bun packages/shared/scripts/dungeon-balance.ts` prints averages over thousands of runs for different numbers of soups and for every tier of weapons and armour;
- **office missions**: the API keeps them in `office_mission`, one row per mission from the moment it is put on the board (`open`, in one of the 4 slots) to `taken`, `done` or `cancelled`. Partial unique indexes keep one open mission per slot and one taken mission per player. `GET /api/office/board` is public (open missions, the ones in progress and the latest done); `GET /api/office/mission` and `POST /api/office/mission/take`, `/cancel` and `/complete` are for logged-in players. Taking a mission puts a new one of the same difficulty in its slot right away; completing it checks and removes the items and pays the reward in one transaction (`reason: 'mission'` in `gold_ledger`); a cancellation in the last hour stops the player from taking another one. The generator and the reward values are in `packages/shared/src/office.ts`;
- a **status badge** in the bottom left corner, with one light for the API and one for the game server (green: online, red: offline).

All of this is on in development. A production build has it only when `VITE_API_URL` and `VITE_GAME_URL` are set at build time; without them (the live site today, or the file opened from disk) it runs in **demo mode**: the static city, with no login, no status badge, no multiplayer and none of the backend changelog entries (`backend: true` in `src/city/changelog.js`).

## Development

Requires [Bun](https://bun.sh) and, for the backend, Docker.

```bash
bun install
bun run dev      # frontend only, with hot reload
bun run build    # builds a single self-contained dist/index.html
```

The build puts all JS and CSS inside `dist/index.html`, so the file also works when opened directly from disk.

### Backend

The first time, start the services in Docker (`docker-compose.yml`) and create the database tables:

```bash
bun run infra:up    # PostgreSQL 18 and Redis 8; waits until they are ready
bun run db:migrate  # applies the migrations in apps/api/drizzle
```

Then start frontend, API and game server together:

```bash
bun run dev:all
```

To try fishing without waiting 10–20 minutes for a bite, start the game server with `FISHING_FAST=1`: bites then come after 10–20 seconds. Likewise `MINING_FAST=1` turns the minutes of the mine into seconds: a stone every 4–6 seconds, a find every 15–25.

To log in during development, type a name next to "Accedi con GitHub" and press **Entra (dev)**: no GitHub needed. The same name is always the same player (with the same inventory, as `<name>@dev.local`). The dev login exists only in development: the API adds it only when `NODE_ENV` is not `production`, and the button is only in dev builds of the frontend. To try the multiplayer, log in with two different names in two browsers (or a normal and a private window), then open `#/piazza`, `#/pesca` or `#/miniera` in both.

To try the real GitHub login too, create an OAuth App at https://github.com/settings/developers with callback URL `http://localhost:3000/api/auth/callback/github` and put its id and secret in `.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. In the plaza you walk by clicking and chat with Enter: while someone types, dots appear over their head, then the message shows up in a speech bubble. Outside the buildings the chat is the city-wide one, inside each place has its own.

`bun run infra:down` stops the services; the data stays in Docker volumes (`docker compose down -v` wipes it). The services listen on `127.0.0.1` only.

### Other PCs on the local network

```bash
bun run dev:lan
```

Vite prints the `Network` address to open on the other PCs (for example `http://192.168.1.10:5173`). The page looks for the API and the game server on the same host it was opened from, so nothing else needs to be configured. If the other PCs can't connect, check that the firewall lets through ports 5173, 3000, and 2567 (with ufw: `sudo ufw allow 5173,3000,2567/tcp`).

### Running the pieces one at a time

```bash
bun run dev       # frontend
bun run dev:api   # API (Hono + Better Auth on Bun, apps/api) on http://localhost:3000, healthcheck at /health
bun run dev:game  # game server (Colyseus on Bun, apps/game) on ws://localhost:2567, healthcheck at /__healthcheck
```

### Configuration

API and game server read `.env` in the repository root, if there is one: copy `.env.example`, which lists every variable. In development they all have defaults; in production the API stops at startup if `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` are missing. The frontend looks for both servers on the host the page was opened from; set `VITE_API_URL` and `VITE_GAME_URL` at build time to point it elsewhere (in a production build they also turn the backend on, see demo mode above).

The database schema lives in `apps/api/src/db`. The tables for players and sessions are generated by Better Auth (`bun run --filter @dev-city/api auth:schema`); after changing the schema, `bun run --filter @dev-city/api db:generate` writes a new migration.

The game server keeps rooms in memory unless `REDIS_URL` is set: then several processes share matchmaking and presence through Redis, and each one needs `PUBLIC_ADDRESS` (the `host:port` clients use to reach it), for example:

```bash
cd apps/game
REDIS_URL=redis://localhost:6379 PORT=2567 PUBLIC_ADDRESS=localhost:2567 bun src/index.ts
REDIS_URL=redis://localhost:6379 PORT=2568 PUBLIC_ADDRESS=localhost:2568 bun src/index.ts
```

## Release

Production runs on Railway as three services built from the root of this repository: `web` (frontend served by Caddy, `Dockerfile.web`), `api` (`apps/api/Dockerfile`, applies the database migrations at startup) and `game` (`apps/game/Dockerfile`). Each service is connected to `main` on GitHub, so **every push to `main` is released**. Each one only rebuilds when files it depends on change, through the watch paths in its settings on Railway (Settings → Build → Watch Paths), which have to be kept in step with what its Dockerfile copies:

- `web`: `/src/**`, `/index.html`, `/vite.config.js`, `/packages/shared/**`, `/Dockerfile.web`, `/Caddyfile.web`, `/package.json`, `/bun.lock`, `/apps/api/package.json`, `/apps/game/package.json`
- `api`: `/apps/api/**`, `/packages/shared/**`, `/package.json`, `/bun.lock`, `/apps/game/package.json`
- `game`: `/apps/game/**`, `/packages/shared/**`, `/package.json`, `/bun.lock`, `/apps/api/package.json`

The Dockerfile of each service is set by the `RAILWAY_DOCKERFILE_PATH` variable.
