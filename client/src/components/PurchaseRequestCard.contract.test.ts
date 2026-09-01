import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const read = (relative: string) => readFileSync(resolve(root, relative), "utf8");

describe("purchase request share card contract", () => {
  it("excludes sold-out or inactive items from the generated request image", () => {
    const source = read("client/src/components/PurchaseRequestCard.tsx");
    expect(source).toContain("function isAvailable(item: RequestItem)");
    expect(source).toContain("const availableItems = request.items.filter(isAvailable)");
    expect(source).toContain("request.items.filter(isAvailable)");
    expect(source).toContain("Sold-out items are excluded from the total and shared image.");
  });

  it("shares the current purchase-list image through the mobile share sheet with a save fallback", () => {
    const source = read("client/src/components/PurchaseRequestCard.tsx");
    expect(source).toContain("new File([image], fileName, { type: \"image/png\" })");
    expect(source).toContain("navigator.share({ title: copy.title, text: copy.message, files: [file] })");
    expect(source).toContain("downloadBlob(image, fileName)");
    expect(source).toContain("navigator.clipboard?.writeText(copy.message)");
  });

  it("provides localized purchase-list and share copy for all supported languages", () => {
    const source = read("client/src/components/PurchaseRequestCard.tsx");
    expect(source).toContain("위챗으로 공유");
    expect(source).toContain("分享到微信");
    expect(source).toContain("SHARE TO WECHAT");
    expect(source).toContain("품절 상품은 합계와 공유 이미지에서 제외됩니다.");
    expect(source).toContain("已售罄商品不计入合计和分享图片。");
    expect(source).toContain("Sold-out items are excluded from the total and shared image.");
  });
});
