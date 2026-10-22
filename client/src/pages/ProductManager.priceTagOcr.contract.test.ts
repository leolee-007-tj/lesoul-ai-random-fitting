import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manager = readFileSync(new URL("./ProductManager.tsx", import.meta.url), "utf8");
const adminRouter = readFileSync(new URL("../../../server/routers/admin.ts", import.meta.url), "utf8");

describe("price-tag OCR product entry", () => {
  it("keeps OCR owner-only and uses the required pipe-delimited fields", () => {
    expect(adminRouter).toContain("extractPriceTag: ownerProcedure");
    expect(adminRouter).toContain("Maker | Color | Clothing Name | Price");
    expect(adminRouter).toContain("response_format");
    expect(adminRouter).toContain("price_tag_extraction");
  });

  it("shows a camera-friendly capture action and review-before-apply flow", () => {
    expect(manager).toContain("capture=\"environment\"");
    expect(manager).toContain("가격표 촬영·읽기");
    expect(manager).toContain("읽은 원문");
    expect(manager).toContain("입력칸에 적용");
    expect(manager).toContain("applyPriceTagPreview");
  });

  it("does not save OCR output without the normal product form submit", () => {
    expect(manager).toContain("setPriceTagPreview(null)");
    expect(manager).toContain("if (editing) update.mutate");
    expect(manager).toContain("else create.mutate");
  });
});
