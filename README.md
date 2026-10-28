# Pebble

A tiny habit tracker: add habits, check in each day, see your streak, your best run and how your week went. Plain HTML, CSS and ES modules, no dependencies, no build step. Data stays in the browser (localStorage).

## Run

Needs Node 22+.

```bash
npm start      # http://localhost:5190 (PORT=… to change)
npm test       # node:test unit tests for src/habits.js
```

## Layout

| File | |
|---|---|
| `index.html`, `styles.css` | The page |
| `src/habits.js` | Habit logic, pure functions, no DOM |
| `src/app.js` | Rendering, storage, Camelus widget and GA4 loading |
| `src/config.js` | Integration settings |
| `tests/` | Unit tests (`npm test`) |
| `server.js` | Static server for local use |

## Integrations

Everything is off until configured. Fill `CAMELUS_KEY`, `GA4_ID` and `MAILBOX` at the top of `src/config.js` before deploying. Production (camelus.si) is the default target; `?env=local` switches to the local docker stacks. Each value can also be set per visit with a query parameter:

| Param | What |
|---|---|
| `ckey` | Camelus widget publishable key (`pk_live_…`). Turns the widget on. |
| `capi` | Camelus API origin (default `https://api.camelus.si`, local `http://localhost:3231`) |
| `cscript` | Widget script URL (default `https://camelus.si/w/v1.js`, local `http://localhost:8097/w/v1.js`) |
| `headless=true` | Hide the floating button; use the page's own **Send feedback** / **Report a bug** buttons |
| `locale` | Force the widget language (`fr`, `de`, …) |
| `ga` | GA4 measurement ID (`G-…`), the data Alpaga reads. Sends `habit_add` and `habit_check` events. |
| `mail` | Inbox for the demo users: `you@gmail.com` makes Ana `you+ana@gmail.com` |

Example: `http://localhost:5190/?ckey=pk_live_abc&headless=true`

The **Signed in as** menu switches between demo users (Ana, Ben, Chloé). Each switch calls Camelus `identify` (unverified, no hash) and `meta` with the user's plan, and renders dates in that user's locale.

Stable `data-testid` attributes are on every interactive element for browser automation.

## Deploy

GitHub Pages, from `.github/workflows/pages.yml` on every push to `main` (Settings → Pages → Source: **GitHub Actions**). `ci.yml` runs `npm test` on pull requests.
