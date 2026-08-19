export type AvailabilityStatus = "AVAILABLE" | "SOLD_OUT" | "PREORDER";

export const NEW_BADGE_DAYS = 14;

export function normaliseAvailabilityStatus(value: unknown, legacyStatus?: string | null): AvailabilityStatus {
  if (value === "AVAILABLE" || value === "SOLD_OUT" || value === "PREORDER") return value;
  return legacyStatus === "sold_out" ? "SOLD_OUT" : "AVAILABLE";
}

export function legacyStatusForAvailability(status: AvailabilityStatus): "in_stock" | "sold_out" {
  return status === "SOLD_OUT" ? "sold_out" : "in_stock";
}

export function isNewArrival(product: { isNew?: number | boolean | null; newArrivalAt?: Date | string | null }, now = Date.now()): boolean {
  if (!product.isNew || !product.newArrivalAt) return false;
  const started = new Date(product.newArrivalAt).getTime();
  return Number.isFinite(started) && started <= now && now - started <= NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

export function isStylistEligible(product: { isActive?: number | boolean | null; availabilityStatus?: AvailabilityStatus | null; status?: string | null }, includePreorder = false): boolean {
  const active = product.isActive ?? 1;
  const availability = normaliseAvailabilityStatus(product.availabilityStatus, product.status);
  return Boolean(active) && (availability === "AVAILABLE" || (includePreorder && availability === "PREORDER"));
}
