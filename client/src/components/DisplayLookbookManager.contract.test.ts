import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const manager = readFileSync(new URL("./DisplayLookbookManager.tsx", import.meta.url), "utf8");
const display = readFileSync(new URL("../pages/StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("display AI lookbook UI", () => {
  it("exposes owner generation and approval controls", () => {
    expect(manager).toContain("trpc.displayLookbook.generateBatch.useMutation");
    expect(manager).toContain("count");
    expect(manager).toContain("generateBatch.useMutation");
    expect(manager).toContain("east_asian_female");
    expect(manager).toContain("western_female");
    expect(manager).toContain("동양 여성");
    expect(manager).toContain("서양 여성");
    expect(manager).toContain("여성 모델 선택");
    expect(manager).toContain("fitting_room_mirror");
    expect(manager).toContain("피팅룸 거울 셀카");
    expect(manager).toContain("generateOutfitBatch");
    expect(manager).toContain("상의 + 하의 (+ 외투)");
    expect(manager).toContain("원피스 (+ 외투)");
    expect(manager).toContain("compositionLabel");
    expect(manager).toContain("trpc.displayLookbook.approve.useMutation");
    expect(manager).toContain("trpc.displayLookbook.remove.useMutation");
    expect(manager).toContain("trpc.displayLookbook.progress.useQuery");
    expect(manager).toContain("progress?.percent");
    expect(manager).toContain("상의 + 하의");
    expect(manager).toContain("외투");
    expect(manager).toContain("원피스");
  });

  it("alternates the original product image with approved AI images in showroom mode", () => {
    expect(display).toContain("trpc.displayLookbook.approvedAll.useQuery");
    expect(display).toContain("showcaseSlidesFor");
    expect(display).toContain("AI LOOKBOOK");
    expect(display).toContain("showcaseSlide?.isAi");
    expect(display).toContain('type ShowcaseViewMode = "mixed" | "product" | "model"');
    expect(display).toContain("copy.productMode");
    expect(display).toContain("copy.modelMode");
    expect(display).toContain("showcaseViewMode === \"product\"");
  });
});
