import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const catalog = readFileSync(new URL("./routers/catalog.ts", import.meta.url), "utf8");

describe("product detail performance contract", () => {
  it("uses an indexed single-product lookup for detail panels", () => {
    expect(db).toContain("export async function getProductDetailById(productId: number)");
    expect(db).toContain("where(eq(products.id, productId)).limit(1)");
    expect(catalog).toContain("getProductDetailById(input.productId)");
  });

  it("does not hydrate the whole catalog for normal customer detail requests", () => {
    expect(catalog).toContain("const visible = input.browseAll");
    expect(catalog).toContain("? product.isActive !== 0");
    expect(catalog).toContain('tier === "beta"');
    expect(catalog).toContain("selectVisibleProducts((await getCatalog()).products");
  });
});
