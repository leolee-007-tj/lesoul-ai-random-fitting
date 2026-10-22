import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("global touch scrolling contract", () => {
  it("uses page-level vertical scrolling instead of trapping content in an inner scroller", () => {
    expect(css).toContain(".lesoul-mobile-screen { min-height: 100vh; min-height: 100dvh; display: block");
    expect(css).toContain(".lesoul-mobile-content { touch-action: pan-y; width: 100%; min-height: 0; overflow: visible");
    expect(css).toContain("html, body, #root { touch-action: pan-y; width: 100%; min-height: 100%; min-height: 100dvh; margin: 0; padding: 0; overflow-x: hidden; overflow-y: auto");
    expect(css).toContain("#root { overflow: visible");
    expect(css).toContain("-webkit-overflow-scrolling: touch");
  });

  it("keeps display rows directly draggable horizontally", () => {
    expect(css).toContain(".lesoul-display-page");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain(".lesoul-display-row");
    expect(css).toContain("overflow-x: auto");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("scroll-snap-type: x proximity");
    expect(css).toContain("overscroll-behavior: auto");
    expect(css).toContain("user-select: none");
    expect(css).toContain(".lesoul-safe-modal");
    expect(css).toContain("touch-action: pan-y");
  });
});
