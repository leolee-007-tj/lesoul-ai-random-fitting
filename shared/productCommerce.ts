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

const productMetaTranslations: Record<string, Record<ProductLocale, string>> = {
  "深蓝": { en: "Deep Blue", ko: "딥 블루", zh: "深蓝" },
  "浅灰色": { en: "Light Grey", ko: "라이트 그레이", zh: "浅灰色" },
  "灰棕": { en: "Taupe Grey", ko: "토프 그레이", zh: "灰棕" },
  "炭灰": { en: "Charcoal", ko: "차콜", zh: "炭灰" },
  "白色": { en: "White", ko: "화이트", zh: "白色" },
  "黑色": { en: "Black", ko: "블랙", zh: "黑色" },
  "멜란지": { en: "Melange", ko: "멜란지", zh: "混色" },
  "夏": { en: "Summer", ko: "여름", zh: "夏" },
  "夏天": { en: "Summer", ko: "여름", zh: "夏" },
  "여름": { en: "Summer", ko: "여름", zh: "夏" },
  "夏天 秋天": { en: "Summer · Autumn", ko: "여름 · 가을", zh: "夏 · 秋" },
  "夏天，秋天": { en: "Summer · Autumn", ko: "여름 · 가을", zh: "夏 · 秋" },
  "春 夏 秋": { en: "Spring · Summer · Autumn", ko: "봄 · 여름 · 가을", zh: "春 · 夏 · 秋" },
  "春，夏，秋，冬": { en: "All Seasons", ko: "사계절", zh: "四季" },
  "日常": { en: "Everyday", ko: "데일리", zh: "日常" },
  "城市": { en: "City", ko: "시티", zh: "都市" },
  "minimal": { en: "Minimal", ko: "미니멀", zh: "极简" },
  "简约 /休闲 / 松弛感 / 韩系 / 百搭 / 通勤 / 舒适": { en: "Minimal · Casual · Relaxed · Korean-inspired · Versatile · Office · Comfortable", ko: "미니멀 · 캐주얼 · 릴랙스드 · 한국적 무드 · 활용도 높음 · 오피스 · 편안함", zh: "简约 · 休闲 · 松弛感 · 韩系 · 百搭 · 通勤 · 舒适" },
};

/** Resolves seeded and manually entered merchandising metadata at display time without changing source product data. */
export function localizedProductMeta(value: string | null | undefined, language: string) {
  const source = value?.trim() ?? "";
  if (!source || ["color", "season", "style"].includes(source.toLowerCase())) return "";
  return productMetaTranslations[source]?.[toProductLocale(language)] ?? source;
}

/** Black and charcoal merchandise needs an explicit photography-lighting colour notice. */
export function isBlackLikeColor(value: string | null | undefined) {
  return /black|charcoal|블랙|검정|검은|차콜|黑色|黑|炭灰/i.test(value?.trim() ?? "");
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

/** Converts a percentage discount into the Chinese retail discount notation. */
export function formatSaleDiscount(rate: number, locale: ProductLocale) {
  const safeRate = clampPercent(rate);
  if (locale !== "zh") return `SALE ${safeRate}%`;
  const zhe = Math.max(0, Math.min(10, (100 - safeRate) / 10));
  return `${Number.isInteger(zhe) ? zhe : zhe.toFixed(1)}折`;
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
