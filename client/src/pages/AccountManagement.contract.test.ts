import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("unified owner account management", () => {
  it("keeps NORMAL, VIP, and STORE TRIAL controls in separate owner-only sections while reserving ADMIN for the owner", () => {
    const page = source("client/src/pages/AccountManagement.tsx");
    expect(page).toContain('type AccountTab = "overview" | "normal" | "vip" | "trial"');
    expect(page).toContain("trpc.operations.ownerStatus.useQuery()");
    expect(page).toContain("VipAccountManager");
    expect(page).toContain("TrialStoreManager");
    expect(page).not.toContain("AdminAccountManager");
  });

  it("offers the new tab through an ADMIN route and navigation entry", () => {
    const app = source("client/src/App.tsx");
    const nav = source("client/src/components/MobileBottomNav.tsx");
    expect(app).toContain('path={"/account-management"}');
    expect(app).toContain("<AdminGate><AccountManagement /></AdminGate>");
    expect(nav).toContain('href: "/account-management"');
  });

  it("does not duplicate related managers inside the VIP-only section", () => {
    const manager = source("client/src/components/VipAccountManager.tsx");
    expect(manager).toContain("includeRelatedManagers = true");
    expect(manager).toContain("includeRelatedManagers && <><AiProviderPanel /><ProductShareAnalyticsPanel /></>");
  });

  it("uses friendly display names instead of visitor, VIP, and trial technical identifiers", () => {
    const page = source("client/src/pages/AccountManagement.tsx");
    const operations = source("server/routers/operations.ts");
    const vip = source("client/src/components/VipAccountManager.tsx");
    const trial = source("client/src/components/TrialStoreManager.tsx");
    expect(page).toContain("visitor.displayName || visitor.user?.name");
    expect(page).not.toContain("visitor.nickname || visitor.visitorId");
    expect(operations).toContain("displayName: anonymousNickname(visitorId, input.locale)");
    expect(vip).toContain('account.displayName || account.user.name || t("vipAdmin.title")');
    expect(trial).toContain("store.displayName || copy.operator");
    expect(trial).not.toContain("store.username} · {store.displayName");
  });
});
