# Spec 7 — Page: Chart (`/chart`)

## Goal

Serve `/chart` from React with parity to `chart.html` + `chart-page.js`, reusing
the chart components built for Home. This proves the shell + chart components
are genuinely reusable.

## Depends on

Spec 6 (chart components, `lib/chartConfig.ts`, exporters).

## Files touched

New:
- `frontend/src/pages/ChartPage.tsx`

Modified:
- `frontend/src/App.tsx` — add route `/chart`
- `frontend/src/lib/navItems.ts` — mark `/chart` migrated
- `app/routes.py` — `/chart` returns the SPA index

## Differences from Home (all that changes)

- Uses `.chart-flexbox-container` / `.chart-box-chart-page` layout (chart +
  option column) instead of the dashboard layout.
- **No** stat boxes, averages, min/max, or advice sections.
- Same option set: `#dropbtn` + `#devices-dropdown`, `#resetZoom`,
  `#pauseFetching`, `#showAllData`, `#exportChartAsPDF`, `#exportChartAsPNG`.

## Design notes

- Compose from the Spec 6 components: `<ChartBox>`, `<ChartOptions>`,
  `<DeviceDropdown>`, `lib/chartConfig.ts`, `exporters.ts`. Only the page layout
  and the presence/absence of dashboard boxes differ.
- Preserve `chart-page.js` behavior, including its small divergence from
  `script.js` on the resume branch (it re-creates the interval unconditionally).
  Keep the per-page behavior identical rather than unifying the two pages.

## Out of scope

- De-duplicating any residual differences between Home and Chart beyond shared
  components (do not "improve" behavior).

## Definition of Done

- `/chart` is served by React.
- Chart + all option buttons behave exactly as the old page.
- No duplicated chart configuration exists between Home and Chart (all shared
  via `lib/chartConfig.ts` and the chart components).

## Verification

Side-by-side (`:5000` vs `:5173`): compare rendering and exercise zoom / reset /
pause / show-all / exports / device switch. Confirm the component reuse by
checking that Home and Chart import the same chart modules.

## Risks / notes

- Watch for accidental shared mutable state between the two pages if the chart
  config holds module-level `gradient`/`width`/`height` variables (as the old
  `chart.js` did). Keep any such state inside the component/instance, not at
  module scope, so navigating between pages cannot leak it.
