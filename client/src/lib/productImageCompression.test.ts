import { describe, expect, it } from "vitest";
import { PRODUCT_IMAGE_COMPRESSION_THRESHOLD_BYTES, productImageCompressionPlan } from "./productImageCompression";

describe("productImageCompressionPlan", () => {
  it("keeps small product images at their original dimensions", () => {
    expect(productImageCompressionPlan({ width: 1200, height: 1600, bytes: 240_000 })).toEqual({ width: 1200, height: 1600, needsResize: false, shouldEncode: false });
  });

  it("resizes large camera images without changing their aspect ratio", () => {
    expect(productImageCompressionPlan({ width: 4096, height: 3072, bytes: 4_000_000 })).toMatchObject({ width: 2048, height: 1536, needsResize: true, shouldEncode: true });
  });

  it("compresses oversized files even when their dimensions are already suitable", () => {
    expect(productImageCompressionPlan({ width: 1200, height: 1600, bytes: PRODUCT_IMAGE_COMPRESSION_THRESHOLD_BYTES + 1 })).toMatchObject({ needsResize: false, shouldEncode: true });
  });
});
