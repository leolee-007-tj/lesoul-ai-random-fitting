import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { careLabelPrivatePrices, careLabelProductSymbols, careLabelProducts, careLabelSettings, careLabelSymbols } from "../drizzle/schema";
import { DEFAULT_CARE_SYMBOLS, type CareLabelData } from "../shared/careLabels";
import { CARE_LABEL_SEED } from "./careLabelSeed";
import { getDb } from "./db";

let ensurePromise: Promise<void> | null = null;

const seedRows = CARE_LABEL_SEED.map((item) => ({
  id: item.id,
  data: item as unknown as CareLabelData,
  revision: item.revision ?? 0,
}));

export async function ensureCareLabelCatalog() {
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const existing = await db.select({ id: careLabelProducts.id }).from(careLabelProducts);
      const existingIds = new Set(existing.map((row) => row.id));
      const missing = seedRows.filter((row) => !existingIds.has(row.id));
      for (let index = 0; index < missing.length; index += 80) {
        const batch = missing.slice(index, index + 80);
        if (!batch.length) continue;
        await db.insert(careLabelProducts).values(batch).onDuplicateKeyUpdate({ set: { id: sql`${careLabelProducts.id}` } });
      }
      const symbols = await db.select({ key: careLabelSymbols.key }).from(careLabelSymbols);
      const knownKeys = new Set(symbols.map((row) => row.key));
      const missingSymbols = DEFAULT_CARE_SYMBOLS.filter((symbol) => !knownKeys.has(symbol.key));
      if (missingSymbols.length) {
        await db.insert(careLabelSymbols).values(missingSymbols.map((symbol) => ({ ...symbol, descriptionZh: symbol.descriptionZh, imageUrl: null, isActive: 1 })));
      }
      await db.insert(careLabelSettings).values({ id: 1, wechatQrUrl: null, revision: 0 }).onDuplicateKeyUpdate({ set: { id: sql`${careLabelSettings.id}` } });
    })().finally(() => { ensurePromise = null; });
  }
  await ensurePromise;
}

export async function listCareLabelProducts() {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  return db.select().from(careLabelProducts).orderBy(asc(careLabelProducts.id));
}

export async function getCareLabelProduct(id: string) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const row = (await db.select().from(careLabelProducts).where(eq(careLabelProducts.id, id)).limit(1))[0];
  if (!row) return null;
  const assignments = await db.select({ symbolId: careLabelProductSymbols.symbolId, sortOrder: careLabelProductSymbols.sortOrder }).from(careLabelProductSymbols).where(eq(careLabelProductSymbols.productId, id)).orderBy(asc(careLabelProductSymbols.sortOrder));
  const symbolIds = assignments.map((assignment) => assignment.symbolId);
  const symbols = symbolIds.length ? await db.select().from(careLabelSymbols).where(inArray(careLabelSymbols.id, symbolIds)) : [];
  const symbolsById = new Map(symbols.map((symbol) => [symbol.id, symbol]));
  return { ...row, symbols: assignments.flatMap((assignment) => { const symbol = symbolsById.get(assignment.symbolId); return symbol ? [{ ...symbol, sortOrder: assignment.sortOrder }] : []; }) };
}

export async function getCareLabelPublicSettings() {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const row = (await db.select().from(careLabelSettings).where(eq(careLabelSettings.id, 1)).limit(1))[0];
  return { wechatQrUrl: row?.wechatQrUrl ?? null };
}

export async function getCareLabelAdminData() {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const [products, symbols, settings, assignments, prices] = await Promise.all([
    db.select().from(careLabelProducts).orderBy(asc(careLabelProducts.id)),
    db.select().from(careLabelSymbols).orderBy(asc(careLabelSymbols.sortOrder), asc(careLabelSymbols.id)),
    db.select().from(careLabelSettings).where(eq(careLabelSettings.id, 1)).limit(1),
    db.select().from(careLabelProductSymbols),
    db.select().from(careLabelPrivatePrices),
  ]);
  return { products, symbols, settings: settings[0] ?? { id: 1, wechatQrUrl: null, revision: 0 }, assignments, prices };
}

export async function updateCareLabelProduct(input: { id: string; revision: number; data: CareLabelData }) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const nextRevision = input.revision + 1;
  const nextData = { ...input.data, id: input.id, revision: nextRevision, updatedAt: new Date().toISOString() };
  const result = await db.update(careLabelProducts).set({ data: nextData, revision: nextRevision }).where(and(eq(careLabelProducts.id, input.id), eq(careLabelProducts.revision, input.revision)));
  const affectedRows = Number((result as any)[0]?.affectedRows ?? (result as any).affectedRows ?? 0);
  if (!affectedRows) throw new Error("CARE_LABEL_REVISION_CONFLICT");
  return getCareLabelProduct(input.id);
}

export async function updateCareLabelSettings(input: { revision: number; wechatQrUrl: string | null }) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const nextRevision = input.revision + 1;
  const result = await db.update(careLabelSettings).set({ wechatQrUrl: input.wechatQrUrl, revision: nextRevision }).where(and(eq(careLabelSettings.id, 1), eq(careLabelSettings.revision, input.revision)));
  const affectedRows = Number((result as any)[0]?.affectedRows ?? (result as any).affectedRows ?? 0);
  if (!affectedRows) throw new Error("CARE_LABEL_SETTINGS_REVISION_CONFLICT");
  return { wechatQrUrl: input.wechatQrUrl, revision: nextRevision };
}

export async function updateCareLabelPrivatePrice(input: { id: string; revision: number; amount: string; currency: "CNY" | "KRW" }) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  const existing = (await db.select().from(careLabelPrivatePrices).where(eq(careLabelPrivatePrices.id, input.id)).limit(1))[0];
  if (!existing) {
    if (input.revision !== 0) throw new Error("CARE_LABEL_PRICE_REVISION_CONFLICT");
    await db.insert(careLabelPrivatePrices).values({ id: input.id, amount: input.amount, currency: input.currency, revision: 1 });
    return { id: input.id, amount: input.amount, currency: input.currency, revision: 1 };
  }
  const nextRevision = input.revision + 1;
  const result = await db.update(careLabelPrivatePrices).set({ amount: input.amount, currency: input.currency, revision: nextRevision }).where(and(eq(careLabelPrivatePrices.id, input.id), eq(careLabelPrivatePrices.revision, input.revision)));
  const affectedRows = Number((result as any)[0]?.affectedRows ?? (result as any).affectedRows ?? 0);
  if (!affectedRows) throw new Error("CARE_LABEL_PRICE_REVISION_CONFLICT");
  return { id: input.id, amount: input.amount, currency: input.currency, revision: nextRevision };
}

export async function updateCareLabelSymbol(input: { id?: number; key: string; nameZh: string; descriptionZh: string; imageUrl?: string | null; sortOrder: number; isActive: number }) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  if (input.id) {
    await db.update(careLabelSymbols).set({ key: input.key, nameZh: input.nameZh, descriptionZh: input.descriptionZh, imageUrl: input.imageUrl ?? null, sortOrder: input.sortOrder, isActive: input.isActive }).where(eq(careLabelSymbols.id, input.id));
    return (await db.select().from(careLabelSymbols).where(eq(careLabelSymbols.id, input.id)).limit(1))[0];
  }
  const inserted = await db.insert(careLabelSymbols).values({ key: input.key, nameZh: input.nameZh, descriptionZh: input.descriptionZh, imageUrl: input.imageUrl ?? null, sortOrder: input.sortOrder, isActive: input.isActive });
  const id = Number((inserted as any).insertId);
  return (await db.select().from(careLabelSymbols).where(eq(careLabelSymbols.id, id)).limit(1))[0];
}

export async function setCareLabelProductSymbols(input: { productId: string; symbolIds: number[] }) {
  await ensureCareLabelCatalog();
  const db = await getDb();
  if (!db) throw new Error("CARE_LABEL_DATABASE_UNAVAILABLE");
  await db.delete(careLabelProductSymbols).where(eq(careLabelProductSymbols.productId, input.productId));
  if (input.symbolIds.length) await db.insert(careLabelProductSymbols).values(input.symbolIds.map((symbolId, index) => ({ productId: input.productId, symbolId, sortOrder: index + 1 })));
  return getCareLabelProduct(input.productId);
}
