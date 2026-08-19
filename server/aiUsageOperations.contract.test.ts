import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("Central AI Access/Usage Controller contract", () => {
  it("keeps image-generation policy, quota, budget, and access blocks in one server-side controller", () => {
    const controller = source("./aiUsageController.ts");
    expect(controller).toContain("export async function evaluateAiAccess");
    expect(controller).toContain("monthlyAiBudgetFen");
    expect(controller).toContain("aiAccessBlocks");
    expect(controller).toContain("normalAiGenerationLimit");
    expect(controller).toContain("beginAiUsage");
    expect(controller).toContain("finishAiUsage");
  });

  it("keeps ADMIN, VIP, and NORMAL feature permissions and style-match allowance inside the central controller", () => {
    const controller = source("./aiUsageController.ts");
    const schema = source("../drizzle/schema.ts");
    expect(controller).toContain("ROLE_AI_PERMISSIONS");
    expect(controller).toContain('ADMIN: { quickAI: true, liyingAI: true, styleMatch: true');
    expect(controller).toContain('VIP: { quickAI: false, liyingAI: true, styleMatch: true');
    expect(controller).toContain('NORMAL: { quickAI: false, liyingAI: false, styleMatch: true');
    expect(controller).toContain("normalStyleMatchLimit");
    expect(schema).toContain('"LIYING_AI"');
    expect(schema).toContain("quickAiAdminOnly");
    expect(schema).toContain("liyingAiVipEnabled");
  });

  it("records real image provider lifecycle in Look and Body Model routes without UI-side allowance consumption", () => {
    const look = source("./routers/look.ts");
    const bodyModel = source("./routers/bodyModel.ts");
    expect(look).toContain("beginAiUsage");
    expect(look).toContain("finishAiUsage");
    expect(look).not.toContain("consumeRedeemAllowance(");
    expect(bodyModel).toContain('feature: "AI_BODY_MODEL"');
    expect(bodyModel).toContain("finishAiUsage");
  });

  it("records rule-only Stylist lifecycle events in the central controller and protects operations by owner procedure", () => {
    const stylist = source("./routers/stylist.ts");
    const operations = source("./routers/operations.ts");
    expect(stylist).toContain('feature: "AI_STYLIST"');
    expect(stylist).toContain("beginAiUsage");
    expect(stylist).toContain("finishAiUsage");
    expect(operations).toContain("ownerProcedure");
    expect(operations).toContain("estimatedCostsAreConfigOnly");
    expect(operations).toContain("setUserAccess");
  });
});
