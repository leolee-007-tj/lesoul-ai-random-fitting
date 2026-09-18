import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ProductManagerV2.tsx"), "utf8");

describe("ProductManagerV2 price-tag capture", () => {
  it("renders separate camera and gallery actions in the actual /products editor", () => {
    expect(source).toContain('data-testid="price-tag-capture"');
    expect(source).toContain("가격표 촬영·자동 입력");
    expect(source).toContain("priceTagCameraRef");
    expect(source).toContain("priceTagGalleryRef");
    expect(source).toContain('capture="environment"');
    expect(source).toContain("카메라로 촬영");
    expect(source).toContain("갤러리에서 선택");
  });

  it("keeps the gallery input free of capture so iPhone/iPad can open the photo library", () => {
    expect(source).toContain('<input ref={priceTagGalleryRef} onChange={onPriceTagImage} className="hidden" type="file" accept="image/*" />');
    expect(source).not.toContain('<input ref={priceTagGalleryRef} onChange={onPriceTagImage} className="hidden" type="file" accept="image/*" capture="environment" />');
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
