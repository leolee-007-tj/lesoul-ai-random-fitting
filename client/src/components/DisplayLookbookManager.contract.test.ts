import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const manager = readFileSync(new URL("./DisplayLookbookManager.tsx", import.meta.url), "utf8");
const display = readFileSync(new URL("../pages/StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("display AI lookbook UI", () => {
  it("exposes owner generation and approval controls", () => {
    expect(manager).toContain("trpc.displayLookbook.generateBatch.useMutation");
    expect(manager).toContain("Generate 10");
    expect(manager).toContain("trpc.displayLookbook.approve.useMutation");
    expect(manager).toContain("trpc.displayLookbook.remove.useMutation");
  });

  it("alternates the original product image with approved AI images in showroom mode", () => {
    expect(display).toContain("trpc.displayLookbook.approvedAll.useQuery");
    expect(display).toContain("showcaseSlidesFor");
    expect(display).toContain("AI LOOKBOOK");
    expect(display).toContain("showcaseSlide?.isAi");
  });
});
