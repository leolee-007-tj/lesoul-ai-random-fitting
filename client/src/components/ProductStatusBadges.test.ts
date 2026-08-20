import { describe, expect, it } from "vitest";
import { hasVisibleProductStatusBadge } from "./ProductStatusBadges";

describe("hasVisibleProductStatusBadge", () => {
  it("hides a standard availability badge when a recommendation suppresses direct-purchase status", () => {
    expect(hasVisibleProductStatusBadge(false, false)).toBe(false);
  });

  it("retains a new-arrival marker when availability is intentionally hidden", () => {
    expect(hasVisibleProductStatusBadge(false, true)).toBe(true);
  });

  it("keeps availability badges on all other product surfaces", () => {
    expect(hasVisibleProductStatusBadge(true, false)).toBe(true);
  });
});
