import { describe, expect, it } from "vitest";
import { getFitReferenceNotice } from "./FitReferenceNotice";

describe("getFitReferenceNotice", () => {
  it("uses the requested Korean product-detail guidance", () => {
    const copy = getFitReferenceNotice("ko", "detail");
    expect(copy).toContain("상품사진 및 AI 착용 이미지는 참고용입니다");
    expect(copy).toContain("아래 실측 사이즈");
    expect(copy).toContain("조명 환경");
  });

  it("localizes the product-detail guidance for English and Chinese", () => {
    expect(getFitReferenceNotice("en", "detail")).toContain("Actual product color may vary slightly");
    expect(getFitReferenceNotice("zh", "detail")).toContain("实际产品颜色可能略有差异");
  });
});
