import { describe, expect, it } from "vitest";
import { buildStudioProductImagePrompt, hasStudioSourceImage } from "./studioProductImage";

describe("studio product image prompt", () => {
  it("requires hanger/background-only editing while preserving product fidelity", () => {
    const prompt = buildStudioProductImagePrompt("front");
    expect(prompt).toContain("Keep the uploaded image's exact framing");
    expect(prompt).toContain("Preserve the exact garment");
    expect(prompt).toContain("flat, solid, pure white (#FFFFFF) backdrop");
    expect(prompt).toContain("not a staged studio photograph");
    expect(prompt).toContain("Conservatively neutralize only obvious warm/cool white-balance casts");
    expect(buildStudioProductImagePrompt("back", false)).toContain("Do not change white balance, exposure, hue, saturation");
  });

  it("does not treat the editor placeholder as a source image", () => {
    expect(hasStudioSourceImage("/manus-storage/front.jpg", "/manus-storage/editorial-cafe_f970ce23.jpg")).toBe(true);
    expect(hasStudioSourceImage("/manus-storage/editorial-cafe_f970ce23.jpg", "/manus-storage/editorial-cafe_f970ce23.jpg")).toBe(false);
  });
});
