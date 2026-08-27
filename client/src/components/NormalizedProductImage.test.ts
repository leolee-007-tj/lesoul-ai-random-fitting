import { describe, expect, it } from "vitest";
import { getContainedImageScale, getProductImageVisibilityClass } from "./NormalizedProductImage";

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
});
