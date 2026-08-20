import { describe, expect, it } from "vitest";
import { buildProductGalleryUrls, normalizeProductDetailUrls } from "./productImages";

describe("four-product-image policy", () => {
  it("keeps only two detail shots and creates an ordered four-image gallery", () => {
    expect(normalizeProductDetailUrls([" detail-1.jpg ", "detail-2.jpg", "detail-3.jpg"])).toEqual(["detail-1.jpg", "detail-2.jpg"]);
    expect(buildProductGalleryUrls({ frontUrl: "front.jpg", backUrl: "back.jpg", detailUrls: ["detail-1.jpg", "detail-2.jpg", "detail-3.jpg"], fallbackUrls: ["legacy.jpg"], fallbackUrl: "fallback.jpg" })).toEqual(["front.jpg", "back.jpg", "detail-1.jpg", "detail-2.jpg"]);
  });
});
