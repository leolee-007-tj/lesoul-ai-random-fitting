import { describe, expect, it } from "vitest";
import { formatCentralDiscount, resolveCentralPrice, resolvePricingDiscountPercent } from "./pricingPolicy";

describe("central pricing policy", () => {
  it("keeps NORMAL at 17% and increases VIP discount from 20% to 22% by quantity", () => {
    expect(resolvePricingDiscountPercent("BASE", "NORMAL", 1)).toBe(17);
    expect(resolvePricingDiscountPercent("BASE", "NORMAL", 4)).toBe(17);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 1)).toBe(20);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 2)).toBe(21);
    expect(resolvePricingDiscountPercent("BASE", "VIP", 3)).toBe(22);
  });

  it("overrides base discounts with each seasonal format", () => {
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_1", "VIP", quantity))).toEqual([20, 30, 40, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_2", "NORMAL", quantity))).toEqual([30, 40, 45, 45]);
    expect([1, 2, 3, 4].map((quantity) => resolvePricingDiscountPercent("SEASON_FORMAT_3", "VIP", quantity))).toEqual([45, 45, 45, 45]);
  });

  it("rounds CNY unit prices and formats the Chinese 折 label", () => {
    expect(resolveCentralPrice(999, { mode: "BASE", tier: "NORMAL" }).unitPrice).toBe(829);
    expect(resolveCentralPrice(1000, { mode: "SEASON_FORMAT_1", tier: "NORMAL", quantity: 3 }).total).toBe(1800);
    expect(formatCentralDiscount(20, "zh")).toBe("8折");
    expect(formatCentralDiscount(17, "zh")).toBe("8.3折");
  });
});
