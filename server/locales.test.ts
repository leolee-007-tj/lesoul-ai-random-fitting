import { describe, expect, it } from "vitest";
import en from "../client/src/i18n/locales/en.json";
import ko from "../client/src/i18n/locales/ko.json";
import zh from "../client/src/i18n/locales/zh.json";

const requiredKeys = [
  "nav.create", "home.headline", "studio.uploadTitle", "studio.random", "studio.select", "history.title",
  "products.title", "products.fabric", "products.csv", "result.adjustTitle", "result.regenerate", "result.shop", "result.share",
  "poseCatalog.handPocket.title", "poseCatalog.handPocket.description", "poseCatalog.side.title", "poseCatalog.front.title", "poseCatalog.walking.title", "poseCatalog.crossedArms.title", "poseCatalog.seated.title",
  "backgroundCatalog.seoulCafe", "backgroundCatalog.studio", "catalogUi.testModel", "catalogUi.startTest", "catalogUi.choosePose", "productManager.primaryImage", "productManager.priceCny", "productManager.mainReference",
];

function readPath(source: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => (current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined), source);
}

describe("LESOUL v2 locale resources", () => {
  it("contains required global, product, and result labels in every supported language", () => {
    for (const locale of [en, ko, zh]) for (const key of requiredKeys) expect(readPath(locale, key)).toEqual(expect.any(String));
  });
});
