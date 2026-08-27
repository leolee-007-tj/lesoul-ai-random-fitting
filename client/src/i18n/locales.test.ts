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
      "auth.eyebrow", "auth.title", "auth.body", "auth.username", "auth.password", "auth.submit", "auth.invalid", "auth.unavailable", "auth.note", "auth.admin", "auth.normalTab", "auth.vipTab", "auth.trialTab", "auth.adminTab", "auth.normalBody", "auth.vipBody", "auth.trialBody", "auth.adminBody", "auth.vipSubmit", "auth.trialSubmit", "auth.adminSubmit", "auth.vipInvalid", "auth.vipInactive", "auth.trialInvalid", "auth.trialInactive", "auth.adminInvalid", "auth.adminInactive",
      "history.manage.select", "history.manage.cancel", "history.manage.delete", "history.manage.deleteSelected", "history.manage.deleteAll", "history.manage.selected", "history.manage.confirmSelected", "history.manage.confirmAll", "history.manage.empty",
      "look.backgrounds.paris.name", "look.backgrounds.paris.description", "look.backgrounds.studio.name", "look.backgrounds.studio.description", "look.styles.QUIET_LUXURY", "look.styles.MINIMAL",
      "vipAdmin.title", "vipAdmin.create", "vipAdmin.id", "vipAdmin.password", "vipAdmin.active", "vipAdmin.inactive", "vipAdmin.resetPassword", "vipAdmin.usage",
      "adminAccounts.title", "adminAccounts.create", "adminAccounts.id", "adminAccounts.password", "adminAccounts.active", "adminAccounts.inactive", "adminAccounts.resetPassword",
      "adminSetup.eyebrow", "adminSetup.title", "adminSetup.body", "adminSetup.code", "adminSetup.id", "adminSetup.password", "adminSetup.submit", "adminSetup.invalid", "adminSetup.used", "adminPassword.title", "adminPassword.body", "adminPassword.account", "adminPassword.primary", "adminPassword.active", "adminPassword.inactive", "adminPassword.username", "adminPassword.usernameHelp", "adminPassword.usernameInvalid", "adminPassword.newPassword", "adminPassword.confirmPassword", "adminPassword.mismatch", "adminPassword.save", "adminPassword.updated", "adminPassword.noAccount",
    ];
    for (const locale of [commerceResources.en, commerceResources.ko, commerceResources.zh]) {
      for (const key of commerceKeys) expect(readPath(locale, key)).toEqual(expect.any(String));
    }
  });

  it("switches status and purchase copy immediately with the global language setting", async () => {
    await i18n.changeLanguage("ko");
    expect(i18n.t("product.status.inStock")).toBe("구매 가능");
    expect(i18n.t("product.newArrival")).toBe("신상품");
    expect(i18n.t("product.reserve")).toBe("예약 신청");
    await i18n.changeLanguage("zh");
    expect(i18n.t("product.status.preOrder")).toBe("预售");
    expect(i18n.t("product.newArrival")).toBe("新品");
    expect(i18n.t("stylist.recommendation")).toBe("店主精选搭配");
    expect(i18n.t("auth.submit")).toBe("继续");
    expect(i18n.t("adminSetup.title")).toBe("创建首个管理员");
    await i18n.changeLanguage("en");
  });
});
