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

export type SaleSchedule = { saleEndsAt?: Date | string | null };

function isEnabled(value: number | boolean | null | undefined) {
  return value === true || value === 1;
}

export function isNewArrivalExcludedFromSale(options: { mode?: PricingMode | null } & NewArrivalSalePolicy) {
  return isSeasonalPricingMode(options.mode) && isEnabled(options.isNew) && isEnabled(options.excludeNewArrivalsFromSale);
}

function productBaseDiscount(tier: PricingTier, discounts?: ProductBaseDiscounts) {
  const selected = tier === "VIP" ? discounts?.vipDiscountPercent : discounts?.normalDiscountPercent;
  if (typeof selected === "number" && Number.isFinite(selected)) return Math.max(0, Math.min(100, Math.round(selected)));
  return tier === "VIP" ? 20 : 17;
}

export function resolvePricingDiscountPercent(mode: PricingMode | null | undefined, tier: PricingTier, quantity: number, discounts?: ProductBaseDiscounts) {
  const units = safeQuantity(quantity);
  if (mode === "SEASON_FORMAT_1") return units >= 4 ? 45 : units === 3 ? 40 : units === 2 ? 30 : 20;
  if (mode === "SEASON_FORMAT_2") return units >= 3 ? 45 : units === 2 ? 40 : 30;
  if (mode === "SEASON_FORMAT_3") return 45;
  return productBaseDiscount(tier, discounts);
}

export function resolveCentralPrice(originalPrice: number, options: { mode?: PricingMode | null; tier: PricingTier; quantity?: number; centralSaleEnabled?: number | boolean | null } & ProductBaseDiscounts & NewArrivalSalePolicy & SaleSchedule) {
  const original = roundCny(originalPrice);
  const quantity = safeQuantity(options.quantity ?? 1);
  const endTime = options.saleEndsAt ? new Date(options.saleEndsAt).getTime() : null;
  const saleExpired = endTime !== null && Number.isFinite(endTime) && endTime <= Date.now();
  if (!isEnabled(options.centralSaleEnabled ?? 1) || saleExpired) return { original, quantity, discountPercent: 0, unitPrice: original, total: original * quantity, mode: options.mode ?? "BASE" as PricingMode, excludedNewArrival: false };
  const excludedNewArrival = isNewArrivalExcludedFromSale(options);
  const discountPercent = excludedNewArrival
    ? resolvePricingDiscountPercent("BASE", options.tier, quantity, options)
    : resolvePricingDiscountPercent(options.mode, options.tier, quantity, options);
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
