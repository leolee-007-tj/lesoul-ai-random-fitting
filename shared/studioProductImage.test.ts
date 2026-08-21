import { describe, expect, it } from "vitest";
import { buildStudioProductImagePrompt, hasStudioSourceImage } from "./studioProductImage";

describe("studio product image prompt", () => {
  it("requires hanger/background-only editing while preserving product fidelity", () => {
    const prompt = buildStudioProductImagePrompt("front");
    expect(prompt).toContain("Remove only the hanger and existing background");
    expect(prompt).toContain("Preserve the exact garment");
    expect(prompt).toContain("pure-white seamless studio background");
  });

  it("does not treat the editor placeholder as a source image", () => {
    expect(hasStudioSourceImage("/manus-storage/front.jpg", "/manus-storage/editorial-cafe_f970ce23.jpg")).toBe(true);
    expect(hasStudioSourceImage("/manus-storage/editorial-cafe_f970ce23.jpg", "/manus-storage/editorial-cafe_f970ce23.jpg")).toBe(false);
  });
});
