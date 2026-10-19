# Spec 3 — Page: Devices (`/devices`)

## Goal

Serve `/devices` from React with full feature parity to `devices.html` +
`devices-handler.js` + `devices-page.js`. **First real route takeover.**

## Depends on

Spec 2.

## Files touched

New:
- `frontend/src/pages/DevicesPage.tsx`
- `frontend/src/components/devices/DeviceForm.tsx`
- `frontend/src/components/devices/DeviceList.tsx`
- `frontend/src/components/devices/DeviceListItem.tsx`
- `frontend/src/hooks/useDevices.ts`

Modified:
- `frontend/src/App.tsx` — add route `/devices`
- `frontend/src/lib/navItems.ts` — mark `/devices` as migrated
- `app/routes.py` — `/devices` returns the SPA index instead of `render_template("devices.html")`

## Markup to reproduce (from `devices.html`)

- Add form `#devices-form`:
  - `input#device_name[name=device_name]` `pattern="[A-Za-z]+" required`
  - `input#topic[name=topic]` `pattern="[A-Za-z]+" required`
  - buttons `#cancelChanges` (Cancel) and `#addNewDevice` (Add new device)
- Devices card: `#clearAllDevices` (+ label) and `<ul class="devices-list-c" id="devices-list">`
- Each item (from `devices-handler.js`):
  `.device-index` (1-based count), `.device-info` > `.device-name` + `.device-topic`,
  and a `button.delete-device-btn` labelled `remove`.

## Design notes

- **Add:** read the form, POST form-encoded to `/new_device`
  (`device_name`, `topic`), `alert(data.message)`, then refetch. Keep the exact
  `pattern`/`required` attributes (quirk preserved).
- **Delete:** POST JSON `{id, device_name, topic}` to `/delete_device`; on
  non-success `alert("Failed to delete device.")`; on success refetch.
- **Clear all:** clear the visible list, POST `/devices_clear`, `alert(message)`.
- **Cancel:** reset the form (controlled state → clear fields).
- Keep native `alert()` (D13).
- Data via `useDevices()` → `getDevices()` (Spec 1).

## Out of scope

- Selecting a device from here (that lives on Home/Chart dropdowns).
- Changing device-name validation on the backend.

## Definition of Done

- `/devices` is served by React (Flask route flipped).
- Add / delete / clear / cancel behave exactly like the old page, including
  alert text and 409 ("already in use") handling.
- Sidebar navigation still works; un-migrated links still use full reload.

## Verification

Side-by-side (`:5000` old vs `:5173` new, per README):
1. Add a device (`abc`, topic `abc`) → appears in the list, success alert.
2. Add a duplicate → 409 alert ("Specified topic or device name already in use.").
3. Try an invalid name (per `pattern`) → browser validation blocks it.
4. Remove one device → disappears after refetch.
5. Clear all → list empties, alert shown.
6. Compare markup/classes against the old page.

## Risks / notes

- List DOM after clear: the old code empties the list client-side *before* the
  request; mirror that so a failure still shows an empty list (parity).
- This spec intentionally introduces full-page reloads when leaving `/devices`.
