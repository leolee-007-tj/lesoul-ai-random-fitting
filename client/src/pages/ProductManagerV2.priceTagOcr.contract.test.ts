import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ProductManagerV2.tsx"), "utf8");
describe("ProductManagerV2 price-tag capture", () => {
  it("uses one action for camera capture or gallery selection", () => {
    expect(source).toContain('data-testid="price-tag-capture"');
    expect(source).toContain("가격표 촬영·자동 입력");
    expect(source).toContain("priceTagImageRef");
    expect(source).toContain('accept="image/*"');
    expect(source).toContain("가격표 촬영·갤러리 선택");
    expect(source).toContain("가격표를 촬영하거나 갤러리에서 선택하기");
    expect(source).not.toContain("priceTagCameraRef");
    expect(source).not.toContain("priceTagGalleryRef");
    expect(source).not.toContain("카메라로 촬영</button>");
    expect(source).not.toContain("갤러리에서 선택</button>");
  });
  it("keeps the shared input without capture so the device chooser can offer camera and gallery", () => {
    expect(source).toContain('<input ref={priceTagImageRef} onChange={onPriceTagImage} className="hidden" type="file" accept="image/*" />');
    expect(source).not.toContain('capture="environment"');
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
