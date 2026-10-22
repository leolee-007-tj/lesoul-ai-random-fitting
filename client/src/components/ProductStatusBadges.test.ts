import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { commerceResources } from "@/i18n/commerceResources";
import { hasVisibleProductStatusBadge, shouldShowRegularPriceBadge } from "./ProductStatusBadges";

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

  it("renders sold-out as a diagonal center stamp instead of a top status pill", () => {
    const source = readFileSync(new URL("./ProductStatusBadges.tsx", import.meta.url), "utf8");
    expect(source).toContain('rotate-[-18deg]');
    expect(source).toContain('availability === "SOLD_OUT"');
    expect(source).toContain('copy.sold');
  });

  it("keeps the regular-price badge label localized in all supported languages", () => {
    expect(commerceResources.en.product.regularPrice).toBe("BASE DISCOUNT");
    expect(commerceResources.ko.product.regularPrice).toBe("기본 할인");
    expect(commerceResources.zh.product.regularPrice).toBe("常规优惠");
  });

  it("shows the regular-price badge only for excluded new arrivals in a seasonal sale", () => {
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 1, excludeNewArrivalsFromSale: 1 })).toBe(true);
    expect(shouldShowRegularPriceBadge({ mode: "BASE", isNew: 1, excludeNewArrivalsFromSale: 1 })).toBe(false);
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 0, excludeNewArrivalsFromSale: 1 })).toBe(false);
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 1, excludeNewArrivalsFromSale: 0 })).toBe(false);
  });
});
