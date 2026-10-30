import { describe, expect, it } from "vitest";
import { getActiveNavIndex, routeNavItems } from "../navItems";

describe("routeNavItems", () => {
  it("matches the old .nav-list-link order", () => {
    expect(routeNavItems.map((item) => item.to)).toEqual([
      "/",
      "/chart",
      "/compact",
      "/devices",
      "/settings",
    ]);
  });
});

describe("getActiveNavIndex", () => {
  it("matches the current pathname", () => {
    expect(getActiveNavIndex("/", null)).toBe(0);
    expect(getActiveNavIndex("/devices", null)).toBe(3);
    expect(getActiveNavIndex("/settings", 0)).toBe(4);
  });

  it("falls back to the saved index when the path is unknown", () => {
    expect(getActiveNavIndex("/not-a-page", 4)).toBe(4);
  });

  it("ignores invalid or out-of-range saved indexes", () => {
    expect(getActiveNavIndex("/not-a-page", null)).toBe(-1);
    expect(getActiveNavIndex("/not-a-page", -1)).toBe(-1);
    expect(getActiveNavIndex("/not-a-page", 99)).toBe(-1);
    expect(getActiveNavIndex("/not-a-page", Number.NaN)).toBe(-1);
  });

  it("prefers a path match over the saved index", () => {
    expect(getActiveNavIndex("/compact", 4)).toBe(2);
  });
});
