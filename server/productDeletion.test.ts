import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getTableName } from "drizzle-orm";
import { readFileSync } from "node:fs";

const fixture = vi.hoisted(() => ({ db: null as any }));
vi.mock("drizzle-orm/mysql2", () => ({ drizzle: () => fixture.db }));
import { deleteAdminProducts } from "./db";

const previousDatabaseUrl = process.env.DATABASE_URL;
afterAll(() => {
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
});

describe("product deletion reference cleanup", () => {
  let operations: string[];
  let failTable: string | undefined;
  beforeEach(() => {
    // A fake DB handle only: this suite never connects to a database.
    process.env.DATABASE_URL = "fixture-only";
    operations = [];
    failTable = undefined;
    const tx = {
      update: () => ({ set: () => ({ where: async () => undefined }) }),
      delete: (table: any) => ({ where: async () => {
        const name = getTableName(table);
        operations.push(name);
        if (name === failTable) throw new Error("fixture cleanup failure");
      } }),
      insert: () => ({ values: () => ({ onDuplicateKeyUpdate: async () => undefined }) }),
    };
    const db = {
      select: () => ({ from: () => ({ where: async () => [{ id: 7 }] }) }),
      transaction: async (work: (tx: any) => Promise<void>) => work(tx),
    };
    // getDb caches its handle; keep a stable object between test cases.
    if (fixture.db) Object.assign(fixture.db, db);
    else fixture.db = db;
  });

  it("cleans every non-null product reference before removing the product", async () => {
    expect(await deleteAdminProducts([7, 7])).toEqual({ deletedCount: 1 });
    expect(operations).toEqual([
      "curatedOutfitItems", "displayLookbookImages", "productShareVisits",
      "productEngagementEvents", "products",
    ]);
  });

  it("does not delete the product or report success if a reference cleanup fails", async () => {
    failTable = "productShareVisits";
    await expect(deleteAdminProducts([7])).rejects.toThrow("fixture cleanup failure");
    expect(operations).not.toContain("products");
  });

  it("does nothing when no requested products exist", async () => {
    fixture.db.select = () => ({ from: () => ({ where: async () => [] }) });
    expect(await deleteAdminProducts([999])).toEqual({ deletedCount: 0 });
    expect(operations).toEqual([]);
  });

  it("puts failure feedback inside the deletion dialog", () => {
    const source = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    const dialog = source.slice(source.indexOf('{deleteIntent &&'));
    expect(dialog).toContain('{error && <p role="alert"');
    expect(source).toContain('if (!deleteIntent || isDeleting ||');
  });
});
