import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("store branding contract", () => {
  it("keeps a validated store name in the owner-managed release settings", () => {
    expect(source("../drizzle/schema.ts")).toContain('storeName: varchar("storeName", { length: 80 }).default("LESOUL AI LOOK").notNull()');
    expect(source("../drizzle/schema.ts")).toContain('storeTaglineKo: varchar("storeTaglineKo", { length: 180 })');
    const admin = source("./routers/admin.ts");
    expect(admin).toContain('storeName: z.string().trim().min(1).max(80).optional()');
    expect(admin).toContain('storeTaglineEn: z.string().trim().min(1).max(180).optional()');
    expect(admin).toContain("storeName: input.storeName ?? current.storeName");
  });

  it("exposes only the public store name to customer pages and uses it in the shared header", () => {
    const catalog = source("./routers/catalog.ts");
    expect(catalog).toContain("branding: publicProcedure.query");
    expect(catalog).toContain('storeName: settings.storeName || "LESOUL AI LOOK"');
    expect(catalog).toContain("storeTaglineKo: settings.storeTaglineKo");
    const header = source("../client/src/components/AppHeader.tsx");
    expect(header).toContain("trpc.catalog.branding.useQuery()");
    expect(header).toContain('branding.data?.storeName || "LESOUL AI LOOK"');
  });

  it("keeps the public introduction page outside customer gating and sends conversion actions into the existing sign-in flow", () => {
    const app = source("../client/src/App.tsx");
    expect(app).toContain('path={"/about"} component={PublicIntroduction}');
    const introduction = source("../client/src/pages/PublicIntroduction.tsx");
    expect(introduction).toContain('navigate("/login?next=/")');
    expect(introduction).toContain('navigate("/login?next=/catalog")');
    expect(introduction).toContain("VIP accounts are created and managed by the owner");
    expect(introduction).toContain("branding.data?.storeTaglineKo");
  });
});
