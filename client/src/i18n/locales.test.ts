import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";

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
});
