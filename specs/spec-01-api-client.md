# Spec 1 — Typed API Client & Vitest Scaffold

## Goal

A single typed module that wraps every JSON/form endpoint, plus a working
Vitest setup. **No UI.**

## Depends on

Spec 0 (project skeleton).

## Files touched

New:
- `frontend/src/api/types.ts`
- `frontend/src/api/client.ts` (transport: `apiGet`, `apiPostJson`, `apiPostForm`)
- `frontend/src/api/endpoints.ts` (one function per endpoint)
- `frontend/src/api/__tests__/client.test.ts`
- `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`

## Types (`src/api/types.ts`)

```ts
export interface SensorReading { timestamp: string; temperature: number; humidity: number; voc_index: number; }
export interface AllData { timestamp: string[]; temperature: number[]; humidity: number[]; voc_index: number[]; }
export interface Averages { avg_24h: number | null; avg_72h: number | null; avg_7d: number | null; }
export interface MinMax { min_24h: number | null; max_24h: number | null; min_72h: number | null; max_72h: number | null; }
export interface Device { id: number; device_name: string; topic: string; }
export interface AppNotification { id: number; timestamp: string; message: string; voc: number; }
export interface CurrentDevice { selected_device: string; }
export interface ApiMessage { message: string; }
export interface Settings {
  advice1: string; advice2: string; advice3: string; advice4: string; advice5: string; advice6: string;
  fetch_sensor: number; fetch_averages: number; fetch_minmax: number;
  notifications: boolean; notification_threshold: number; cooldown: number; notification_message: string;
  email_notifications_on: boolean; email_notification_threshold: number; email_cooldown: number; email_address: string;
  esp_alarm_enabled: boolean; alarm_time: number;
  temp_notifications_enabled: boolean; temp_threshold: number; temp_cooldown: number;
  humi_notifications_enabled: boolean; humi_threshold: number; humi_cooldown: number;
}
```

> `Settings` mirrors `DatabaseManager.get_user_settings()` exactly (25 fields,
> booleans already cast server-side).

## Endpoint functions (`src/api/endpoints.ts`)

| Function | Call |
|----------|------|
| `getAllData()` | GET `/all-data` → `AllData` |
| `getLatestReading()` | GET `/data` → `SensorReading` **or 404** (`/data` also triggers notifications server-side) |
| `getAverages()` | GET `/avg` → `Averages` |
| `getMinMax()` | GET `/minmax` → `MinMax` **or 404** |
| `getSettings()` | GET `/get_settings` → `Settings` |
| `updateSettings(form)` | POST `/update_settings` **form-encoded** → `ApiMessage` |
| `resetSettings()` | POST `/default_settings` JSON `{}` → `ApiMessage` |
| `getNotificationHistory()` | GET `/notification_history` → `AppNotification[]` |
| `clearNotifications()` | POST `/notification_clear` → `ApiMessage` |
| `deleteNotification(id)` | POST `/delete_notification` JSON `{id}` → `ApiMessage` |
| `getDevices()` | GET `/devices_list` → `Device[]` |
| `newDevice(name, topic)` | POST `/new_device` **form-encoded** → `ApiMessage` (200 / 409) |
| `clearDevices()` | POST `/devices_clear` → `ApiMessage` |
| `deleteDevice(id, name, topic)` | POST `/delete_device` JSON `{id, device_name, topic}` → `ApiMessage` |
| `selectDevice(id, name, topic)` | POST `/select_device` JSON `{id, topic, device_name}` → `ApiMessage` |
| `getCurrentDevice()` | GET `/current_device` → `CurrentDevice` |

## Design notes

- `apiGet<T>` / `apiPostJson<T>` / `apiPostForm<T>` return `{ status, ok, data }`
  so callers can distinguish **200 vs 404** without exceptions for expected
  "no data yet" cases (`/data`, `/minmax`).
- Network/parse failures throw; expected HTTP statuses are returned, not thrown.
- Same-origin fetch; no CORS config needed (dev goes through the Vite proxy).

## Out of scope

- Caching, retries, polling. Hooks that poll arrive in Specs 5–7.
- Any UI.

## Definition of Done

- `npm test` green; `tsc --noEmit` clean.
- Every endpoint above has exactly one typed function.

## Verification

1. `npm test` → unit tests pass.
2. `npm run dev`; from a scratch component or the console, call
   `getCurrentDevice()` and `getDevices()` → real data via the proxy.

## Risks / notes

- `/data` and `/minmax` legitimately 404 — never let those reject as errors.
- `Settings` booleans come back as real booleans; `/update_settings` expects
  strings (see Spec 4).
