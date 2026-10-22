import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("redeem retirement contract", () => {
  it("keeps historical tables intact but disables new redeem-code grants in favor of VIP accounts", () => {
    const routerSource = readFileSync(new URL("./routers/access.ts", import.meta.url), "utf8");
    expect(routerSource).toContain("redeem: protectedProcedure");
    expect(routerSource).toContain("REDEEM_DISABLED_USE_VIP_ACCOUNT");
  });

  it("keeps Release Control and code issuance behind the owner-or-admin procedure", () => {
    const adminSource = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(adminSource).toContain("releaseConfig: ownerProcedure");
    expect(adminSource).toContain("createRedeemCode: ownerProcedure");
  });
});
