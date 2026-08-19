import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import { commerceResources } from "./commerceResources";
import i18n from "./index";

const requiredKeys = [
  "nav.create", "home.headline", "studio.uploadTitle", "studio.random", "studio.select", "history.title",
  "products.title", "products.fabric", "products.csv", "result.adjustTitle", "result.regenerate", "result.shop", "result.share",
];

function readPath(source: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => (current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined), source);
}

describe("LESOUL v2 locale resources", () => {
  it("contains required global, product, and result labels in every supported language", () => {
    for (const locale of [en, ko, zh]) {
      for (const key of requiredKeys) expect(readPath(locale, key)).toEqual(expect.any(String));
    }
  });

  it("keeps product availability, NEW, purchase, and Style Match copy complete in every supported language", () => {
    const commerceKeys = [
      "product.status.inStock", "product.status.preOrder", "product.status.soldOut", "product.status.unpublished",
      "product.newArrival", "product.addToPurchaseList", "product.reserve", "product.soldOutNotice",
      "home.newArrivals", "stylist.recommendation", "stylist.chooseAnchor", "common.loading", "common.retry",
      "auth.eyebrow", "auth.title", "auth.body", "auth.username", "auth.password", "auth.submit", "auth.invalid", "auth.unavailable", "auth.note", "auth.admin",
    ];
    for (const locale of [commerceResources.en, commerceResources.ko, commerceResources.zh]) {
      for (const key of commerceKeys) expect(readPath(locale, key)).toEqual(expect.any(String));
    }
  });

  it("switches status and purchase copy immediately with the global language setting", async () => {
    await i18n.changeLanguage("ko");
    expect(i18n.t("product.status.inStock")).toBe("바로 구매");
    expect(i18n.t("product.reserve")).toBe("예약 신청");
    await i18n.changeLanguage("zh");
    expect(i18n.t("product.status.preOrder")).toBe("预售");
    expect(i18n.t("stylist.recommendation")).toBe("AI 搭配推荐");
    expect(i18n.t("auth.submit")).toBe("继续");
    await i18n.changeLanguage("en");
  });
});
