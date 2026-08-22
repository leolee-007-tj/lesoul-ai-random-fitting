import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveCentralPrice, resolvePricingDiscountPercent } from "../shared/pricingPolicy";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("per-product base pricing", () => {
  it("uses product-selected base discounts and lets seasonal formats override them", () => {
    expect(resolveCentralPrice(1000, { mode: "BASE", tier: "NORMAL", normalDiscountPercent: 20 }).unitPrice).toBe(800);
    expect(resolveCentralPrice(1000, { mode: "BASE", tier: "VIP", vipDiscountPercent: 30 }).unitPrice).toBe(700);
    expect(resolvePricingDiscountPercent("SEASON_FORMAT_1", "VIP", 2, { vipDiscountPercent: 30 })).toBe(30);
  });

  it("persists selections and passes them through every purchase price path", () => {
    expect(read("drizzle/schema.ts")).toContain('normalDiscountPercent: int("normalDiscountPercent")');
    expect(read("drizzle/schema.ts")).toContain('vipDiscountPercent: int("vipDiscountPercent")');
    expect(read("client/src/pages/ProductManagerV2.tsx")).toContain('normalDiscountPercent: 17 | 20');
    expect(read("client/src/pages/ProductManagerV2.tsx")).toContain('vipDiscountPercent: 20 | 30');
    expect(read("server/routers/purchase.ts")).toContain("normalDiscountPercent: product.normalDiscountPercent");
    expect(read("client/src/components/ProductPrice.tsx")).toContain("vipDiscountPercent: product.vipDiscountPercent");
    expect(read("client/src/pages/SaleSettings.tsx")).toContain("Select Base to restore the NORMAL and VIP discount chosen for each product.");
  });
});
