import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("global touch scrolling contract", () => {
  it("uses page-level vertical scrolling instead of trapping content in an inner scroller", () => {
    expect(css).toContain(".lesoul-mobile-screen { min-height: 100vh; min-height: 100dvh; display: block");
    expect(css).toContain(".lesoul-mobile-content { width: 100%; min-height: 0; overflow: visible");
    expect(css).toContain("html, body { min-height: 100%; overflow-y: auto");
  });

  it("keeps display rows directly draggable horizontally", () => {
    expect(css).toContain(".lesoul-display-row");
    expect(css).toContain("overflow-x: auto");
    expect(css).toContain("touch-action: pan-x");
    expect(css).toContain("scroll-snap-type: none");
  });
});
