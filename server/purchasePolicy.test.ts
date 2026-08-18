import { describe, expect, it } from "vitest";
import { getPurchaseAvailability } from "../shared/purchasePolicy";

describe("product payment QR availability", () => {
  it("uses the exact product state to protect new BUY actions", () => {
    expect(getPurchaseAvailability({ exists: false, enabled: true })).toBe("not_found");
    expect(getPurchaseAvailability({ exists: true, enabled: false, status: "in_stock", purchaseQrUrl: "qr" })).toBe("feature_off");
    expect(getPurchaseAvailability({ exists: true, enabled: true, status: "sold_out", purchaseQrUrl: "qr" })).toBe("sold_out");
    expect(getPurchaseAvailability({ exists: true, enabled: true, status: "in_stock", purchaseQrUrl: null })).toBe("consult");
    expect(getPurchaseAvailability({ exists: true, enabled: true, status: "in_stock", purchaseQrUrl: "https://example.test/qr.png" })).toBe("available");
  });
});
