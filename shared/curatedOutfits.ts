export type CuratedOutfitItemReference = { productId: number };

export function filterCuratedOutfitsByProductId<T extends { items: readonly CuratedOutfitItemReference[] }>(outfits: readonly T[], productId: number | null) {
  if (productId === null) return [...outfits];
  return outfits.filter((outfit) => outfit.items.some((item) => item.productId === productId));
}
