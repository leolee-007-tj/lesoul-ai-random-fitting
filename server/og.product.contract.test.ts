import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("product share preview route", () => {
  const source = readFileSync(resolve(process.cwd(), "server/og.ts"), "utf8");

  it("provides product-specific Open Graph image and localized metadata without prices", () => {
    expect(source).toContain('app.get("/share/product/:id"');
    expect(source).toContain("og:image");
    expect(source).toContain("imageViews?.front || product.imageUrl");
    expect(source).toContain("nameKo");
    expect(source).toContain("nameZh");
    expect(source).toContain("twitter:image");
    expect(source).toContain("/catalog?product=");
    expect(source).not.toContain("og:price");
    expect(source).not.toContain("priceOriginal");
  });
});
