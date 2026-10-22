import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./PurchaseScreen.tsx", import.meta.url), "utf8");

describe("price-free purchase sharing card", () => {
  it("keeps product, payment QR, and purchase notice while omitting price calculations", () => {
    expect(source).toContain("buildPurchaseCard(product, language");
    expect(source).toContain("product.purchaseQrUrl");
    expect(source).toContain("purchaseNotice");
    expect(source).not.toContain("formatPrice(pricedProduct.price");
    expect(source).not.toContain("resolveCentralPrice(");
    expect(source).not.toContain("getOriginalPrice(");
  });
});
