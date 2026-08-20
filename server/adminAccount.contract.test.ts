import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("owner-managed ADMIN password accounts", () => {
  it("keeps ADMIN account creation and reset behind the configured owner-only procedure", () => {
    const operations = source("./routers/operations.ts");
    const trpc = source("./_core/trpc.ts");
    expect(trpc).toContain("export const ownerOnlyProcedure");
    expect(operations).toContain("createAdminAccount: ownerOnlyProcedure");
    expect(operations).toContain("updateAdminAccount: ownerOnlyProcedure");
    expect(operations).toContain('role: "admin"');
    expect(operations).toContain("hashVipPassword(input.password)");
  });

  it("uses an independent ADMIN cookie and resolves only active ADMIN accounts", () => {
    const auth = source("./routers.ts");
    const context = source("./_core/context.ts");
    const access = source("./vipAccess.ts");
    expect(access).toContain('ADMIN_ACCESS_COOKIE = "lesoul_admin_access"');
    expect(auth).toContain("adminLogin:");
    expect(auth).toContain("createAdminAccessToken");
    expect(context).toContain("readAdminAccessSession");
    expect(context).toContain('eq(users.role, "admin")');
    expect(context).toContain("eq(users.isActive, 1)");
  });
});
