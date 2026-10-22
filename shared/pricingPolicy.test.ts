import { describe, expect, it } from "vitest";
import { formatCentralDiscount, resolveCentralPrice, resolvePricingDiscountPercent } from "./pricingPolicy";

describe("central pricing policy", () => {
  it("uses each product's selected NORMAL and VIP base discounts for every quantity", () => {
    expect(resolvePricingDiscountPercent("BASE", "NORMAL", 1, { normalDiscountPercent: 17 })).toBe(17);
    expect(resolvePricingDiscountPercent("BASE", "NORMAL", 4, { normalDiscountPercent: 20 })).toBe(20);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 1, { vipDiscountPercent: 20 })).toBe(20);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 3, { vipDiscountPercent: 30 })).toBe(30);
    expect(resolveCentralPrice(1000, { mode: "BASE", tier: "VIP", quantity: 4, vipDiscountPercent: 30 }).unitPrice).toBe(700);
  });

  it("uses manually entered discount percentages instead of only preset values", () => {
    expect(resolvePricingDiscountPercent("BASE", "NORMAL", 1, { normalDiscountPercent: 25 })).toBe(25);
    expect(resolveCentralPrice(1000, { mode: "BASE", tier: "VIP", vipDiscountPercent: 35 }).unitPrice).toBe(650);
  });

  it("returns the original price when the owner disables central sale activity", () => {
    const pricing = resolveCentralPrice(1000, { mode: "SEASON_FORMAT_3", tier: "VIP", quantity: 4, vipDiscountPercent: 30, centralSaleEnabled: 0 });
    expect(pricing.discountPercent).toBe(0);
    expect(pricing.unitPrice).toBe(1000);
    expect(pricing.total).toBe(4000);
  });

  it("returns the original price after the configured sale end time", () => {
    const expired = resolveCentralPrice(1000, { mode: "SEASON_FORMAT_3", tier: "NORMAL", centralSaleEnabled: 1, saleEndsAt: new Date(Date.now() - 1_000) });
    expect(expired.discountPercent).toBe(0);
    expect(expired.unitPrice).toBe(1000);
  });

  it("overrides base discounts with each seasonal format", () => {
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_1", "VIP", quantity))).toEqual([20, 30, 40, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_2", "NORMAL", quantity))).toEqual([30, 40, 45, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_3", "VIP", quantity))).toEqual([45, 45, 45, 45]);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 4, { vipDiscountPercent: 30 })).toBe(30);
  });

  it("keeps new arrivals on their selected base discount when a seasonal sale excludes them", () => {
    const excluded = resolveCentralPrice(1000, { mode: "SEASON_FORMAT_3", tier: "NORMAL", normalDiscountPercent: 20, isNew: 1, excludeNewArrivalsFromSale: 1 });
    expect(excluded.discountPercent).toBe(20);
    expect(excluded.unitPrice).toBe(800);
    expect(excluded.excludedNewArrival).toBe(true);
    const vipExcluded = resolveCentralPrice(1000, { mode: "SEASON_FORMAT_3", tier: "VIP", vipDiscountPercent: 30, isNew: 1, excludeNewArrivalsFromSale: 1 });
    expect(vipExcluded.discountPercent).toBe(30);
    expect(vipExcluded.unitPrice).toBe(700);
    const included = resolveCentralPrice(1000, { mode: "SEASON_FORMAT_3", tier: "NORMAL", isNew: 1, excludeNewArrivalsFromSale: 0 });
    expect(included.discountPercent).toBe(45);
  });

  it("rounds CNY unit prices and formats the Chinese 折 label", () => {
    expect(resolveCentralPrice(999, { mode: "BASE", tier: "NORMAL", normalDiscountPercent: 17 }).unitPrice).toBe(829);
    expect(resolveCentralPrice(1000, { mode: "SEASON_FORMAT_1", tier: "NORMAL", quantity: 3 }).total).toBe(1800);
    expect(formatCentralDiscount(20, "zh")).toBe("8折");
    expect(formatCentralDiscount(17, "zh")).toBe("8.3折");
  });
});
