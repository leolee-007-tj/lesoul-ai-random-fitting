import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("./routers/stylist.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../client/src/pages/StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("display customer profile recommendations", () => {
  it("accepts optional body measurements, usual size, and free-form intent", () => {
    expect(router).toContain("displayRecommend");
    expect(router).toContain("height: z.number");
    expect(router).toContain("weight: z.number");
    expect(router).toContain("usualSize: z.string");
    expect(router).toContain("intentText: z.string");
    expect(router).toContain("detailText: z.string");
  });

  it("interprets natural language into catalog filters", () => {
    expect(router).toContain("understandDisplayIntent");
    expect(router).toContain("categoryFocus");
    expect(router).toContain("wantsOuter");
    expect(router).toContain("invokeLLM");
  });

  it("uses the photo only for a coarse temporary color hint", () => {
    expect(router).toContain("analyseDisplaySkinTone");
    expect(router).toContain("skinTone");
    expect(router).toContain("Do not identify the person");
    expect(router).toContain("photoDataUrl");
    expect(router).toContain("input.detailText");
  });

  it("uses stored garment measurements for optional size guidance", () => {
    expect(router).toContain("recommendSize(product, measurements)");
    expect(router).toContain("inventoryQuantity");
    expect(page).toContain("고객 맞춤 입력 (선택)");
    expect(page).toContain("원하는 느낌·장소·목적");
  });
});
