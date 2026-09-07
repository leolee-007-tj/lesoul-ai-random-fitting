import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inquiryBodyForLanguage, inquiryLabelForLanguage, isPriceVisibleToRole } from "./StoreInquiryQr";

describe("store inquiry pricing visibility", () => {
  it("shows prices only to VIP and administrator roles", () => {
    expect(isPriceVisibleToRole("vip")).toBe(true);
    expect(isPriceVisibleToRole("admin")).toBe(true);
    expect(isPriceVisibleToRole("user")).toBe(false);
    expect(isPriceVisibleToRole("store_display")).toBe(false);
  });

  it("keeps inquiry labels localized", () => {
    expect(inquiryLabelForLanguage("ko")).toBe("매장문의");
    expect(inquiryLabelForLanguage("zh")).toBe("店铺咨询");
    expect(inquiryBodyForLanguage("en")).toContain("WeChat");
  });

  it("uses the public purchase configuration for the shared QR", () => {
    const source = readFileSync(new URL("./StoreInquiryQr.tsx", import.meta.url), "utf8");
    expect(source).toContain("adminTrialPaymentQrUrl");
    expect(source).toContain("data-store-inquiry-qr");
  });
});
