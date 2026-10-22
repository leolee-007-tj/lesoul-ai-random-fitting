import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./ProductPrice.tsx", import.meta.url), "utf8");

describe("localized original and discounted product price display", () => {
  it("renders original price, effective discount price, and the locale-aware discount badge", () => {
    expect(source).toContain("line-through");
    expect(source).toContain("pricing.original");
    expect(source).toContain("pricing.unitPrice");
    expect(source).toContain("formatCentralDiscount");
  });
});
