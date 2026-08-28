import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (url: URL) => readFileSync(url, "utf8");

describe("mobile customer navigation", () => {
  it("keeps a five-item customer navigation with a VIP early-access destination", () => {
    const nav = read(new URL("./MobileBottomNav.tsx", import.meta.url));
    expect(nav).toContain('href: "/catalog", label: copy.products');
    expect(nav).toContain('href: "/vip-early-access", label: copy.vip');
    expect(nav).toContain('href: "/style-match", label: copy.style');
    expect(nav).toContain('href: "/purchase-list", label: copy.purchase');
    expect(nav).toContain('vip: "VIP 선공개"');
  });

  it("uses the bottom navigation rather than a duplicate floating purchase-list shortcut", () => {
    const screen = read(new URL("./MobileScreen.tsx", import.meta.url));
    expect(screen).toContain('<MobileBottomNav />');
    expect(screen).not.toContain("PurchaseListFab");
  });
});
