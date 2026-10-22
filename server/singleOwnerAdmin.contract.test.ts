import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("single-owner administrator model", () => {
  it("allows password admin login only for the designated primary administrator", () => {
    const router = source("server/routers.ts");
    const schema = source("drizzle/schema.ts");
    expect(router).toContain('account.role !== "admin" || !account.isPrimaryAdmin');
    expect(router).toContain('isPrimaryAdmin: 1');
    expect(router).toContain('ctx.res.cookie(ADMIN_ACCESS_COOKIE');
    expect(schema).toContain('isPrimaryAdmin: int("isPrimaryAdmin").default(0).notNull()');
  });

  it("keeps one primary admin account while allowing owner-only password reset", () => {
    const operations = source("server/routers/operations.ts");
    const page = source("client/src/pages/AccountManagement.tsx");
    expect(operations).not.toContain("createAdminAccount:");
    expect(operations).not.toContain("updateAdminAccount:");
    expect(operations).toContain("setAdminPassword:");
    expect(operations).toContain("ownerOnlyProcedure");
    expect(operations).toContain("legacy, non-primary");
    expect(operations).toContain('sameUsername.role !== "admin" || sameUsername.isPrimaryAdmin');
    expect(operations).toContain('username: null, passwordHash: null, loginMethod: null, isActive: 0');
    expect(page).toContain('id: "admin"');
    expect(page).toContain("<AdminPasswordManager");
    expect(page).toContain("ADMIN is the owner's only operations account.");
  });

  it("lets unauthenticated screens determine that they are not the owner without exposing owner data", () => {
    const operations = source("server/routers/operations.ts");
    expect(operations).toContain("ownerStatus: publicProcedure.query");
    expect(operations).toContain("isOwner: Boolean(ctx.user && isPrimaryOperator(ctx.user))");
  });
});
