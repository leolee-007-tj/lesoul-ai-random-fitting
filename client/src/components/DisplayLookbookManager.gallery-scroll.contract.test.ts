import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const manager = readFileSync(new URL("./DisplayLookbookManager.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers/displayLookbook.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("display lookbook gallery and touch scroll", () => {
  it("offers a single gallery view for all generated outfit images", () => {
    expect(router).toContain("adminListAll");
    expect(manager).toContain("galleryScope");
    expect(manager).toContain("allImagesQuery");
    expect(manager).toContain("전체 코디 한눈에");
    expect(manager).toContain("visibleRows.map");
  });

  it("keeps cart model controls and removes the random outfit generator", () => {
    expect(manager).toContain("setCartHairLength(length)");
    expect(manager).not.toContain("setRandomHairLength(length)");
    expect(manager).toContain("단발머리");
    expect(manager).toContain("중간 길이");
    expect(manager).toContain("긴 머리");
    expect(manager).not.toContain("randomOutfitPlan");
    expect(manager).toContain("refetchInterval: 3000");
    expect(manager).toContain("filteredProducts.map");
    expect(manager).not.toContain("slice(0, 60)");
    expect(manager).not.toContain("동양인 여성 · 키 165cm · 검정 머리");
  });

  it("keeps vertical page scrolling natural while allowing horizontal product rows", () => {
    expect(css).toContain("html, body, #root { touch-action: pan-y;");
    expect(css).toContain(".lesoul-mobile-content { touch-action: pan-y;");
    expect(css).toContain(".lesoul-display-row");
    expect(css).toContain("overflow-y: visible;");
    expect(css).toContain("touch-action: auto;");
    expect(css).toContain("scroll-snap-type: x proximity;");
  });
});
