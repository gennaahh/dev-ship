# Dev City

A small Vue 3 single page application: a cartoon city for the dev team.

## The city

The home page is a city. In the middle of the square stands a big billboard whose screen switches every 5 seconds between the **dev-ship** (the working week as a ship's voyage, see below), the weekly **leaderboard** (for now with made-up data, just a demo) and the **changelog** of the latest changes (scrollable when zoomed in, it starts back from the top every time it shows up).

- Click the billboard to zoom in on it: the frame and a bit of the city stay in view. Up close the dev-ship shows its time slider, the tabs under the screen switch view by hand, and the rotation pauses while the pointer is on the screen. Click the city, press "Torna in città" or Esc to zoom back out.
- Double-click the **Dev-ship** label under the billboard screen to open the dev-ship alone, full screen, without the rest of the interface (handy on a wall screen). Esc or another double-click closes it.
- Under the billboard there is the **square** (`#/piazza`). Inside it is seen from above like the rooms of Club Penguin: click where you want to go and your character walks there. A few demo characters stroll around and chat. The **shop** stall on the left opens a catalog where you can try colours and hats on a preview; logged-in players buy them with gold coins and wear them right away.
- Around the billboard there are the **mine**, the **dungeon**, the **office**, the **museum** and the **fishing spot**. Click one to fly to its door and go inside (`#/miniera`, `#/dungeon`, `#/ufficio`, `#/museo`, `#/pesca`). The interiors are drafts for now; the `−` button folds their info panel.
- The **fishing spot** (`#/pesca`) is the first game. Seen from high above, it has a lake with 10 chairs around it and a big meadow where players walk and chat like in the plaza. Logged-in players click a free chair to walk there and sit down, one player per chair (whoever gets there first). A fish bites after 10 to 20 minutes, and 3 times out of 4 it stays on the hook. Its weight is 1–4.9 kg, or 5–20 kg one time in ten, and every kilo is worth 10 points. A billboard in the top left cycles between the leaderboard of today, this week (from Monday) and all time, and the latest catches. Fish of 5 kg or more get a full-screen celebration that everyone at the lake sees. Standing up, walking away or leaving frees the chair. Without login, or in demo mode, you stroll on your own while the leaderboard crew fishes.
- Logged-in players have an **inventory**. Their character, name and gold coins are in the top right corner: click it, or press **I**, to open it. It holds the fish you caught, each with its weight, and the hats and colours you bought, and it shows what you are wearing (one hat and one colour). Sell fish for 1 gold per kilo, rounded per fish; special fish (5 kg or more) are worth 3 times as much (they stay on the leaderboard), spend the gold at the plaza shop, and wear what you own: everyone sees your look in the plaza and at the lake. Fish caught before the inventory existed are in it too.

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
- **multiplayer in the dungeon**: logged-in players see each other move (WASD or arrow keys), each with their own name. Without login, or without the game server, the dungeon works as before, with a notice at the top; it joins by itself as soon as the server is back;
- **fishing**: the game server (`FishingRoom`) moves the players around the lake, runs the chairs, the bite timer and the chat, and it saves every catch in PostgreSQL (`fish_catch`). The API serves the leaderboard at `GET /api/fishing/leaderboard`, with the top 10 of today, this week and all time (Italian time) and the latest 10 catches;
- **inventory and gold**: every catch also goes into the player's inventory (`player_item`). Gold is a ledger (`gold_ledger`): every sale and purchase is a row and the balance is their sum, so it never goes below zero. What each player wears is in `player_equipment`, which the plaza and fishing rooms read to show everyone's look. The API serves `GET /api/inventory` and `POST /api/inventory/sell`, `/api/inventory/equip` and `/api/shop/buy`, logged in only. Item ids, names and prices live in one catalog shared by the API and the frontend (`packages/shared/src/catalog.ts`);
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

To try fishing without waiting 10–20 minutes for a bite, start the game server with `FISHING_FAST=1`: bites then come after 10–20 seconds.

To log in during development, type a name next to "Accedi con GitHub" and press **Entra (dev)**: no GitHub needed. The same name is always the same player (with the same inventory, as `<name>@dev.local`). The dev login exists only in development: the API adds it only when `NODE_ENV` is not `production`, and the button is only in dev builds of the frontend. To try the multiplayer, log in with two different names in two browsers (or a normal and a private window), then open `#/dungeon` or `#/piazza` in both.

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
