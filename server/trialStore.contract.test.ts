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
    expect(server).toContain("trialStoreResetCronTaskUid !== user.taskUid");
    expect(server).toContain("resetExpiredTrialStores");
  });

  it("lets only the owner extend an isolated store by months or a future end date while retaining the existing expiry cleanup", () => {
    const operations = source("server/routers/operations.ts");
    const lifecycle = source("server/trialStore.ts");
    expect(operations).toContain("extendTrialStoreAccess: ownerOnlyProcedure");
    expect(operations).toContain("months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])");
    expect(operations).toContain("TRIAL_STORE_EXPIRY_MUST_BE_FUTURE");
    expect(operations).toContain('status: "ACTIVE", expiresAt');
    expect(lifecycle).toContain("lte(trialStores.expiresAt, new Date())");
    expect(lifecycle).toContain("store.expiresAt.getTime() > Date.now()");
  });

  it("keeps the owner list ordered by nearest expiry with localized lifecycle filters and payment-confirmed extension actions", () => {
    const manager = source("client/src/components/TrialStoreManager.tsx");
    expect(manager).toContain('type TrialFilter = "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED"');
    expect(manager).toContain("filter === \"ALL\" || storeState(store) === filter");
    expect(manager).toContain("new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()");
    expect(manager).toContain("extend.mutate({ storeId: store.id, months })");
    expect(manager).toContain("extend.mutate({ storeId: store.id, expiresOn: customEndDate })");
    expect(manager).not.toContain("store.username} · {store.displayName");
  });
});
