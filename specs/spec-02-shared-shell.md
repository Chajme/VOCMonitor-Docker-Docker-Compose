# Spec 2 — Shared Shell (Layout, Sidebar, Notification Panel, Socket.IO)

## Goal

Reproduce the chrome shared by every page — sidebar, mobile menu toggle,
notification panel, and Socket.IO alerts — as reusable React components, so
each migrated page gets an identical shell (D9). This fixes the "same sidebar
duplicated in 5 templates" smell.

## Depends on

Spec 1.

## Files touched

New:
- `frontend/src/components/layout/Layout.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/MenuToggle.tsx`
- `frontend/src/components/notifications/NotificationPanel.tsx`
- `frontend/src/components/notifications/NotificationProvider.tsx`
- `frontend/src/hooks/useSocket.ts`
- `frontend/src/hooks/useNotifications.ts`
- `frontend/src/hooks/useMenuToggle.ts`
- `frontend/src/lib/navItems.ts` (route registry incl. migrated flag)

Modified:
- `frontend/src/App.tsx` — wrap routes in `Layout` + `NotificationProvider`
- `frontend/index.html` — confirm Inter + Material Icons + `style.css` links

## Markup to reproduce (copy verbatim from templates)

- Menu toggle: `<div class="menu-toggle"><i class="material-icons md-light">menu</i></div>`
- Sidebar: `.menu-section` > `.menu-div` > `.menu-section-flex-container` >
  `.logo` (`/static/images/VOCMonitorLogo.png`) and `nav.sidebar-nav > ul.nav-list`
  with items:
  - Home → `/` (`home` icon)
  - Graph → `/chart` (`analytics`)
  - Compact → `/compact` (`smartphone`)
  - Devices → `/devices` (`devices`)
  - Notifications → `#toggleNotifications` (`notifications`)
  - Settings → `/settings` (`settings`)
- Notification panel:
  `<div class="notifications-container" id="notificationPanel">` with
  `#closeNotifications`, `#clearAll` (+ label), and `<ul id="notification-list">`.

## Design notes

- **Nav links follow the migrated flag** (`lib/navItems.ts`):
  - migrated route → react-router `<Link>`
  - un-migrated route → plain `<a href>` (full page reload, D5)
  Start with everything un-migrated; flip entries as each page migrates.
- **Active highlight** replicates `visual-elements.js`:
  - compare `window.location.pathname` to each item's path, set
    `data-selected="true"` on the match;
  - persist the chosen index in `localStorage` key `selectedMenuOption` and use
    it as a fallback when no path matches;
  - also highlight the "Notifications" item when its panel is opened.
- **Notification panel** slide is inline style, not CSS classes:
  `style={{ right: isOpen ? "0px" : "-350px" }}` to match the old behavior.
  Reset the same way for open/close.
- **Panel data:** open → `getNotificationHistory()`; render each item as
  `<li data-id>` with `<strong>{timestamp}</strong>`, message, `<em>VOC Level: {voc}</em>`
  and a `.delete-btn` button; click-outside close; Clear All → `clearNotifications()`
  then empty the list; delete → `deleteNotification(id)` then refetch (both with
  native `alert()` on failure, D13).
- **Socket.IO (`socket.io-client` npm, D14-adjacent):** one `io()` connection at
  app root; on `alert` → browser `Notification` (request permission if needed),
  exactly like `socket.js`. The server emits a welcome alert on connect.
- **Menu toggle (<1024px):** toggle `.open` on `.menu-section`; opening the menu
  closes the notification panel; remove `.open` at ≥1024px on resize.

## Out of scope

- Any page content (Specs 3–7).
- Changing `style.css`.

## Definition of Done

- Any migrated page renders the identical shell (DOM structure + classes).
- Browser notifications appear on server `alert`.
- Panel open/close, list fetch, per-item delete, clear-all all work.
- Active nav highlight matches pathname and survives reload via `localStorage`.
- Menu toggle behaves at <1024px.

## Verification

Side-by-side (per README method): render the shell at a test route on `:5173`,
compare DOM/CSS against an old page on `:5000`. Trigger an alert (server
`alert` event) → browser notification. Resize below 1024px → toggle works.

## Risks / notes

- `data-selected` styling lives in `style.css` — set the attribute exactly.
- The old click-outside handler toggled a `.active` class that is never added
  (effectively a no-op). Dropping it has no visual effect; if in doubt, keep
  behavior identical by leaving it out.
