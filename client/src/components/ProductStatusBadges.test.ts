import { describe, expect, it } from "vitest";
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

  it("keeps the regular-price badge label localized in all supported languages", () => {
    expect(commerceResources.en.product.regularPrice).toBe("REGULAR PRICE");
    expect(commerceResources.ko.product.regularPrice).toBe("정상가");
    expect(commerceResources.zh.product.regularPrice).toBe("正常价");
  });

  it("shows the regular-price badge only for excluded new arrivals in a seasonal sale", () => {
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 1, excludeNewArrivalsFromSale: 1 })).toBe(true);
    expect(shouldShowRegularPriceBadge({ mode: "BASE", isNew: 1, excludeNewArrivalsFromSale: 1 })).toBe(false);
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 0, excludeNewArrivalsFromSale: 1 })).toBe(false);
    expect(shouldShowRegularPriceBadge({ mode: "SEASON_FORMAT_3", isNew: 1, excludeNewArrivalsFromSale: 0 })).toBe(false);
  });
});
