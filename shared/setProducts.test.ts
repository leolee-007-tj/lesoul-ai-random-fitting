import { describe, expect, it } from "vitest";
import { isSetProduct, localizedSetComponentCategory, localizedSetComponentName, representativeSetCategory, sumSetComponentPrices, type SetProductComponent } from "./setProducts";
import { resolveCentralPrice } from "./pricingPolicy";

const components: SetProductComponent[] = [
  { componentId: "jacket", sortOrder: 1, category: "outer", name: "베이지 재킷", nameEn: "Beige Jacket", nameKo: "베이지 재킷", nameZh: "米色西装外套", price: 1200 },
  { componentId: "trouser", sortOrder: 2, category: "bottom", name: "블랙 슬랙스", nameEn: "Black Trousers", nameKo: "블랙 슬랙스", nameZh: "黑色长裤", price: 800 },
];

describe("grouped set products", () => {
  it("uses the sum of individual garment prices as the set total", () => {
    expect(sumSetComponentPrices(components)).toBe(2000);
    expect(isSetProduct({ productType: "SET", setComponents: components })).toBe(true);
    expect(isSetProduct({ productType: "SINGLE", setComponents: components })).toBe(false);
  });

  it("uses the first ordered component as the representative garment category", () => {
    expect(representativeSetCategory([{ category: "bottom", sortOrder: 2 }, { category: "outer", sortOrder: 1 }])).toBe("outer");
    expect(representativeSetCategory([], "dress")).toBe("dress");
  });

  it("selects individual garment names and categories for the active locale", () => {
    expect(localizedSetComponentName(components[0], "en")).toBe("Beige Jacket");
    expect(localizedSetComponentName(components[0], "zh-CN")).toBe("米色西装外套");
    expect(localizedSetComponentCategory("bottom", "ko")).toBe("하의");
  });

  it("discounts only the stored set total and lets an active season rule override the product base choice", () => {
    const total = sumSetComponentPrices(components);
    expect(resolveCentralPrice(total, { mode: "BASE", tier: "VIP", quantity: 1, normalDiscountPercent: 20, vipDiscountPercent: 30 }).unitPrice).toBe(1400);
    expect(resolveCentralPrice(total, { mode: "SEASON_FORMAT_3", tier: "VIP", quantity: 1, normalDiscountPercent: 20, vipDiscountPercent: 30 }).unitPrice).toBe(1100);
  });
});
