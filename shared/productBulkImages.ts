export const PRODUCT_IMAGE_SLOT_ORDER = ["front", "back", "detail1", "detail2"] as const;

export type ProductImageSlotKey = typeof PRODUCT_IMAGE_SLOT_ORDER[number];

export const MAX_PENDING_PRODUCT_IMAGES = PRODUCT_IMAGE_SLOT_ORDER.length;

export function nextProductImageSlot(pendingCount: number): ProductImageSlotKey {
  return PRODUCT_IMAGE_SLOT_ORDER[Math.max(0, pendingCount) % PRODUCT_IMAGE_SLOT_ORDER.length];
}

export function allowedPendingProductImageCount(currentCount: number, incomingCount: number): number {
  return Math.max(0, Math.min(MAX_PENDING_PRODUCT_IMAGES - Math.max(0, currentCount), Math.max(0, incomingCount)));
}
