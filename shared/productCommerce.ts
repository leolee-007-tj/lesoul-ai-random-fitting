export type ProductLocale = "en" | "ko" | "zh";

export type LocalizedProduct = {
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  description?: string;
  descriptionEn?: string | null;
  descriptionKo?: string | null;
  descriptionZh?: string | null;
  price?: number;
  discountSeasonEnabled?: number | null;
  discountOnePercent?: number | null;
  discountTwoPercent?: number | null;
  discountThreePercent?: number | null;
  discountFourPlusPercent?: number | null;
  momentCouponEnabled?: number | null;
  momentCouponCode?: string | null;
  momentCouponPercent?: number | null;
};

export function toProductLocale(language: string): ProductLocale {
  if (language.startsWith("ko")) return "ko";
  if (language.startsWith("zh")) return "zh";
  return "en";
}

export function localizedProductName(product: LocalizedProduct, language: string) {
  const locale = toProductLocale(language);
  return (locale === "ko" ? product.nameKo : locale === "zh" ? product.nameZh : product.nameEn) || product.name;
}

export function localizedProductDescription(product: LocalizedProduct, language: string) {
  const locale = toProductLocale(language);
  return (locale === "ko" ? product.descriptionKo : locale === "zh" ? product.descriptionZh : product.descriptionEn) || product.description || "";
}

function clampPercent(value: number | null | undefined) {
  return Math.max(0, Math.min(100, Math.round(value ?? 0)));
}

export function getQuantityDiscountPercent(product: LocalizedProduct, quantity: number) {
  if (!product.discountSeasonEnabled) return 0;
  if (quantity >= 4) return clampPercent(product.discountFourPlusPercent);
  if (quantity === 3) return clampPercent(product.discountThreePercent);
  if (quantity === 2) return clampPercent(product.discountTwoPercent);
  return clampPercent(product.discountOnePercent);
}

export function getMomentCouponPercent(product: LocalizedProduct, couponCode?: string) {
  if (!product.momentCouponEnabled || !product.momentCouponPercent) return 0;
  if (product.momentCouponCode && couponCode?.trim().toUpperCase() !== product.momentCouponCode.trim().toUpperCase()) return 0;
  return clampPercent(product.momentCouponPercent);
}

export function calculateDiscountedPrice(product: LocalizedProduct, quantity = 1, couponCode?: string) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const tierPercent = getQuantityDiscountPercent(product, safeQuantity);
  const couponPercent = getMomentCouponPercent(product, couponCode);
  const unitAfterTier = (product.price ?? 0) * (1 - tierPercent / 100);
  const total = unitAfterTier * safeQuantity * (1 - couponPercent / 100);
  return { quantity: safeQuantity, baseTotal: (product.price ?? 0) * safeQuantity, tierPercent, couponPercent, total: Math.round(total) };
}
