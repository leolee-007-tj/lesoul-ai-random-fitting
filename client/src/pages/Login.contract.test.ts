import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Login.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("login navigation", () => {
  it("offers credential-free normal entry and restores the visitor scope", () => {
    expect(source).toContain("trpc.auth.guestLogin.useMutation()");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).toContain("t(\"auth.guestSubmit\")");
    expect(source).not.toContain("auth.adminTab");
  });

  it("routes owner administration through Google/Manus OAuth", () => {
    expect(source).toContain("startLogin(next)");
    expect(source).toContain("t(\"auth.ownerSubmit\")");
    expect(router).toContain("guestLogin:");
    expect(router).toContain('reason: \"owner_oauth_only\"');
  });

  it("navigates immediately after the server confirms login", () => {
    expect(source).toContain("void utils.auth.testSession.invalidate().catch(() => undefined);");
    expect(source).toContain("void utils.auth.me.invalidate().catch(() => undefined);");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).not.toContain("await utils.auth.testSession.invalidate();");
    expect(source).not.toContain("await utils.auth.me.invalidate();");
  });
});
