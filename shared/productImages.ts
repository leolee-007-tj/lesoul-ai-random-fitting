import type { ProductImageAsset } from "./bodyMeasurements";

export function normalizeProductDetailUrls(urls: readonly string[]) {
  return urls.map((url) => url.trim()).filter(Boolean).slice(0, 2);
}

export function customerProductImage(asset: ProductImageAsset | null | undefined, fallback = ""): string {
  // The original is the approved uploaded item image. Some legacy studio-cut
  // derivatives include visual artifacts, so they are now fallback-only.
  return asset?.original?.trim() || asset?.studioCut?.trim() || fallback;
}

export function buildProductGalleryUrls({ frontUrl, backUrl, detailUrls, fallbackUrls = [], fallbackUrl }: { frontUrl?: string | null; backUrl?: string | null; detailUrls?: readonly string[] | null; fallbackUrls?: readonly string[] | null; fallbackUrl?: string | null }) {
  return Array.from(new Set([frontUrl, backUrl, ...normalizeProductDetailUrls(detailUrls ?? []), ...(fallbackUrls ?? []), fallbackUrl].filter((url): url is string => typeof url === "string" && url.trim().length > 0))).slice(0, 4);
}
