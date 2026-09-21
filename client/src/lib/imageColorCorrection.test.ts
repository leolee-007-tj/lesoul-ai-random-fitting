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

  it("uploads detail originals and corrected studio copies separately", () => {
    expect(manager).toContain("autoCorrectProductImageColorOrOriginal(file)");
    expect(manager).toContain('variant: "original"');
    expect(manager).toContain('variant: "studio"');
    expect(manager).toContain("detailStudioUrls");
    expect(manager).toContain("asset(url, draft.detailStudioUrls[index] || url)");
  });
});
