import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("administrator trial access contract", () => {
  it("enforces expiry in administrator procedures without altering customer procedures", () => {
    const trpc = source("./_core/trpc.ts");
    expect(trpc).toContain('message: "ADMIN_TRIAL_EXPIRED"');
    expect(trpc).toContain("export const customerProcedure");
    expect(trpc).toContain("export const adminProcedure");
    expect(trpc).toContain("await ensureActiveAdministratorTrial(ctx.user)");
    expect(trpc).toContain("if (isPrimaryOperator(user)) return;");
  });

  it("keeps an expiry-status route and payment dialog available to an expired administrator", () => {
    const router = source("./routers/adminTrial.ts");
    expect(router).toContain("status: protectedProcedure.query");
    expect(router).toContain("getAdminTrialStatus(ctx.user.id, true)");
    const gate = source("../client/src/components/AdminGate.tsx");
    expect(gate).toContain("trpc.adminTrial.status.useQuery");
    expect(gate).toContain('trial.data?.status === "expired"');
    const dialog = source("../client/src/components/AdminTrialExpiredDialog.tsx");
    expect(dialog).toContain("paymentQrUrl");
    expect(dialog).toContain("trial.paymentNoticeKo");
    expect(dialog).toContain("usageGuideQrUrl");
    const trial = source("./adminTrial.ts");
    expect(trial).toContain("where(eq(users.id, userId))");
    expect(trial).toContain("adminTrialStartedAt: users.adminTrialStartedAt");
    expect(trial).toContain("account.adminTrialDurationHours || 48");
  });
});
