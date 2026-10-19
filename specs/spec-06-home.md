# Spec 6 — Page: Home (`/`)

## Goal

Serve the dashboard `/` from React with parity to `index.html` + `script.js` +
`modules/chart.js` + `modules/button-handlers.js`. This is the centerpiece and
the most complex page.

## Depends on

Spec 5 (shared dashboard boxes + `airQuality` logic already exist).
Spec 1 (`jspdf` added to `frontend/package.json` here).

## Files touched

New:
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/chart/ChartBox.tsx` (react-chartjs-2 `<Line>`)
- `frontend/src/components/chart/ChartOptions.tsx` (dropdown, reset zoom, pause, show-all, exports)
- `frontend/src/components/chart/DeviceDropdown.tsx`
- `frontend/src/components/chart/exporters.ts` (PDF via `jspdf`, PNG via canvas)
- `frontend/src/lib/chartConfig.ts` (shared with Spec 7)

Modified:
- `frontend/src/App.tsx` — add route `/`
- `frontend/src/lib/navItems.ts` — mark `/` migrated
- `frontend/src/components/dashboard/StatBoxes.tsx` — reuse for the top row
- `app/routes.py` — `/` returns the SPA index
- `frontend/package.json` — add `chart.js`, `react-chartjs-2`, `chartjs-plugin-zoom`, `jspdf`

## Markup to reproduce (from `index.html`)

- Top stat boxes: Temperature/Humidity/VOC/Rating (same as Compact).
- Chart: `<canvas id="myChart">` inside `.chart-box`.
- Option boxes: `#dropbtn` + `.dropdown-content#devices-dropdown`, `#resetZoom`,
  `#pauseFetching`, `#showAllData` checkbox, `#exportChartAsPDF`, `#exportChartAsPNG`.
- Averages / Min & Max / Info sections (reuse Spec 5 components).

## Chart configuration (copy verbatim from `modules/chart.js`)

- Line chart; y `beginAtZero`, `max: 500`, title `VOC, °C, %`.
- x `beginAtZero`, title `Time`, ticks callback `index % 4 === 0`.
- Zoom plugin: `wheel` + `pinch`, `mode: 'x'`, `limits: { x: { min: 0, max: 100 } }`.
- Legend `onClick` → toggle dataset visibility, then set y max from
  `[500, 50, 100]` across visible datasets, fallback `10`.
- VOC dataset `borderColor` uses the gradient from `getGradient(ctx, chartArea)`;
  Temperature `#ffa600`, Humidity `#ff0000`, `borderWidth: 5`, `pointStyle: false`.

## Behaviour to reproduce

- **Polling:** `GET /data` every `fetch_sensor` ms → push to arrays, update
  chart, update stat boxes, recompute rating/advice.
- **Reset zoom:** chart ref → `resetZoom()`.
- **Pause/Resume:** manage the polling interval via a ref; toggle faithfully to
  the old `dataStorage.paused` logic.
- **Show All Data:** checked → `GET /all-data`, render full series, pause polling;
  unchecked → clear arrays, update chart, resume polling.
- **Device dropdown:** on open, `getDevices()`; click → clear datasets, set
  `#dropbtn` text, POST `/select_device` (JSON).
- **Selected device label:** on mount, `getCurrentDevice()` → `#dropbtn` text.
- **Exports:** PDF via `jspdf` (landscape, same layout constants as
  `button-handlers.js`); PNG via `canvas.toDataURL` + download.
- Keep native `alert()` where the old code used it (D13).

## Out of scope

- The Jinja `index.html` removal (Spec 8).
- Any change to chart *look* (gradient, colors, axis limits must stay identical).

## Definition of Done

- `/` is served by React.
- Chart renders identically (colors, gradient, axes, legend behavior).
- Zoom, reset, pause/resume, show-all, exports, and device switch all work.
- Live values match the old dashboard for the same device.

## Verification

Side-by-side (`:5000` old vs `:5173` new, both left open before flipping `/`):
compare rendering, then exercise every option button; switch devices and confirm
both pages follow the server-global selection; export PDF/PNG and compare.

## Risks / notes

- `chart.js` + `chartjs-plugin-zoom` must be registered once; the gradient needs
  a non-null `chartArea` (Chart.js calls `borderColor` again on resize).
- `script.js` has quirks (dataset order, pause guard branches); preserve
  observable behavior rather than "tidying" it.
- `jspdf` is UMD on the old CDN (`window.jsPDF`); the npm import is ESM — adapt
  the export helpers accordingly.
- The old page shared module singletons (`myChart`, `dataStorage`); React uses
  refs/state but the rendered result must match.
