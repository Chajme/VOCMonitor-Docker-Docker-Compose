# Spec 8 — Cutover, Cleanup, Docker, Docs

## Goal

Complete the migration: every page is served by React, the old Jinja templates
and vanilla JS modules are removed, the React build is wired into the Docker
image, and the docs describe the new setup.

## Depends on

Specs 0–7, all verified.

## Files touched

Modified:
- `app/routes.py` — remove `render_template` usage / now-unused imports; the page
  routes all return the SPA index via the shared helper
- `Dockerfile` — multi-stage build
- `.dockerignore` (new or updated)
- root `.gitignore` — ensure `frontend/node_modules/`, `frontend/dist/`,
  `app/static/react/` are ignored
- `README.md` — new project structure, dev workflow, build/deploy steps
- `nginx/nginx.conf` — only if an SPA deep-link fallback is needed (verify first)

Deleted (only after the full click-through passes):
- `app/templates/index.html`, `chart.html`, `compact.html`, `devices.html`, `settings.html`
- `app/static/js/**` (`script.js`, `chart-page.js`, `compact.js`, `devices-page.js`,
  `settings.js`, and `modules/**`)
- `app/static/css/style.css` is **kept** (React uses it). `images/`, `favicon.ico` kept.

Untouched:
- `learning/`, `LEARNING_GUIDE.md`, `mosquitto/`, `database/`, `mqtt_manager.py`,
  `app/config.py`, `app/notification_manager.py`.

## Dockerfile (multi-stage)

```dockerfile
# Stage 1: build the React app
FROM node:20-alpine AS react
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build          # emits to /out (set build.outDir=/out for the image)

# Stage 2: python app, with the built SPA copied in
FROM python:3.13.3-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=react /out ./app/static/react
ENV PYTHONBUFFERED=1
CMD ["python", "-u", "main.py"]
```

> In Stage 1, build to `/out` (override `outDir` via a build-time env or a
> dedicated config) rather than the repo-relative `../app/static/react`, so the
> image does not depend on the local build.

## Design notes

- All five page routes (`/`, `/compact`, `/chart`, `/devices`, `/settings`) serve
  the SPA index; react-router handles client-side navigation between them, so
  boundary `<a>` links from earlier specs become `<Link>`s (update `navItems.ts`).
- Confirm Flask's static handler serves `/static/react/assets/*` (it does) and
  that no route still references deleted files.
- `nginx/nginx.conf` currently proxies everything to `app:8000`. Because Flask
  serves the SPA index for each known route, no fallback is required *unless* a
  deep link to an unknown subpath must work; verify and only then add
  `try_files`-style behavior through the proxy.

## Out of scope

- Any feature changes. This spec only removes the old frontend and packages the
  new one.

## Definition of Done

- `docker compose up --build` serves the entire React app on `:5000`; all five
  pages work with client-side routing.
- No references to deleted Jinja/JS files remain (`grep` for `/static/js`,
  `render_template`).
- `README.md` documents the new structure and how to develop/build.

## Verification

Full manual click-through **inside Docker**:
1. All five pages load and navigate without full reloads.
2. Devices: add / delete / clear.
3. Settings: load / apply / reset / cancel (verify the checkbox-omission quirk
   in the request body).
4. Live values update; chart zoom / reset / pause / show-all / exports work.
5. Notifications: panel opens, items load/delete, clear-all; a live VOC alert
   fires a browser notification.
6. Responsive: menu toggle below 1024px.
7. `grep -r "/static/js" .` and `grep -r "render_template" app/` → no hits.

## Risks / notes

- Delete the Jinja/JS files only **after** the in-Docker click-through passes;
  until then they are the fallback.
- Keep the build reproducible: `npm ci` with a committed `package-lock.json`.
