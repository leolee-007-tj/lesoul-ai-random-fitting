import { describe, expect, it } from "vitest";
import { mergePurchaseListItem, type PurchaseListItem } from "./PurchaseListContext";

const item = (productId: number, selectedSize = "FREE", quantity = 1): PurchaseListItem => ({
  productId,
  productName: `Product ${productId}`,
  productImage: `https://example.com/${productId}.jpg`,
  selectedSize,
  availableSizes: [selectedSize],
  quantity,
  currentPrice: productId * 10,
});

describe("PurchaseListContext multi-item additions", () => {
  it("keeps every product when a curated look adds multiple items in one reduction", () => {
    const first = item(101);
    const second = item(202);

    const result = [first, second].reduce(mergePurchaseListItem, [] as PurchaseListItem[]);

    expect(result.map((entry) => entry.productId)).toEqual([101, 202]);
    expect(result).toHaveLength(2);
  });

  it("merges only the same product and selected size", () => {
    const result = [item(101), item(101, "M")].reduce(mergePurchaseListItem, [item(101)]);

    expect(result).toHaveLength(2);
    expect(result.find((entry) => entry.selectedSize === "FREE")?.quantity).toBe(2);
    expect(result.find((entry) => entry.selectedSize === "M")?.quantity).toBe(1);
  });
});

