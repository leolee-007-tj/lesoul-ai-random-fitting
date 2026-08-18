export type PurchaseAvailability = "available" | "consult" | "sold_out" | "feature_off" | "not_found";

export function getPurchaseAvailability(input: { exists: boolean; enabled: boolean; status?: string | null; purchaseQrUrl?: string | null }): PurchaseAvailability {
  if (!input.exists) return "not_found";
  if (!input.enabled) return "feature_off";
  if (input.status !== "in_stock") return "sold_out";
  return input.purchaseQrUrl ? "available" : "consult";
}
