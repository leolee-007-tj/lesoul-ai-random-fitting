import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = () => readFileSync(new URL("./SaleAnnouncement.tsx", import.meta.url), "utf8");

describe("sale announcement", () => {
  it("uses the public purchase config and only opens when central sale is enabled", () => {
    const source = read();
    expect(source).toContain("trpc.purchase.config.useQuery");
    expect(source).toContain("config.data?.centralSaleEnabled");
    expect(source).toContain("pricingMode");
  });

  it("provides an accessible close control and localized sale copy", () => {
    const source = read();
    expect(source).toContain('role="dialog"');
    expect(source).toContain("aria-label={copy.close}");
    expect(source).toContain("setOpen(false)");
    expect(source).toContain("LESOUL SPECIAL SALE");
    expect(source).toContain("현재 세일이 진행 중입니다");
    expect(source).toContain("当前正在进行促销");
  });
});
