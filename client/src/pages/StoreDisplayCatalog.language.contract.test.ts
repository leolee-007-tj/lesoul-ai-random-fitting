import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/StoreDisplayCatalog.tsx"), "utf8");

describe("Store Display language switcher", () => {
  it("uses the shared language switcher in the display header", () => {
    expect(source).toContain('import LanguageSwitcher from "@/components/LanguageSwitcher";');
    expect(source).toContain("<LanguageSwitcher />");
  });

  it("derives display copy and localized product names from the active locale", () => {
    expect(source).toContain('const locale: "ko" | "zh" | "en" = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";');
    expect(source).toContain("localizedProductName(product, i18n.language)");
    expect(source).toContain("copy.brandPlaceholder");
    expect(source).toContain("copy.newArrivals");
  });
});
