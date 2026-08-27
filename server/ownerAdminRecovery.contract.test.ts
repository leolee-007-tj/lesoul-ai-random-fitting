import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const sdk = readFileSync(new URL("./_core/sdk.ts", import.meta.url), "utf8");
const trpc = readFileSync(new URL("./_core/trpc.ts", import.meta.url), "utf8");
const routers = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const gate = readFileSync(new URL("../client/src/components/AdminGate.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../client/src/components/AppHeader.tsx", import.meta.url), "utf8");
const mobileBottomNav = readFileSync(new URL("../client/src/components/MobileBottomNav.tsx", import.meta.url), "utf8");

describe("configured owner administration recovery", () => {
  it("promotes only the configured owner and removes stale primary-admin flags", () => {
    expect(db).toContain("export function resolveOAuthUserRole(");
    expect(db).toContain("const identity = resolveOAuthUserRole(user.openId, existing, user.role);");
    expect(db).toContain('role: isPrimaryOwner ? "admin" as const : (existing?.role ?? requestedRole ?? "user")');
    expect(db).toContain("set({ isPrimaryAdmin: 0 }).where(ne(users.openId, user.openId))");
    expect(db).toContain("isPrimaryAdmin: 1, isActive: 1");
  });

  it("returns the refreshed database role in the same OAuth-authenticated request", () => {
    expect(sdk).toContain("return (await db.getUserByOpenId(user.openId)) ?? user");
    expect(routers).toContain('role: isPrimaryOperator(user) ? "admin" : user.role');
  });

  it("never applies a password-admin trial expiry to the configured owner", () => {
    expect(trpc).toContain("if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) return");
    expect(trpc).toContain("!isPrimaryOperator(ctx.user)");
    expect(routers).toContain('where(eq(users.isPrimaryAdmin, 1))');
  });

  it("allows an already-verified owner through the client administrator gate", () => {
    expect(gate).toContain('const hasAdminAccess = user?.role === "admin" || isOwner');
    expect(gate).toContain("if (!hasAdminAccess) navigate(\"/\")");
    expect(header).toContain('const showAdminManage = user?.role === "admin" || ownerStatus.data?.isOwner === true;');
    expect(mobileBottomNav).toContain('const isAdmin = user?.role === "admin" || ownerStatus.data?.isOwner === true;');
  });
});
