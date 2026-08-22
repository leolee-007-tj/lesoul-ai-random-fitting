import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("single-owner administrator model", () => {
  it("allows password admin login only for the designated primary administrator", () => {
    const router = source("server/routers.ts");
    expect(router).toContain('account.role !== "admin" || !account.isPrimaryAdmin');
    expect(router).toContain('isPrimaryAdmin: 1');
  });

  it("removes secondary admin creation and management from operations and account UI", () => {
    const operations = source("server/routers/operations.ts");
    const page = source("client/src/pages/AccountManagement.tsx");
    expect(operations).not.toContain("createAdminAccount:");
    expect(operations).not.toContain("updateAdminAccount:");
    expect(page).not.toContain('id: "admin"');
    expect(page).toContain("ADMIN is the owner's only operations account.");
  });
});
