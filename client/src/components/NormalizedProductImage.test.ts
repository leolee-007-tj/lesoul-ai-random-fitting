import { describe, expect, it } from "vitest";
import { getContainedImageScale } from "./NormalizedProductImage";

describe("contained product image scale", () => {
  it("keeps a visual cushion for full garment visibility without enlarging image sources", () => {
    expect(getContainedImageScale()).toBe(0.94);
    expect(getContainedImageScale({ manualScale: 0.8 })).toBe(0.8);
    expect(getContainedImageScale({ effectiveScale: 1.25 })).toBe(0.94);
  });
});
