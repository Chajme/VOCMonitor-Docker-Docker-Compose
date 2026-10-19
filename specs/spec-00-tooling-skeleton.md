# Spec 0 — Tooling & Serving Skeleton

## Goal

Stand up a Vite + React + TypeScript app in `frontend/`, prove it builds to
`app/static/react/`, and prove Flask can serve that build at a test route —
**without changing any existing page or endpoint**.

## Depends on

Nothing. This is the first step.

## Files touched

New:
- `frontend/package.json`
- `frontend/tsconfig.json` (`"strict": true`)
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/vite-env.d.ts`
- `frontend/vitest.config.ts` + `frontend/src/test/setup.ts` (scaffold only; used in Spec 1)

Modified:
- `app/routes.py` — add **one** view returning the built SPA index for a test route
- root `.gitignore` — ignore `frontend/node_modules/`, `frontend/dist/`, `app/static/react/`

## Design notes

- **Vite config**
  - `base: "/static/react/"` so hashed assets resolve to
    `/static/react/assets/...` and never collide with existing `/static/js` or
    `/static/css`.
  - `build.outDir: "../app/static/react"`, `build.emptyOutDir: true`
    (this only empties `app/static/react`, never `app/static`).
  - `server.proxy` → `http://localhost:5000` for:
    `/all-data`, `/data`, `/avg`, `/minmax`, `/get_settings`, `/update_settings`,
    `/default_settings`, `/notification_history`, `/notification_clear`,
    `/delete_notification`, `/devices_list`, `/new_device`, `/devices_clear`,
    `/delete_device`, `/select_device`, `/current_device`, `/static`,
    `/socket.io` (with `ws: true`).
- **`frontend/index.html`** loads the *existing* assets so the look is preserved
  and there is one source of truth (D7):
  - `<link rel="stylesheet" href="/static/css/style.css">`
  - Google Fonts **Inter** + **Material Icons**
  - `<link rel="shortcut icon" href="/static/favicon.ico">`
  - In dev these resolve through the `/static` proxy; in prod Flask serves them.
- **Flask (D12 — minimal)**
  - Add a helper view, e.g. `react_index()` using
    `send_from_directory(app.static_folder, "react/index.html")`.
  - Register it for a single **test route only** (e.g. `/react-dev-check`) in this
    spec. Do **not** touch `/`, `/compact`, `/chart`, `/devices`, `/settings`, or
    any API endpoint.
  - No asset route is needed: Flask's built-in `/static/<path>` already serves
    `app/static/react/assets/...`.

## Out of scope

- Any real page. No routing, no shell, no API client (Specs 1–7).
- Docker changes (Spec 8).

## Definition of Done

- `npm run build` emits `app/static/react/index.html` + `assets/…`, zero TS errors.
- The test route renders the React app when served by Flask (prod build).
- The React app also renders via `npm run dev` with working API proxy.
- All existing Jinja pages render exactly as before, unchanged.

## Verification

1. `cd frontend && npm install && npm run build` → success; inspect output folder.
2. `npm run dev`; open `http://localhost:5173/react-dev-check` → React renders;
   in devtools console call `fetch('/current_device')` → proxied JSON from Flask.
3. Run the backend (`docker compose up mosquitto app` or `python main.py`);
   open `http://localhost:5000/react-dev-check` → React renders (from the build).
4. Regression: open `/`, `/compact`, `/chart`, `/devices`, `/settings` → still
   Jinja, unchanged.

## Risks / notes

- `emptyOutDir: true` must target `app/static/react` only — never `app/static`.
- Keep `/static` in the proxy list or `style.css`/fonts/icons will 404 in dev.
