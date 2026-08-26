export type PricingMode = "BASE" | "SEASON_FORMAT_1" | "SEASON_FORMAT_2" | "SEASON_FORMAT_3";
export type PricingTier = "NORMAL" | "VIP";

export const PRICING_MODES: PricingMode[] = ["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"];

function safeQuantity(quantity: number) {
  return Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1));
}

/** The store's agreed rounding rule: amounts below .5 round down and .5 or above round up. */
export function roundCny(value: number) {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}

export type ProductBaseDiscounts = {
  normalDiscountPercent?: number | null;
  vipDiscountPercent?: number | null;
};

export type NewArrivalSalePolicy = {
  isNew?: number | boolean | null;
  excludeNewArrivalsFromSale?: number | boolean | null;
};

function isEnabled(value: number | boolean | null | undefined) {
  return value === true || value === 1;
}

function productBaseDiscount(tier: PricingTier, discounts?: ProductBaseDiscounts) {
  if (tier === "VIP") return discounts?.vipDiscountPercent === 30 ? 30 : 20;
  return discounts?.normalDiscountPercent === 20 ? 20 : 17;
}

export function resolvePricingDiscountPercent(mode: PricingMode | null | undefined, tier: PricingTier, quantity: number, discounts?: ProductBaseDiscounts) {
  const units = safeQuantity(quantity);
  if (mode === "SEASON_FORMAT_1") return units >= 4 ? 45 : units === 3 ? 40 : units === 2 ? 30 : 20;
  if (mode === "SEASON_FORMAT_2") return units >= 3 ? 45 : units === 2 ? 40 : 30;
  if (mode === "SEASON_FORMAT_3") return 45;
  return productBaseDiscount(tier, discounts);
}

export function resolveCentralPrice(originalPrice: number, options: { mode?: PricingMode | null; tier: PricingTier; quantity?: number } & ProductBaseDiscounts & NewArrivalSalePolicy) {
  const original = roundCny(originalPrice);
  const quantity = safeQuantity(options.quantity ?? 1);
  const seasonalSale = isSeasonalPricingMode(options.mode);
  const excludedNewArrival = seasonalSale && isEnabled(options.isNew) && isEnabled(options.excludeNewArrivalsFromSale);
  const discountPercent = excludedNewArrival ? 0 : resolvePricingDiscountPercent(options.mode, options.tier, quantity, options);
  const unitPrice = roundCny(original * (1 - discountPercent / 100));
  return { original, quantity, discountPercent, unitPrice, total: unitPrice * quantity, mode: options.mode ?? "BASE" as PricingMode, excludedNewArrival };
}

export function isSeasonalPricingMode(mode: PricingMode | null | undefined) {
  return mode === "SEASON_FORMAT_1" || mode === "SEASON_FORMAT_2" || mode === "SEASON_FORMAT_3";
}

export function formatCentralDiscount(discountPercent: number, locale: "en" | "ko" | "zh") {
  const safe = Math.max(0, Math.min(100, roundCny(discountPercent)));
  if (locale === "en") return `${safe}% OFF`;
  if (locale === "ko") return `${safe}% 할인`;
  const zhe = (100 - safe) / 10;
  return `${Number.isInteger(zhe) ? zhe : zhe.toFixed(1)}折`;
}
