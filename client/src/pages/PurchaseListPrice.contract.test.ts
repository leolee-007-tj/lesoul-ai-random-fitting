import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./PurchaseList.tsx", import.meta.url), "utf8");

describe("purchase list original and discounted price display", () => {
  it("keeps the original unit price beside the effective discounted unit price", () => {
    expect(source).toContain("getOriginalUnitPrice");
    expect(source).toContain("line-through");
    expect(source).toContain("formatPrice(originalPrice, language)");
    expect(source).toContain("formatPrice(item.currentPrice, language)");
  });
});
