import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("product detail notice placement", () => {
  it("keeps the dark-color notice in the detail view footer area", () => {
    const source = readFileSync(new URL("./ProductDetailScreen.tsx", import.meta.url), "utf8");
    expect(source).toContain('<BlackColorVerificationNotice color={product.color} className="mt-5" />');
    expect(source).not.toContain('<BlackColorVerificationNotice color={product.color} className="mt-2" />');
  });
});
