# Spec 4 — Page: Settings (`/settings`)

## Goal

Serve `/settings` from React with full parity to `settings.html` +
`settings-handler.js`.

## Depends on

Spec 3 (shell + first takeover patterns in place).

## Files touched

New:
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/components/settings/AdviceForm.tsx`
- `frontend/src/components/settings/FetchingForm.tsx`
- `frontend/src/components/settings/NotificationsForm.tsx`
- `frontend/src/components/settings/SettingsActions.tsx`
- `frontend/src/hooks/useSettings.ts`

Modified:
- `frontend/src/App.tsx` — add route `/settings`
- `frontend/src/lib/navItems.ts` — mark `/settings` migrated
- `app/routes.py` — `/settings` returns the SPA index

## Markup to reproduce (from `settings.html`)

- Advice: `#advice-1..6` (`name=advice_1..6`), labels `0-50 … 451-500`.
- Fetching: `#fetch-sensor`, `#fetch-averages`, `#fetch-minmax`
  (`name=fetch_sensor|fetch_averages|fetch_minmax`, `type=number`, `step=250`).
- Notifications (`#notifications-form`) — VOC / Temperature / Humidity subsections:
  - `notifications_enabled` (`#notifications-enabled`, checkbox), `notification_threshold`
    (0–500), `notification_cooldown`, `notification_message`
  - `email_notifications_enabled` (`#email-notifications-enabled`), `email_notification_threshold`
    (0–500, step 60 cooldown), `email_address` (`type=email`)
  - `esp_alarm_enabled` (`#esp-alarm-enabled`), `alarm_time`
  - `temp_notifications_enabled`, `temp_threshold`, `temp_cooldown` (step 30)
  - `humi_notifications_enabled`, `humi_threshold` (0–100), `humi_cooldown` (step 30)
- Actions: `#cancelChanges`, `#resetDefault`, `#submitForms` (Apply Changes).

## Design notes

- **Load:** `getSettings()` → seed controlled inputs (map `advice1..6`,
  `fetch_sensor/averages/minmax`, and all notification fields; booleans → `checked`).
- **Apply:** merge the three sections into one `URLSearchParams` and POST
  **form-encoded** to `/update_settings`; `alert(message)` on completion.
  Preserve the old transform exactly:
  - `notifications_enabled` / `email_notifications_enabled` sent as `"true"` when
    on (backend compares `== "true"`).
  - `esp_alarm_enabled`, `temp_notifications_enabled`, `humi_notifications_enabled`
    are **omitted entirely when off** (the old `FormData` never appended
    unchecked boxes; the backend then stores `None`). Reproduce this omission
    faithfully — do **not** send `false`.
- **Cancel:** refetch settings (`getSettings()`) and re-seed inputs.
- **Reset Default:** POST `/default_settings` JSON `{}` → `alert(message)` → refetch.
- Keep native `alert()` (D13). Keep all `min`/`max`/`step` attributes.

## Out of scope

- Any backend change to `/update_settings` semantics.
- Live validation beyond the existing HTML attributes.

## Definition of Done

- `/settings` is served by React.
- Loaded values match `/get_settings`.
- Apply persists (verified by reload); Reset restores defaults; Cancel reverts
  unsaved edits.
- Checkbox omission quirk reproduced (unchecked → field absent).

## Verification

Side-by-side (`:5000` vs `:5173`):
1. Open both → all fields populated identically.
2. Change advice + an interval → Apply → success alert → reload → persisted.
3. Toggle `esp_alarm_enabled` off → Apply → reload → stays off.
4. Reset Default → defaults restored.
5. Cancel after editing without applying → values revert.

## Risks / notes

- The checkbox-omission behavior is subtle; it is the single most likely place
  to silently break parity. Verify with devtools → Network → request body.
- `update_settings` returns `{message}` for success and 500 on error; alert text
  must match.
