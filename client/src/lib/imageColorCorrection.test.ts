import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./imageColorCorrection.ts", import.meta.url), "utf8");
const manager = fs.readFileSync(new URL("../pages/ProductManagerV2.tsx", import.meta.url), "utf8");

describe("detail image color correction", () => {
  it("keeps the original file separate and creates a same-dimension canvas correction", () => {
    expect(source).toContain("The original file is never modified or overwritten");
    expect(source).toContain("canvas.width = image.naturalWidth");
    expect(source).toContain("canvas.height = image.naturalHeight");
    expect(source).toContain("context.putImageData(pixels, 0, 0)");
    expect(source).toContain("canvas.toDataURL(mimeType, 1)");
  });

  it("uses AI only for new camera photos and falls back to the uploaded original", () => {
    expect(manager).toContain("const shouldEnhance = fromCamera && editingId === null");
    expect(manager).toContain("enhanceProductImage.mutateAsync");
    expect(manager).toContain("frontStudioUrl: enhanced.url");
    expect(manager).toContain("AI 보정에 실패해 원본 사진을 대신 사용합니다.");
    expect(manager).toContain('frontStudioUrl: ""');
    expect(manager).toContain("detailStudioUrls");
    expect(manager).toContain("nextStudio[detailIndex] = enhanced.url");
  });
});
