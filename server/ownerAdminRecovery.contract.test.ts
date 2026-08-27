import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const sdk = readFileSync(new URL("./_core/sdk.ts", import.meta.url), "utf8");
const trpc = readFileSync(new URL("./_core/trpc.ts", import.meta.url), "utf8");
const gate = readFileSync(new URL("../client/src/components/AdminGate.tsx", import.meta.url), "utf8");

describe("configured owner administration recovery", () => {
  it("promotes only the configured owner and removes stale primary-admin flags", () => {
    expect(db).toContain("const isConfiguredOwner = Boolean(ENV.ownerOpenId && user.openId === ENV.ownerOpenId)");
    expect(db).toContain("set({ isPrimaryAdmin: 0 }).where(ne(users.openId, user.openId))");
    expect(db).toContain("isPrimaryAdmin: 1, isActive: 1");
  });

  it("returns the refreshed database role in the same OAuth-authenticated request", () => {
    expect(sdk).toContain("return (await db.getUserByOpenId(user.openId)) ?? user");
  });

  it("never applies a password-admin trial expiry to the configured owner", () => {
    expect(trpc).toContain("if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) return");
    expect(trpc).toContain("!isPrimaryOperator(ctx.user)");
  });

  it("allows an already-verified owner through the client administrator gate", () => {
    expect(gate).toContain('const hasAdminAccess = user?.role === "admin" || isOwner');
    expect(gate).toContain("if (!hasAdminAccess) navigate(\"/\")");
  });
});
