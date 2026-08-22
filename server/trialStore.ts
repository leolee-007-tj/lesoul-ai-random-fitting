import { and, eq, lte } from "drizzle-orm";
import { trialStoreProducts, trialStores } from "../drizzle/schema";
import { getDb } from "./db";

export const TRIAL_STORE_DURATION_MS = 48 * 60 * 60 * 1000;
const DEFAULT_STORE_NAME = "MY TRIAL STORE";

export type TrialStoreStatus = {
  id: number;
  status: "ACTIVE" | "EXPIRED";
  storeName: string;
  paymentQrUrl: string | null;
  purchaseNotice: string | null;
  startedAt: Date;
  expiresAt: Date;
  remainingMs: number;
};

function serialize(store: typeof trialStores.$inferSelect): TrialStoreStatus {
  const remainingMs = Math.max(0, store.expiresAt.getTime() - Date.now());
  return { id: store.id, status: store.status === "ACTIVE" && remainingMs > 0 ? "ACTIVE" : "EXPIRED", storeName: store.storeName, paymentQrUrl: store.paymentQrUrl, purchaseNotice: store.purchaseNotice, startedAt: store.startedAt, expiresAt: store.expiresAt, remainingMs };
}

export async function expireTrialStore(storeId: number) {
  const db = await getDb();
  if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
  const store = (await db.select().from(trialStores).where(eq(trialStores.id, storeId)).limit(1))[0];
  if (!store || store.status === "EXPIRED") return false;
  await db.transaction(async (tx) => {
    await tx.delete(trialStoreProducts).where(eq(trialStoreProducts.storeId, storeId));
    await tx.update(trialStores).set({ status: "EXPIRED", storeName: DEFAULT_STORE_NAME, paymentQrUrl: null, purchaseNotice: null, resetAt: new Date() }).where(eq(trialStores.id, storeId));
  });
  return true;
}

export async function getTrialStoreStatus(userId: number): Promise<TrialStoreStatus> {
  const db = await getDb();
  if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
  const store = (await db.select().from(trialStores).where(eq(trialStores.ownerUserId, userId)).limit(1))[0];
  if (!store) throw new Error("TRIAL_STORE_NOT_FOUND");
  if (store.status === "ACTIVE" && store.expiresAt.getTime() <= Date.now()) {
    await expireTrialStore(store.id);
    const expired = (await db.select().from(trialStores).where(eq(trialStores.id, store.id)).limit(1))[0];
    if (!expired) throw new Error("TRIAL_STORE_NOT_FOUND");
    return serialize(expired);
  }
  return serialize(store);
}

export async function requireActiveTrialStore(userId: number) {
  const status = await getTrialStoreStatus(userId);
  if (status.status !== "ACTIVE") throw new Error("TRIAL_STORE_EXPIRED");
  return status;
}

export async function resetExpiredTrialStores() {
  const db = await getDb();
  if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
  const expired = await db.select({ id: trialStores.id }).from(trialStores).where(and(eq(trialStores.status, "ACTIVE"), lte(trialStores.expiresAt, new Date())));
  let resetCount = 0;
  for (const store of expired) if (await expireTrialStore(store.id)) resetCount += 1;
  return { resetCount };
}
