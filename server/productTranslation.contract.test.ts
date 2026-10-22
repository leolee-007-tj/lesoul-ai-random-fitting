import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
const manager = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");

describe("product localization coverage", () => {
  it("translates product content during create and update without blocking the save fallback", () => {
    expect(router).toContain("translateProductFields(input.name, input.description)");
    expect(router).toContain("translateProductFields(updates.name ?? existing.name");
    expect(router).toContain("nameEn");
    expect(router).toContain("descriptionZh");
  });

  it("provides an owner action to complete missing translations for existing products", () => {
    expect(router).toContain("backfillProductTranslations");
    expect(manager).toContain("backfillTranslations");
    expect(manager).toContain("Complete product translations");
    expect(manager).toContain("기존 상품 번역 보완");
  });
});
