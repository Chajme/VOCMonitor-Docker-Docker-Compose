/**
 * Sidebar navigation registry.
 *
 * `migrated` decides how an item renders:
 *   false -> plain <a> (full page reload, the route is still Jinja)
 *   true  -> react-router <Link> (client-side navigation)
 *
 * Flip these flags as each page migrates (Specs 3-7).
 */

export interface NavRouteItem {
  kind: "route";
  label: string;
  icon: string;
  to: string;
  migrated: boolean;
}

export interface NavActionItem {
  kind: "action";
  label: string;
  icon: string;
  action: "toggleNotifications";
}

export type NavItem = NavRouteItem | NavActionItem;

export const navItems: NavItem[] = [
  { kind: "route", label: "Home", icon: "home", to: "/", migrated: false },
  { kind: "route", label: "Graph", icon: "analytics", to: "/chart", migrated: false },
  { kind: "route", label: "Compact", icon: "smartphone", to: "/compact", migrated: false },
  { kind: "route", label: "Devices", icon: "devices", to: "/devices", migrated: false },
  {
    kind: "action",
    label: "Notifications",
    icon: "notifications",
    action: "toggleNotifications",
  },
  { kind: "route", label: "Settings", icon: "settings", to: "/settings", migrated: false },
];

/**
 * The five `.nav-list-link` entries, in the same order as the old templates.
 * The Notifications action is intentionally excluded, matching the old
 * `querySelectorAll(".nav-list-link")` behaviour.
 */
export const routeNavItems = navItems.filter(
  (item): item is NavRouteItem => item.kind === "route",
);

/**
 * Mirror of visual-elements.js::setupMenuHighlighter:
 * match the current pathname first, otherwise fall back to the saved index.
 */
export function getActiveNavIndex(
  pathname: string,
  savedIndex: number | null,
): number {
  const matched = routeNavItems.findIndex((item) => item.to === pathname);
  if (matched >= 0) {
    return matched;
  }

  if (
    savedIndex !== null &&
    Number.isInteger(savedIndex) &&
    savedIndex >= 0 &&
    savedIndex < routeNavItems.length
  ) {
    return savedIndex;
  }

  return -1;
}
