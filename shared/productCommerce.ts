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
  priceOriginal?: number | null;
  discountRate?: number | null;
  priceSale?: number | null;
  saleEnabled?: number | boolean | null;
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

export function getOriginalPrice(product: LocalizedProduct) {
  const explicit = Number(product.priceOriginal ?? 0);
  return Number.isFinite(explicit) && explicit > 0 ? Math.round(explicit) : Math.max(0, Math.round(product.price ?? 0));
}

function clampPercent(value: number | null | undefined) {
  return Math.max(0, Math.min(100, Math.round(value ?? 0)));
}

export function calculateSalePrice(priceOriginal: number, discountRate: number) {
  const original = Math.max(0, Math.round(priceOriginal));
  const rate = clampPercent(discountRate);
  return Math.round(original * (1 - rate / 100));
}

export function getSalePriceState(product: LocalizedProduct) {
  const original = getOriginalPrice(product);
  const rate = clampPercent(product.discountRate);
  const sale = Math.round(Number(product.priceSale ?? 0));
  const enabled = product.saleEnabled === true || product.saleEnabled === 1;
  const valid = enabled && original > 0 && rate > 0 && sale > 0 && sale < original;
  return { original, rate, sale, enabled: valid };
}

export function getEffectivePrice(product: LocalizedProduct) {
  const sale = getSalePriceState(product);
  return sale.enabled ? sale.sale : sale.original;
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
  const unitAfterTier = getOriginalPrice(product) * (1 - tierPercent / 100);
  const total = unitAfterTier * safeQuantity * (1 - couponPercent / 100);
  return { quantity: safeQuantity, baseTotal: getOriginalPrice(product) * safeQuantity, tierPercent, couponPercent, total: Math.round(total) };
}
