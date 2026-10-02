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

- an API with a healthcheck;
- a status badge in the bottom left corner, with one light for the API and one for the game server (green: online, red: offline);
- a game server: inside the dungeon everyone who is there sees the others move (WASD or arrow keys). Without the game server the dungeon works as before, with a notice at the top, and joins by itself as soon as the server is back.

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev      # dev server with hot reload
bun run build    # builds a single self-contained dist/index.html
```

The backend needs PostgreSQL and Redis, which run in Docker (`docker-compose.yml`):

```bash
bun run infra:up    # starts PostgreSQL 18 and Redis 8 and waits until they are ready
bun run infra:down  # stops them; the data stays in Docker volumes
```

They listen on `127.0.0.1` only (ports 5432 and 6379). Connection strings are in `.env.example`: copy it to `.env`, which is not committed. To wipe the data, run `docker compose down -v`.

To run frontend, API and game server together:

```bash
bun run dev:all
```

To try it with other PCs on your local network, use instead:

```bash
bun run dev:lan
```

Vite prints the `Network` address to open on the other PCs (for example `http://192.168.1.10:5173`). The page looks for the API and the game server on the same host it was opened from, so nothing else needs to be configured. If the other PCs can't connect, check that the firewall lets through ports 5173, 3000 and 2567 (with ufw: `sudo ufw allow 5173,3000,2567/tcp`).

Or one at a time, each in its own terminal:

```bash
bun run dev       # frontend
bun run dev:api   # API (Hono on Bun, apps/api) on http://localhost:3000, healthcheck at /health
bun run dev:game  # game server (Colyseus on Bun, apps/game) on ws://localhost:2567, healthcheck at /__healthcheck
```

By default the frontend looks for both servers on the host the page was opened from; set `VITE_API_URL` and `VITE_GAME_URL` to point it elsewhere. Both servers read `PORT`, the API also `CORS_ORIGIN`. To try the multiplayer, open `#/dungeon` in two browser tabs.

The build puts all JS and CSS inside `dist/index.html`, so the file also works when opened directly from disk.
