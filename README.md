# Bubble App — SEATAC Airport Analytics Portal

A white-label, **static** embedded-analytics portal (React + Vite) for the
SEATAC Airport demo brand. It lands on a branded login and, once you sign in,
shows the dashboard output (Overview, AI Chat, Search, Flights, Hub) powered by
embedded Omni Analytics.

**Live site:** https://fishtankau.github.io/bubble-app/

## How it works

This is a pure static build — there is no backend. The pieces that used to run
on a server are handled in the browser:

- **Embed SSO signing** — `src/utils/omniEmbed.js` signs Omni embed URLs
  client-side with the Web Crypto API (HMAC-SHA256 → base64url). The algorithm
  was verified byte-for-byte against Omni's `generate-url` API.
- **`/api/*` calls** — `src/utils/apiShim.js` intercepts `window.fetch` and
  fulfils `/api/omni-embed-url` (local signing) and `/api/omni-query-distinct`
  (pre-baked filter values in `src/utils/distinctValues.js`) in the browser.
- **Brand config** — the SEATAC defaults live in `src/context/BrandContext.jsx`.
- **Schedule delivery (Flights tab)** — the "Schedule delivery" button opens a
  modal with schedule + format options. On this static build the submit is
  simulated (no backend). `api/omni-create-schedule.js` is included as a
  **reference** for the real server-side call (Omni Schedules API) — it runs only
  if bubble-app is hosted on a platform with serverless functions (e.g. Vercel),
  not on GitHub Pages.

> **Security note:** because there is no server, the Omni embed secret and API
> key are bundled into the client. This is acceptable here only because they are
> throwaway trial/demo credentials. Do not use this pattern with production
> secrets — generate embed URLs server-side instead.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & deploy (GitHub Pages)

```bash
npm run build    # outputs to dist/ (base path /bubble-app/)
```

The site is served from the `gh-pages` branch. `vite.config.js` sets
`base: '/bubble-app/'` and the app uses `HashRouter`, so deep links and refreshes
work without server rewrites.
