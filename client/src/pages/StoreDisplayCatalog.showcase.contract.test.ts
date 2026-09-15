import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("Store Display showroom mode", () => {
  it("enters after one minute of inactivity and exits on user activity", () => {
    expect(source).toContain("}, 60_000);");
    expect(source).toContain('"pointerdown", "pointermove", "touchstart", "keydown", "wheel", "scroll"');
    expect(source).toContain("updateShowcaseMode(false)");
  });

  it("cycles new arrivals before current products without mixing groups", () => {
    expect(source).toContain('showcaseGroup === "new" ? newArrivalProducts : currentProducts');
    expect(source).toContain('showcaseGroup === "new" && currentProducts.length');
    expect(source).toContain("}, 8_000);");
  });

  it("provides an in-app presentation view and gesture-gated browser fullscreen action", () => {
    expect(source).toContain('role="dialog"');
    expect(source).toContain("requestBrowserFullscreen");
    expect(source).toContain("onPointerDown={exitShowcase}");
  });
});
