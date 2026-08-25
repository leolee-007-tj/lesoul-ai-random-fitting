import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Login.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("login navigation", () => {
  it("offers credential-free normal entry and restores the visitor scope", () => {
    expect(source).toContain("trpc.auth.guestLogin.useMutation()");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).toContain("t(\"auth.guestSubmit\")");
    expect(source).toContain("auth.normalTab");
  });

  it("keeps only the administrator credential form", () => {
    expect(source).toContain("trpc.auth.adminLogin.useMutation()");
    expect(source).toContain("submitAdmin");
    expect(source).toContain("auth.adminTab");
    expect(source).not.toContain("auth.vipTab");
    expect(source).not.toContain("trialLogin");
    expect(router).toContain("adminLogin:");
  });

  it("navigates immediately after the server confirms login", () => {
    expect(source).toContain("void utils.auth.testSession.invalidate().catch(() => undefined);");
    expect(source).toContain("void utils.auth.me.invalidate().catch(() => undefined);");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).not.toContain("await utils.auth.testSession.invalidate();");
    expect(source).not.toContain("await utils.auth.me.invalidate();");
  });
});
