import { describe, expect, it } from "vitest";
import { productShareCardPrice } from "./productShareCard";

describe("productShareCardPrice", () => {
  it("uses the centralized NORMAL base discount instead of legacy per-product sale fields", () => {
    const result = productShareCardPrice({ name: "Sample", imageUrl: "https://example.com/item.jpg", price: 100000, priceOriginal: 100000, priceSale: 80000, discountRate: 20, saleEnabled: 1 }, "en");
    expect(result.price).toContain("83,000");
    expect(result.original).toContain("100,000");
    expect(result.discount).toBe("17% OFF");
  });

  it("keeps a new arrival at the original price when the seasonal sale excludes new arrivals", () => {
    const result = productShareCardPrice({ name: "New", imageUrl: "https://example.com/item.jpg", price: 100000, isNew: 1, pricingMode: "SEASON_FORMAT_3", excludeNewArrivalsFromSale: 1 }, "en");
    expect(result.price).toContain("100,000");
    expect(result.discount).toBe("0% OFF");
  });

  it("shows the centralized base policy even when no legacy sale is active", () => {
    const result = productShareCardPrice({ name: "샘플", imageUrl: "https://example.com/item.jpg", price: 78000, saleEnabled: 0 }, "ko");
    expect(result.price).toContain("64,740");
    expect(result.original).toContain("78,000");
    expect(result.discount).toBe("17% 할인");
  });
});
