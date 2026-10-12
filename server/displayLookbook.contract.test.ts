import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("./routers/displayLookbook.ts", import.meta.url), "utf8");
const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const imageHelper = readFileSync(new URL("./_core/imageGeneration.ts", import.meta.url), "utf8");

describe("store display AI lookbook", () => {
  it("stores ten product-scoped shots in a feature folder and gates display reads", () => {
    expect(schema).toContain('displayLookbookImages = mysqlTable("displayLookbookImages"');
    expect(schema).toContain('sceneType: mysqlEnum("sceneType"');
    expect(router).toContain("generateBatchInput");
    expect(router).toContain("max(10)");
    expect(router).toContain("requestedCount");
    expect(router).toContain("display-lookbook/products/${productId}/${batchId}");
    expect(router).toContain("approvedAll: storeDisplayProcedure");
    expect(router).toContain("generateBatch: ownerProcedure");
    expect(router).toContain("progress: ownerProcedure");
    expect(router).toContain('status: "generating"');
    expect(router).toContain("percent: Math.round");
    expect(router).toContain("await generateImage");
    expect(router).toContain("product.imageViews?.front?.studioCut");
  });

  it("keeps generated images pending until the owner approves them", () => {
    expect(router).toContain("isApproved: 0");
    expect(router).toContain("approve: ownerProcedure");
    expect(router).toContain("revoke: ownerProcedure");
    expect(router).toContain("remove: ownerProcedure");
    expect(router).toContain("isActive: 0, isApproved: 0");
  });

  it("supports a feature-specific storage key without changing existing callers", () => {
    expect(imageHelper).toContain("storageKey?: string");
    expect(imageHelper).toContain("options.storageKey ?? `generated/${Date.now()}.png`");
    expect(imageHelper).toContain("key,");
  });

  it("supports random outfit plans and preserves separate garment references", () => {
    expect(schema).toContain('compositionProductIds: json("compositionProductIds")');
    expect(schema).toContain('compositionLabel: varchar("compositionLabel"');
    expect(router).toContain("randomOutfitPlan");
    expect(router).toContain("generateOutfitBatch");
    expect(router).toContain("makeOutfitPlan");
    expect(router).toContain("originalImages: sources.map");
    expect(router).toContain("Do not substitute, merge, redesign, recolor, or invent any garment.");
    expect(router).toContain("display-lookbook/outfits/${batchId}");
  });

  it("uses the shared Dongdaemun employee profile and a 100-situation prompt library", () => {
    expect(router).toContain("dongdaemunActions");
    expect(router).toContain("dongdaemunSettings");
    expect(router).toContain("actionIndex * 10 + settingIndex + 1");
    expect(router).toContain('z.enum(["short", "medium", "long"])');
    expect(router).toContain("fixed height 165 cm");
    expect(router).toContain("black hair");
    expect(router).toContain("a natural body shape and proportions that suit the supplied clothing");
    expect(router).toContain("randomItem(selectedScenes)");
    expect(router).toContain("modelProfile: modelProfileInput");
  });
});
