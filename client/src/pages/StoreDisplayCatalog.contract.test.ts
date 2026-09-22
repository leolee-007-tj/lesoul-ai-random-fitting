import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const display = readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("store display catalog redesign", () => {
  it("keeps category filtering and adds brand search", () => {
    expect(display).toContain("trpc.catalog.storeDisplayProducts.useQuery()");
    expect(display).toContain("trpc.catalog.productCategories.useQuery");
    expect(display).toContain("managedCategories.data");
    expect(display).toContain("displayCategory?.id");
    expect(display).toContain("product.brand");
    expect(display).toContain("brandPlaceholder");
    expect(display).toContain("aria-pressed={category === String(item.id)}");
  });

  it("uses horizontal swipe cards and shuffles the display order", () => {
    expect(display).toContain("shuffleWithinNewArrivalGroups");
    expect(display).toContain("newArrivalProducts");
    expect(display).toContain("currentProducts");
    expect(display).toContain("copy.newArrivals");
    expect(display).toContain("copy.currentProducts");
    expect(display).toContain("lesoul-display-row");
    expect(display).toContain("overflow-x-auto");
    expect(display).toContain("shrink-0 snap-start");
  });

  it("shows each group position and progress while marking the nearest card active", () => {
    expect(display).toContain("activeIndex");
    expect(display).toContain("copy.position");
    expect(display).toContain("aria-live=\"polite\"");
    expect(display).toContain("style={{ width: `${progress}%` }}");
    expect(display).toContain('data-active={index === activeIndex ? "true" : "false"}');
    expect(display).toContain("setActiveIndex(index); setSelectedIndex");
    expect(display).toContain("requestAnimationFrame");
    expect(display).toContain("lesoul-display-card");
  });

  it("enlarges the selected card and reveals its price after a tap", () => {
    expect(display).toContain('data-selected={selectedIndex === index ? "true" : "false"}');
    expect(display).toContain("scale-[1.025]");
    expect(display).toContain("revealPrice={selectedIndex === index}");
    expect(display).toContain("tapToReveal");
  });
  it("shows a pre-tap price hint with a gentle reduced-motion-aware animation", () => {
    expect(display).toContain("tapBeforeReveal");
    expect(display).toContain("터치하여 가격 확인");
    expect(display).toContain("aria-live=\"polite\"");
    expect(display).toContain("motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]");
    expect(display).toContain("transition-opacity duration-300");
  });

  it("exposes session-only camera capture without the old visitor-detection controls", () => {
    expect(display).toContain("getUserMedia");
    expect(display).toContain("cameraStreamRef");
    expect(display).toContain("setCapturedPhoto");
    expect(display).not.toContain("runPreflight");
    expect(display).not.toContain("START DETECTION");
  });
});
