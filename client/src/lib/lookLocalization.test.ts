import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { getLocalizedBackground, getLocalizedStyle, resolveBackgroundKey, resolveStyleKey } from "./lookLocalization";

describe("saved look localization resolver", () => {
  it("maps legacy background text from every supported language to one stable key", () => {
    expect(resolveBackgroundKey("파리 카페")).toBe("paris");
    expect(resolveBackgroundKey("Paris Cafe")).toBe("paris");
    expect(resolveBackgroundKey("巴黎咖啡馆")).toBe("paris");
  });

  it("renders a stored background and style in the active language without changing stored keys", async () => {
    await i18n.changeLanguage("ko");
    expect(getLocalizedBackground(i18n.t, "巴黎咖啡馆").name).toBe("파리 카페");
    expect(getLocalizedStyle(i18n.t, "静奢").label).toBe("콰이어트 럭셔리");

    await i18n.changeLanguage("zh");
    expect(getLocalizedBackground(i18n.t, "Paris Cafe", "paris").name).toBe("巴黎咖啡馆");
    expect(getLocalizedStyle(i18n.t, "QUIET LUXURY", "QUIET_LUXURY").label).toBe("静奢");

    await i18n.changeLanguage("en");
    expect(getLocalizedBackground(i18n.t, "파리 카페").description).toContain("European cafe");
    expect(resolveStyleKey("콰이어트 럭셔리")).toBe("QUIET_LUXURY");
  });

  it("keeps unmatched legacy text visible instead of discarding it", () => {
    expect(getLocalizedBackground(i18n.t, "Legacy private scene")).toMatchObject({ key: null, name: "Legacy private scene", description: "" });
  });
});
