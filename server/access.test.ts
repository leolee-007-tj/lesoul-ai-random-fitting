import { describe, expect, it } from "vitest";
import { selectVisibleProducts } from "./access";

const product = (id: number, category: string, isFeatured = 0, featuredPriority = 0, catalogTier = "full", status = "in_stock") => ({ id, category, isFeatured, featuredPriority, catalogTier, status });

describe("Release catalog selection", () => {
  it("keeps beta catalog in-stock, beta-eligible, and category-balanced", () => {
    const result = selectVisibleProducts([
      product(1, "top", 1, 30, "beta"), product(2, "bottom", 1, 20, "beta"), product(3, "dress", 1, 10, "beta"), product(4, "outer", 0, 0, "beta"), product(5, "bag", 1, 99, "full"), product(6, "top", 1, 99, "beta", "sold_out"),
    ], "beta", 4);
    expect(result).toHaveLength(4);
    expect(result.map((item) => item.id)).toEqual(expect.arrayContaining([1, 2, 3, 4]));
    expect(result.find((item) => item.id === 5)).toBeUndefined();
    expect(result.find((item) => item.id === 6)).toBeUndefined();
  });
});
