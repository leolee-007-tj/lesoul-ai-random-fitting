export type AvailabilityStatus = "IN_STOCK" | "PRE_ORDER" | "SOLD_OUT";

export function normaliseAvailabilityStatus(value: unknown, legacyStatus?: string | null): AvailabilityStatus {
  if (value === "IN_STOCK" || value === "PRE_ORDER" || value === "SOLD_OUT") return value;
  if (value === "AVAILABLE") return "IN_STOCK";
  if (value === "PREORDER") return "PRE_ORDER";
  return legacyStatus === "sold_out" ? "SOLD_OUT" : "IN_STOCK";
}

export function legacyStatusForAvailability(status: AvailabilityStatus): "in_stock" | "sold_out" {
  return status === "SOLD_OUT" ? "sold_out" : "in_stock";
}

/** NEW is an explicit merchandising decision, never a registration-date calculation. */
export function isNewArrival(product: { isNew?: number | boolean | null }): boolean {
  return Boolean(product.isNew);
}

export function isStylistEligible(product: { isActive?: number | boolean | null; availabilityStatus?: AvailabilityStatus | null; status?: string | null; inventoryQuantity?: number | null }, includePreorder = false): boolean {
  const active = product.isActive ?? 1;
  const availability = normaliseAvailabilityStatus(product.availabilityStatus, product.status);
  return Boolean(active) && (product.inventoryQuantity == null || product.inventoryQuantity > 0) && (availability === "IN_STOCK" || (includePreorder && availability === "PRE_ORDER"));
}

export type CatalogAvailabilityView = "available" | "sold_out";
export function filterCatalogAvailability<T extends { isActive?: number | boolean | null; availabilityStatus?: unknown; status?: string | null }>(products: T[], view: CatalogAvailabilityView): T[] {
  return products.filter(product => product.isActive !== 0 && product.isActive !== false &&
    (normaliseAvailabilityStatus(product.availabilityStatus, product.status) === "SOLD_OUT") === (view === "sold_out"));
}
