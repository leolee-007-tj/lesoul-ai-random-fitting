import { describe, expect, it } from "vitest";
import { allowedPendingProductImageCount, MAX_PENDING_PRODUCT_IMAGES, nextProductImageSlot } from "./productBulkImages";

describe("product bulk-image slot helpers", () => {
  it("cycles through the four stable product image slots", () => {
    expect([0, 1, 2, 3].map(nextProductImageSlot)).toEqual(["front", "back", "detail1", "detail2"]);
    expect(nextProductImageSlot(4)).toBe("front");
  });

  it("caps the pending upload tray at four files", () => {
    expect(allowedPendingProductImageCount(0, 9)).toBe(MAX_PENDING_PRODUCT_IMAGES);
    expect(allowedPendingProductImageCount(3, 2)).toBe(1);
    expect(allowedPendingProductImageCount(4, 1)).toBe(0);
  });
});
