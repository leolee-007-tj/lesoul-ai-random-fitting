import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("any-language administrator translation contract", () => {
  it("detects an EN, KO, or ZH source and saves all customer locales", () => {
    const admin = source("./routers/admin.ts");
    expect(admin).toContain("translateCustomerText");
    expect(admin).toContain('sourceLanguage: { type: "string", enum: ["en", "ko", "zh"] }');
    expect(admin).toContain("Preserve the original source exactly");
    expect(admin).toContain('context: z.enum(["product", "outfit", "category", "purchase_notice"])');
  });

  it("connects every administrator customer-copy form to the shared detected-language procedure", () => {
    const product = source("../client/src/pages/ProductManagerV2.tsx");
    const outfit = source("../client/src/pages/OutfitManager.tsx");
    const category = source("../client/src/components/CategoryManagementPanel.tsx");
    const notice = source("../client/src/pages/PurchaseNoticeManager.tsx");
    for (const file of [product, outfit, category, notice]) expect(file).toContain("trpc.admin.translateCustomerText.useMutation()");
    expect(product).not.toContain("const sourceLanguage: SourceLanguage = \"ko\"");
    expect(outfit).toContain('context: "outfit"');
    expect(category).toContain('context: "category"');
    expect(notice).toContain('context: "purchase_notice"');
  });
});
