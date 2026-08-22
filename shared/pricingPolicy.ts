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

export function resolvePricingDiscountPercent(mode: PricingMode | null | undefined, tier: PricingTier, quantity: number) {
  const units = safeQuantity(quantity);
  if (mode === "SEASON_FORMAT_1") return units >= 4 ? 45 : units === 3 ? 40 : units === 2 ? 30 : 20;
  if (mode === "SEASON_FORMAT_2") return units >= 3 ? 45 : units === 2 ? 40 : 30;
  if (mode === "SEASON_FORMAT_3") return 45;
  if (tier === "VIP") return 22;
  return 17;
}

export function resolveCentralPrice(originalPrice: number, options: { mode?: PricingMode | null; tier: PricingTier; quantity?: number }) {
  const original = roundCny(originalPrice);
  const quantity = safeQuantity(options.quantity ?? 1);
  const discountPercent = resolvePricingDiscountPercent(options.mode, options.tier, quantity);
  const unitPrice = roundCny(original * (1 - discountPercent / 100));
  return { original, quantity, discountPercent, unitPrice, total: unitPrice * quantity, mode: options.mode ?? "BASE" as PricingMode };
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
