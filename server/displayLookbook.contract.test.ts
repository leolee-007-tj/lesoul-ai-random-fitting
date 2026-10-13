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

  it("automatically saves guest previews as public lookbooks without a second approval", () => {
    expect(router).toContain('guestPreview: customerProcedure');
    expect(router).toContain('GUEST_PREVIEW_${input.productId}_${crypto.randomUUID()}');
    expect(router).toContain('isApproved: 1, isActive: 1');
    expect(router).toContain('savedPublicly: true');
    expect(router).toContain('publicForProduct: publicProcedure');
  });
  it("keeps administrator-generated images pending until the owner approves them", () => {
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

  it("coordinates missing garments by light or dark color and catalog cues", () => {
    expect(router).toContain("function colorTone");
    expect(router).toContain("missingGarmentColorDirection");
    expect(router).toContain("normaliseAvailabilityStatus");
    expect(router).toContain('PRODUCT_SOLD_OUT');
    expect(router).toContain("completeOutfitWithCatalog");
    expect(router).toContain("COMPLETE THE PARTIAL OUTFIT");
    expect(router).toContain("Never alter, recolor, replace, or remove any user-selected garment");
    expect(router).toContain("The supplied top is light-toned");
    expect(router).toContain("The supplied top is dark-toned");
    expect(router).toContain("light-wash blue denim");
    expect(router).toContain("COLOR COORDINATION FOR SINGLE-GARMENT STYLING");
    expect(router).toContain("Registered complementary color cues available in this catalog");
    expect(router).toContain("catalog.products)");
  });
  it("uses 100 Western magazine studio poses with no store setting", () => {
    expect(router).toContain("const editorialPosePrompts = [");
    expect(router).toContain(' + (index + 1) + " of 100"');
    expect(router).toContain("pure white seamless cyclorama");
    expect(router).toContain("light gray seamless studio backdrop");
    expect(router).toContain("adult Western woman");
    expect(router).toContain("adult East Asian woman");
    expect(router).toContain("presentationStyleInput = z.enum([\"east_asian_female\", \"western_female\"])");
    expect(router).toContain('backgroundStyleInput = z.enum(["editorial_studio", "fitting_room_mirror"])');
    expect(router).toContain("fitting-room mirror selfie background");
    expect(router).toContain("full-length mirror reflection");
    expect(router).toContain("Use only a clean white, light-gray, or soft neutral studio background");
    expect(router).toContain("never use a shop, boutique, street, checkout, rack, or workplace setting");
    expect(router).not.toContain("dongdaemunActions");
    expect(router).not.toContain("dongdaemunSettings");
    expect(router).not.toContain("Dongdaemun boutique employee");
    expect(router).not.toContain("a few customers browsing");
    expect(router).toContain('z.enum(["short", "medium", "long"])');
    expect(router).toContain("black hair");
    expect(router).toContain("natural feminine body shape and proportions that suit the supplied clothing");
    expect(router).toContain("selectLookbookScene");
    expect(router).toContain("scene ?? editorialScenePrompts[0]");
    expect(router).toContain("LOOKBOOK_SCENE_UNAVAILABLE");
    expect(router).toContain("editorialScenePrompts");
    expect(router).toContain("modelProfile: modelProfileInput");
  });
});
