# VOCMonitor → React Migration — Spec Index

A step-by-step, incremental migration of the VOCMonitor frontend from 5 Jinja
templates + vanilla JS modules to a Vite + React + TypeScript SPA, while the
Flask app keeps running and the original look is preserved exactly.

Each spec below is **small, self-contained, and independently verifiable**. The
app is never in a broken state: un-migrated pages keep using the old frontend
until their turn.

---

## Decision record (locked)

| # | Decision |
|---|----------|
| D1 | Goal: learn React **and** keep the app correct — **original look preserved** (visual parity is a hard requirement) |
| D2 | Incremental, page-by-page, old and new frontends **coexist** |
| D3 | Tooling: **Vite + npm + TypeScript** |
| D4 | **Flask serves the built static files** (one app container; docker-compose largely unchanged) |
| D5 | **Per-route takeover** — React serves each route as it migrates; un-migrated routes stay Jinja; boundary links are plain `<a>` (full reload) |
| D6 | Order: **Devices → Settings → Compact → Home → Chart** |
| D7 | Reuse `app/static/css/style.css` **verbatim**; no CSS framework; class names copied from the current templates |
| D8 | Verify **side by side** against the old page + **Vitest** for pure logic |
| D9 | Build the **shared shell first** (sidebar + notification panel) |
| D10 | **Custom hooks + React Context + `setInterval`** polling (mirror current behavior) |
| D11 | React source in **`frontend/`**; build output → **`app/static/react/`** |
| D12 | **Minimal backend changes** — only add/point routes to serve the SPA; touch nothing else |
| D13 | Keep native **`alert()`** for parity (revisit after the migration) |
| D14 | Charts: **react-chartjs-2 + chart.js + chartjs-plugin-zoom** |
| D15 | **TypeScript strict mode**, types for every API response |

## Roadmap

| Spec | File | Page / area |
|------|------|-------------|
| 0 | [spec-00-tooling-skeleton.md](spec-00-tooling-skeleton.md) | Vite + React + TS app, Flask serving skeleton |
| 1 | [spec-01-api-client.md](spec-01-api-client.md) | Typed API client + Vitest scaffold |
| 2 | [spec-02-shared-shell.md](spec-02-shared-shell.md) | Layout, Sidebar, Notification panel, Socket.IO |
| 3 | [spec-03-devices.md](spec-03-devices.md) | `/devices` |
| 4 | [spec-04-settings.md](spec-04-settings.md) | `/settings` |
| 5 | [spec-05-compact.md](spec-05-compact.md) | `/compact` |
| 6 | [spec-06-home.md](spec-06-home.md) | `/` (dashboard + chart) |
| 7 | [spec-07-chart.md](spec-07-chart.md) | `/chart` |
| 8 | [spec-08-cutover.md](spec-08-cutover.md) | Remove old frontend, Docker build, docs |

## Target layout (after Spec 8)

```
frontend/                     # Vite + React + TS source (new)
  index.html                  # links /static/css/style.css, fonts, icons
  vite.config.ts              # base "/static/react/", build -> ../app/static/react
  src/
    main.tsx
    App.tsx                   # routes
    api/                      # typed client + types
    components/
      layout/                 # Layout, Sidebar, MenuToggle
      notifications/          # NotificationPanel + provider
      chart/                  # ChartBox, ChartOptions, DeviceDropdown, exporters
      dashboard/              # StatBoxes, AveragesBox, MinMaxBox, AdviceBox
      devices/                # DeviceForm, DeviceList, DeviceListItem
      settings/               # AdviceForm, FetchingForm, NotificationsForm
    hooks/                    # useSocket, useNotifications, useSettings, useDevices, polling hooks
    lib/                      # airQuality.ts, chartConfig.ts (pure, unit-tested)
    pages/                    # DevicesPage, SettingsPage, CompactPage, HomePage, ChartPage
    test/                     # Vitest setup
app/
  static/
    react/                    # vite build output (gitignored)
    css/style.css             # REUSED VERBATIM
    images/, favicon.ico      # REUSED
  templates/                  # deleted at Spec 8 (kept until then)
  routes.py                   # page routes return the SPA index as they migrate
```

## How to run and verify (side-by-side method)

Because the two frontends coexist, comparison is direct:

1. **Backend (old pages):** `docker compose up mosquitto app` (or `python main.py`).
   Old Jinja pages live at `http://localhost:5000/<page>`.
   > Note: `python main.py` expects `MQTT_HOST` reachable; `docker compose up`
   > is the reliable path.
2. **New frontend (dev):** `cd frontend && npm run dev`. Vite serves the SPA at
   `http://localhost:5173/<page>` and proxies API + `/socket.io` + `/static` to
   Flask on `5000`.
3. **Compare:** `http://localhost:5000/<page>` (old) vs
   `http://localhost:5173/<page>` (new). Same backend data, same `style.css`.
4. **Flip:** once a page is verified, point its Flask route at the built SPA
   index (D5). From then on, that route is React everywhere. Capture a
   screenshot of the old page *before* flipping if you want an ongoing reference.

## Conventions

- **Class names and markup IDs must match the current templates verbatim** so
  `style.css` styles them identically. When in doubt, copy from the template.
- **Strict TypeScript**; every API response has a named type in `src/api/types.ts`.
- **No CSS framework, no restyling.** `style.css` is the single source of truth
  for appearance.
- **Preserve backend quirks on purpose** (they are not bugs to fix here):
  - `GET /data` has a **notification side effect** and `int()`-casts values.
  - Device selection is **server-global** (`db.selected_device`), shared by all users.
  - `GET /data` and `GET /minmax` return **404** with `{message}` when there is no data.
  - `POST /new_device` and `POST /update_settings` expect **form-encoded** bodies;
    other POSTs expect **JSON**.
  - `POST /update_settings` only treats `notifications_enabled` and
    `email_notifications_enabled` as booleans (`== "true"`); the other `*_enabled`
    fields are stored raw and are simply **omitted when unchecked**.
  - Device-name inputs use `pattern="[A-Za-z]+"` while the backend validates
    `^[a-z_][a-z0-9_]*$` — keep both as-is.
- **One spec = one reviewable change.** Finish and verify before starting the next.

## Still open (defaults chosen)

1. **Docker build timing** — build locally during Specs 0–7; wire the React build
   into the image at Spec 8.
2. **`learning/`** — left untouched; separate learning track.
3. **Backend quirks** — preserved unless explicitly revisited.

## ⚠️ Security note (unrelated to the migration)

`.env` is tracked in git and contains a live Gmail address and app password
(`MAIL_PASSWORD`). Rotate that credential and untrack `.env`
(`.gitignore` + `.env.example`). Do this independently of the React work.
