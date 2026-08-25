import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("single-owner administrator model", () => {
  it("keeps owner OAuth as the only public administrator entry", () => {
    const router = source("server/routers.ts");
    const schema = source("drizzle/schema.ts");
    const oauth = source("server/_core/oauth.ts");
    expect(router).toContain('reason: "owner_oauth_only"');
    expect(schema).toContain('isPrimaryAdmin: int("isPrimaryAdmin").default(0).notNull()');
    expect(oauth).toContain("sdk.getUserInfo");
    expect(oauth).toContain("res.redirect(302, next)");
  });

  it("removes secondary admin creation and management from operations and account UI", () => {
    const operations = source("server/routers/operations.ts");
    const page = source("client/src/pages/AccountManagement.tsx");
    expect(operations).not.toContain("createAdminAccount:");
    expect(operations).not.toContain("updateAdminAccount:");
    expect(page).not.toContain('id: "admin"');
    expect(page).toContain("ADMIN is the owner's only operations account.");
  });

  it("lets unauthenticated screens determine that they are not the owner without exposing owner data", () => {
    const operations = source("server/routers/operations.ts");
    expect(operations).toContain("ownerStatus: publicProcedure.query");
    expect(operations).toContain("isOwner: Boolean(ctx.user && isPrimaryOperator(ctx.user))");
  });
});
