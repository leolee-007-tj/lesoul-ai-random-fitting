import { describe, expect, it } from "vitest";
import { getContainedImageScale, getProductImageVisibilityClass, getWhiteMarginNormalization, normalizeWhiteMarginBounds, PRODUCT_IMAGE_SURFACE_CLASS } from "./NormalizedProductImage";

describe("contained product image scale", () => {
  it("keeps a visual cushion for full garment visibility without enlarging image sources", () => {
    expect(getContainedImageScale()).toBe(0.94);
    expect(getContainedImageScale({ manualScale: 0.8 })).toBe(0.8);
    expect(getContainedImageScale({ effectiveScale: 1.25 })).toBe(0.94);
  });

  it("keeps the image transparent until its load event completes and hides it on failure", () => {
    expect(getProductImageVisibilityClass(false, false)).toBe("opacity-0");
    expect(getProductImageVisibilityClass(true, false)).toBe("opacity-100");
    expect(getProductImageVisibilityClass(true, true)).toBe("opacity-0");
  });

  it("uses a clean white surface behind product photos instead of a gray overlay", () => {
    expect(PRODUCT_IMAGE_SURFACE_CLASS).toBe("bg-white");
  });

  it("scales a narrow garment with generous white margins while keeping its detected center as the transform origin", () => {
    const result = normalizeWhiteMarginBounds({ sampleWidth: 160, sampleHeight: 160, left: 48, top: 20, right: 111, bottom: 139, foregroundPixels: 4_800 });
    expect(result.scale).toBeGreaterThan(1);
    expect(result.scale).toBeCloseTo(160 / (120 * 1.09), 5);
    expect(result.scale).toBeLessThanOrEqual(1.42);
    expect(result.originX).toBeCloseTo(49.6875);
    expect(result.originY).toBeCloseTo(49.6875);
  });

  it("uses a neutral presentation for blank, full-frame, or invalid bounds", () => {
    expect(normalizeWhiteMarginBounds({ sampleWidth: 160, sampleHeight: 160, left: 160, top: 160, right: -1, bottom: -1, foregroundPixels: 0 })).toEqual({ scale: 1, originX: 50, originY: 50 });
    expect(normalizeWhiteMarginBounds({ sampleWidth: 160, sampleHeight: 160, left: 0, top: 0, right: 159, bottom: 159, foregroundPixels: 24_500 })).toEqual({ scale: 1, originX: 50, originY: 50 });
    expect(normalizeWhiteMarginBounds({ sampleWidth: 0, sampleHeight: 160, left: 0, top: 0, right: 1, bottom: 1, foregroundPixels: 1 })).toEqual({ scale: 1, originX: 50, originY: 50 });
  });

  it("keeps cross-origin or unsupported image processing safe with a neutral fallback", () => {
    expect(getWhiteMarginNormalization({ naturalWidth: 0, naturalHeight: 0 } as HTMLImageElement)).toEqual({ scale: 1, originX: 50, originY: 50 });
  });
});
