# Dev City

A small Vue 3 single page application: a cartoon city for the dev team.

## The city

The home page is a city. In the middle of the square stands a big billboard whose screen switches every 5 seconds between the **dev-ship** (the working week as a ship's voyage, see below), the weekly **leaderboard** (for now with made-up data, just a demo) and the **changelog** of the latest changes (scrollable when zoomed in, it starts back from the top every time it shows up).

- Click the billboard to zoom in on it: the frame and a bit of the city stay in view. Up close the dev-ship shows its time slider, the tabs under the screen switch view by hand, and the rotation pauses while the pointer is on the screen. Click the city, press "Torna in città" or Esc to zoom back out.
- Around the billboard there are the **mine**, the **dungeon**, the **office**, the **museum** and the **fishing spot**. Click one to fly to its door and go inside (`#/miniera`, `#/dungeon`, `#/ufficio`, `#/museo`, `#/pesca`). The interiors are drafts for now.

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

- **login with an email code**: press "Accedi" in the bottom left corner, type your email and then the 6-digit code you receive. No passwords;
- **multiplayer in the dungeon**: logged-in players see each other move (WASD or arrow keys), each with their own name. Without login, or without the game server, the dungeon works as before, with a notice at the top; it joins by itself as soon as the server is back;
- a **status badge** in the bottom left corner, with one light for the API and one for the game server (green: online, red: offline).

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
bun run infra:up    # PostgreSQL 18, Redis 8 and Mailpit; waits until they are ready
bun run db:migrate  # applies the migrations in apps/api/drizzle
```

Then start frontend, API and game server together:

```bash
bun run dev:all
```

Login codes are not really sent: they end up in **Mailpit**, at http://localhost:8025. To try the multiplayer, log in with two different emails in two browsers (or a normal and a private window), then open `#/dungeon` in both.

`bun run infra:down` stops the services; the data stays in Docker volumes (`docker compose down -v` wipes it). The services listen on `127.0.0.1` only.

### Other PCs on the local network

```bash
MAILPIT_BIND=0.0.0.0 bun run infra:up  # lets the other PCs read their codes in Mailpit
bun run dev:lan
```

Vite prints the `Network` address to open on the other PCs (for example `http://192.168.1.10:5173`); Mailpit is on the same address, port 8025. The page looks for the API and the game server on the same host it was opened from, so nothing else needs to be configured. If the other PCs can't connect, check that the firewall lets through ports 5173, 3000, 2567 and 8025 (with ufw: `sudo ufw allow 5173,3000,2567,8025/tcp`).

### Running the pieces one at a time

```bash
bun run dev       # frontend
bun run dev:api   # API (Hono + Better Auth on Bun, apps/api) on http://localhost:3000, healthcheck at /health
bun run dev:game  # game server (Colyseus on Bun, apps/game) on ws://localhost:2567, healthcheck at /__healthcheck
```

### Configuration

API and game server read `.env` in the repository root, if there is one: copy `.env.example`, which lists every variable. In development they all have defaults; in production the API stops at startup if `DATABASE_URL`, `BETTER_AUTH_SECRET` or `SMTP_URL` are missing. The frontend looks for both servers on the host the page was opened from; set `VITE_API_URL` and `VITE_GAME_URL` at build time to point it elsewhere.

The database schema lives in `apps/api/src/db`. The tables for players and sessions are generated by Better Auth (`bun run --filter @dev-city/api auth:schema`); after changing the schema, `bun run --filter @dev-city/api db:generate` writes a new migration.

The game server keeps rooms in memory unless `REDIS_URL` is set: then several processes share matchmaking and presence through Redis, and each one needs `PUBLIC_ADDRESS` (the `host:port` clients use to reach it), for example:

```bash
cd apps/game
REDIS_URL=redis://localhost:6379 PORT=2567 PUBLIC_ADDRESS=localhost:2567 bun src/index.ts
REDIS_URL=redis://localhost:6379 PORT=2568 PUBLIC_ADDRESS=localhost:2568 bun src/index.ts
```
