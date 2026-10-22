import { describe, expect, it } from "vitest";
import { filterCuratedOutfitsByProductId } from "./curatedOutfits";

describe("filterCuratedOutfitsByProductId", () => {
  const outfits = [
    { id: 1, items: [{ productId: 10 }, { productId: 20 }] },
    { id: 2, items: [{ productId: 20 }, { productId: 30 }] },
    { id: 3, items: [{ productId: 40 }, { productId: 50 }] },
  ];

  it("returns only outfits containing the selected product and restores all results when cleared", () => {
    expect(filterCuratedOutfitsByProductId(outfits, 20).map((outfit) => outfit.id)).toEqual([1, 2]);
    expect(filterCuratedOutfitsByProductId(outfits, 40).map((outfit) => outfit.id)).toEqual([3]);
    expect(filterCuratedOutfitsByProductId(outfits, null).map((outfit) => outfit.id)).toEqual([1, 2, 3]);
  });
});
