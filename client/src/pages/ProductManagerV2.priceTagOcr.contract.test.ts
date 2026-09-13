import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ProductManagerV2.tsx"), "utf8");

describe("ProductManagerV2 price-tag capture", () => {
  it("renders the visible price-tag capture action in the actual /products editor", () => {
    expect(source).toContain('data-testid="price-tag-capture"');
    expect(source).toContain("가격표 촬영·읽기");
    expect(source).toContain('capture="environment"');
  });

  it("maps reviewed OCR text into maker, color, clothing name, and price fields only after explicit apply", () => {
    expect(source).toContain("Maker");
    expect(source).toContain("Color");
    expect(source).toContain("Clothing Name");
    expect(source).toContain('aria-label="Price"');
    expect(source).toContain("applyPriceTagPreview");
    expect(source).toContain("상품 입력칸에 적용");
  });
});
