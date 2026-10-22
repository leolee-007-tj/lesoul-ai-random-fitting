import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("primary password administrator access", () => {
  it("uses an explicit primary-admin flag in addition to the OAuth project owner", () => {
    const schema = source("drizzle/schema.ts");
    const trpc = source("server/_core/trpc.ts");
    expect(schema).toContain('isPrimaryAdmin: int("isPrimaryAdmin").default(0).notNull()');
    expect(trpc).toContain("export function isPrimaryOperator");
    expect(trpc).toContain('user.role === "admin" && user.isPrimaryAdmin');
  });

  it("keeps owner-only procedures behind the primary-operator rule and exposes only a safe boolean status query", () => {
    const trpc = source("server/_core/trpc.ts");
    const operations = source("server/routers/operations.ts");
    expect(trpc).toContain("const isOwner = Boolean(ctx.user && isPrimaryOperator(ctx.user));");
    expect(operations).toContain("ownerStatus: publicProcedure.query(({ ctx }) => ({ isOwner: Boolean(ctx.user && isPrimaryOperator(ctx.user)) }))");
  });
});
