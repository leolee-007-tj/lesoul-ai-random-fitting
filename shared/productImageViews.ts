import type { ProductImageAsset } from "./bodyMeasurements";

export function replaceDetailSlot(existing: ProductImageAsset[] | null | undefined, index: 0 | 1, asset: ProductImageAsset) {
  const next = [...(existing ?? [])];
  next[index] = asset;
  return next.slice(0, 2);
}
