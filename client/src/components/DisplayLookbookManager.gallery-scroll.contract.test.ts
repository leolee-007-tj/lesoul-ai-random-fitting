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

  it("keeps vertical page scrolling natural while allowing horizontal product rows", () => {
    expect(css).toContain("html, body, #root { touch-action: pan-y;");
    expect(css).toContain(".lesoul-mobile-content { touch-action: pan-y;");
    expect(css).toContain(".lesoul-display-row");
    expect(css).toContain("overflow-y: visible;");
    expect(css).toContain("touch-action: auto;");
    expect(css).toContain("scroll-snap-type: x proximity;");
  });
});
