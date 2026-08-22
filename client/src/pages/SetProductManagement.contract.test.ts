import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("set-product manager contract", () => {
  it("lets the owner choose a set and manage two or more individual garment entries", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain('productType: "SINGLE" | "SET"');
    expect(manager).toContain('value="SET"');
    expect(manager).toContain("draft.setComponents.length >= 6");
    expect(manager).toContain("draft.setComponents.length <= 2");
    expect(manager).toContain("sumSetComponentPrices(draft.setComponents)");
    expect(manager).toContain("priceReadOnly={draft.productType === \"SET\"}");
  });

  it("keeps the customer-facing set total and individual components together through catalog and purchase flows", () => {
    const detail = source("client/src/components/ProductDetailScreen.tsx");
    const list = source("client/src/pages/PurchaseList.tsx");
    const catalog = source("server/routers/catalog.ts");
    const purchase = source("server/routers/purchase.ts");
    expect(detail).toContain("copy.components");
    expect(detail).toContain("localizedSetComponentName(component, language)");
    expect(list).toContain("copy.includes");
    expect(catalog).toContain("productType: product.productType, setComponents: product.setComponents");
    expect(purchase).toContain("productType: product.productType, setComponents: product.setComponents");
  });
});
