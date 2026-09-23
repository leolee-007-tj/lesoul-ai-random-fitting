import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("non-generative operations contract", () => {
  it("retains historical access data without exposing new image-generation entry points", () => {
    const controller = source("./aiUsageController.ts");
    const look = source("./routers/look.ts");
    const bodyModel = source("./routers/bodyModel.ts");
    expect(controller).toContain("export async function evaluateAiAccess");
    expect(look).toContain("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
    expect(bodyModel).toContain("IMAGE_MODEL_RETIRED_USE_CURATED_LOOKS");
    expect(look).not.toContain("beginAiUsage");
    expect(bodyModel).not.toContain("beginAiUsage");
  });

  it("keeps administrator-curated outfits available while allowing AI display recommendations", () => {
    const stylist = source("./routers/stylist.ts");
    expect(stylist).toContain("getEligibleCuratedOutfits");
    expect(stylist).toContain("recommendCuratedTopLooks");
    expect(stylist).not.toContain("beginAiUsage");
    expect(stylist).not.toContain("finishAiUsage");
    expect(stylist).toContain("displayRecommend");
    expect(stylist).toContain("invokeLLM");
  });

  it("keeps account and catalog operations available without image-provider controls", () => {
    const dashboard = source("../client/src/pages/OperationsDashboard.tsx");
    expect(dashboard).toContain("OPERATIONS DASHBOARD");
    expect(dashboard).toContain("VipAccountManager");
    expect(dashboard).not.toContain("AI COST SETTINGS");
    expect(dashboard).not.toContain("updateSettings");
  });
});
