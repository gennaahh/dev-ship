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

The backend is being prototyped (see `docs/adr/0001-stack-backend.md`). For now there is only an API with a healthcheck: the badge in the bottom left corner shows whether the app can reach it (green: online, red: offline).

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev      # dev server with hot reload
bun run build    # builds a single self-contained dist/index.html
```

To run the API too (Hono on Bun, in `apps/api`), in a second terminal:

```bash
bun run dev:api  # API on http://localhost:3000, healthcheck at /health
```

The frontend calls `http://localhost:3000` by default; set `VITE_API_URL` to point it elsewhere. The API reads `PORT` and `CORS_ORIGIN`.

The build puts all JS and CSS inside `dist/index.html`, so the file also works when opened directly from disk.
