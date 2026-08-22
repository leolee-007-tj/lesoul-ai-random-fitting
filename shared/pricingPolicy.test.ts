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

  it("overrides base discounts with each seasonal format", () => {
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_1", "VIP", quantity))).toEqual([20, 30, 40, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_2", "NORMAL", quantity))).toEqual([30, 40, 45, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_3", "VIP", quantity))).toEqual([45, 45, 45, 45]);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 4, { vipDiscountPercent: 30 })).toBe(30);
  });

  it("rounds CNY unit prices and formats the Chinese 折 label", () => {
    expect(resolveCentralPrice(999, { mode: "BASE", tier: "NORMAL", normalDiscountPercent: 17 }).unitPrice).toBe(829);
    expect(resolveCentralPrice(1000, { mode: "SEASON_FORMAT_1", tier: "NORMAL", quantity: 3 }).total).toBe(1800);
    expect(formatCentralDiscount(20, "zh")).toBe("8折");
    expect(formatCentralDiscount(17, "zh")).toBe("8.3折");
  });
});
