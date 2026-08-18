import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("account-bound redeem contract", () => {
  it("requires an authenticated account to redeem and binds entitlement to that account", () => {
    const routerSource = readFileSync(new URL("./routers/access.ts", import.meta.url), "utf8");
    expect(routerSource).toContain("redeem: protectedProcedure");
    expect(routerSource).toContain("account:${ctx.user.openId}");
  });

  it("keeps Release Control and code issuance behind the owner-or-admin procedure", () => {
    const adminSource = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(adminSource).toContain("releaseConfig: ownerProcedure");
    expect(adminSource).toContain("createRedeemCode: ownerProcedure");
  });
});
