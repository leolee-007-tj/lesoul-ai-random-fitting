import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const display = readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("store display catalog category filter", () => {
  it("keeps the dedicated display route data source and category values", () => {
    expect(display).toContain("trpc.catalog.storeDisplayProducts.useQuery()");
    expect(display).toContain('type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag"');
    expect(display).toContain('const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"]');
    expect(display).toContain("product.category === category");
  });

  it("localizes labels and exposes the selected state", () => {
    expect(display).toContain("상품 종류");
    expect(display).toContain("Product categories");
    expect(display).toContain("商品分类");
    expect(display).toContain("aria-pressed={category === item}");
    expect(display).toContain("aria-pressed={category === \"all\"}");
  });

  it("keeps new arrivals above regular display products after filtering", () => {
    expect(display).toContain("isNewArrival(product)");
    expect(display).toContain("newArrivals");
    expect(display).toContain("regularProducts");
    expect(display).toContain("right.newArrivalAt ?? right.createdAt");
  });
});
