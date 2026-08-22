import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("isolated store trial contract", () => {
  it("uses a dedicated role and tables rather than the production catalog", () => {
    const schema = source("drizzle/schema.ts");
    expect(schema).toContain('"store_trial"');
    expect(schema).toContain('export const trialStores');
    expect(schema).toContain('export const trialStoreProducts');
    expect(schema).toContain('trialStoreProducts').toContain("storeId");
  });

  it("scopes trial mutations to the active workspace and resets only trial records", () => {
    const router = source("server/routers/trialStore.ts");
    const lifecycle = source("server/trialStore.ts");
    expect(router).toContain("trialStoreProcedure");
    expect(router).toContain("eq(trialStoreProducts.storeId, store.id)");
    expect(lifecycle).toContain("tx.delete(trialStoreProducts)");
    expect(lifecycle).not.toContain("tx.delete(products)");
  });

  it("protects production catalog procedures from store-trial sessions", () => {
    const admin = source("server/routers/admin.ts");
    expect(admin).toContain("createProduct: ownerProcedure");
    expect(admin).not.toContain("createProduct: protectedProcedure");
  });

  it("provides an authenticated scheduled reset callback", () => {
    const server = source("server/_core/index.ts");
    expect(server).toContain('"/api/scheduled/trial-store-reset"');
    expect(server).toContain("user.isCron");
    expect(server).toContain("resetExpiredTrialStores");
  });
});
