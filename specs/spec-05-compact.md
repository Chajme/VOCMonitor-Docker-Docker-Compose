# Spec 5 — Page: Compact (`/compact`)

## Goal

Serve `/compact` from React with parity to `compact.html` + `compact.js`.
This is the first page that exercises **live polling and the rating/advice
logic** (the pure logic that gets Vitest coverage).

## Depends on

Spec 4.

## Files touched

New:
- `frontend/src/pages/CompactPage.tsx`
- `frontend/src/components/dashboard/StatBoxes.tsx` (temperature, humidity, VOC, rating)
- `frontend/src/components/dashboard/AveragesBox.tsx`
- `frontend/src/components/dashboard/MinMaxBox.tsx`
- `frontend/src/components/dashboard/AdviceBox.tsx`
- `frontend/src/hooks/useLatestReading.ts`, `frontend/src/hooks/useAverages.ts`, `frontend/src/hooks/useMinMax.ts`
- `frontend/src/lib/airQuality.ts` (pure: `getRating`, `getAdvice`)
- `frontend/src/lib/__tests__/airQuality.test.ts`

Modified:
- `frontend/src/App.tsx` — add route `/compact`
- `frontend/src/lib/navItems.ts` — mark `/compact` migrated
- `app/routes.py` — `/compact` returns the SPA index

## Markup to reproduce (from `compact.html`)

- Stat boxes: `Temperature` (`#temperature`, value `°C`), `Humidity` (`#humidity`, `%`),
  `VOC Index` (`#voc-index`), `Rating` (`#recommendation`), with the original
  inline background colors (`#CAF0F8`, `#90E0EF`, `#00B4D8`).
- `Averages`: `#avg-24h`, `#avg-72h`, `#avg-7d`.
- `Min & Max Values`: `#min-24h`, `#max-24h`, `#min-72h`, `#max-72h`.
- `Info`: `#advice`.

## Polling (mirror `compact.js`)

- `GET /data` every `fetch_sensor` ms → update stat boxes + rating + advice.
- `GET /avg` every `fetch_averages` ms → update averages.
- `GET /minmax` every `fetch_minmax` ms → update min/max.
- Intervals are read from `getSettings()` on mount; clear all on unmount.
- `/data` may legitimately 404 (no data yet) → no crash, no UI update (parity
  with the old `catch { console.error }`).
- No chart on this page (the old `fetchSensorData` guarded on `#myChart`).

## Pure logic (`lib/airQuality.ts`) — exactly these thresholds

| VOC range | Rating | Advice field |
|-----------|--------|--------------|
| ≤ 50 | Excellent | `advice1` |
| 51–100 | Good | `advice2` |
| 101–200 | Moderate | `advice3` |
| 201–300 | Poor | `advice4` |
| 301–450 | Bad | `advice5` |
| > 450 | Hazardous | `advice6` |

## Out of scope

- The chart (Home/Chart).
- Device selection (server-global; not exposed on this page).

## Definition of Done

- `/compact` is served by React.
- Values match the old page for the same selected device.
- Polling cadence matches the configured intervals; no leaks on unmount.
- Rating and advice are correct across all boundaries.

## Verification

Side-by-side (`:5000` vs `:5173`): values match; change a fetch interval in
Settings → cadence changes; temporarily point at a device with no data → page
stays stable.
Vitest: `airQuality.test.ts` covers 50/51, 100/101, 200/201, 300/301, 450/451
plus an upper bound (>450 → Hazardous / advice6).

## Risks / notes

- `GET /data` has a **server-side notification side effect** — polling it from
  this page behaves exactly as the old page did. That is intended (D-quirks).
- Device selection is server-global; this page has no selector, matching the old
  behavior.
