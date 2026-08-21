import { describe, expect, it } from "vitest";
import { productShareCardPrice } from "./productShareCard";

describe("productShareCardPrice", () => {
  it("uses the current sale price and preserves original-price context", () => {
    const result = productShareCardPrice({ name: "Sample", imageUrl: "https://example.com/item.jpg", price: 100000, priceOriginal: 100000, priceSale: 80000, discountRate: 20, saleEnabled: 1 }, "en");
    expect(result.price).toContain("80,000");
    expect(result.original).toContain("100,000");
    expect(result.discount).toBe("20% OFF");
  });

  it("uses CNY price without a sale label when no sale is active", () => {
    const result = productShareCardPrice({ name: "샘플", imageUrl: "https://example.com/item.jpg", price: 78000, saleEnabled: 0 }, "ko");
    expect(result.price).toContain("78,000");
    expect(result.original).toBeNull();
  });
});
