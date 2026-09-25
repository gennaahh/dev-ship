# Devs Ship

A small Vue 3 single page application that shows the working week as a ship's voyage.

**Live demo:** https://dev-ship.netlify.app

## How it works

- The ship leaves the **port** (left) on **Monday at 09:00**.
- It sails steadily to reach the **buoy** (right) on **Wednesday at 13:30**, the halfway point of the week.
- It turns around at the buoy and gets back to port on **Friday at 18:00**.
- Outside working hours it stays moored in port. The view zooms in on the ship for a close-up of the port at work: a crane loads containers into the hold and a worker repairs the hull.
- Every day from 13:00 to 14:00 there is a lunch break on board, with the same zoom in/zoom out. Lunch wins when the ship is also in port.

The position follows your local time. Use the slider at the top to simulate any moment of the week, and press "Torna all'ora attuale" to go back to live time. You can also open a given moment directly with `?at=2026-09-23T13:30`.

The app is frontend only, with no backend.

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev      # dev server with hot reload
bun run build    # builds a single self-contained dist/index.html
```

The build puts all JS and CSS inside `dist/index.html`, so the file also works when opened directly from disk.
