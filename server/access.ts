import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { getDb } from "./db";
import { generationFeedback, generationLogs, redeemCodes, releaseSettings, visitorEntitlements } from "../drizzle/schema";

export type ReleaseMode = "PRIVATE" | "BETA_PUBLIC" | "REDEEM_CODE";
export type CatalogTier = "beta" | "basic" | "full";
export type AccessSource = "wechat_moments" | "direct" | "admin_test";

export type AccessDecision = {
  allowed: boolean;
  reason?: "generation_disabled" | "daily_limit" | "global_limit" | "monthly_limit" | "redeem_required" | "redeem_exhausted";
  releaseMode: ReleaseMode;
  catalogTier: CatalogTier;
  remaining: number | null;
};

export async function getReleaseSettings() {
  const db = await getDb();
  if (!db) throw new Error("Release settings are temporarily unavailable.");
  const existing = (await db.select().from(releaseSettings).where(eq(releaseSettings.id, 1)).limit(1))[0];
  if (existing) return existing;
  await db.insert(releaseSettings).values({ id: 1 });
  return (await db.select().from(releaseSettings).where(eq(releaseSettings.id, 1)).limit(1))[0]!;
}

export async function getCurrentEntitlement(visitorId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const now = new Date();
  const rows = await db.select().from(visitorEntitlements).where(eq(visitorEntitlements.visitorId, visitorId)).orderBy(desc(visitorEntitlements.createdAt));
  return rows.find((row) => !row.expiresAt || row.expiresAt > now);
}

const startOfDay = () => { const value = new Date(); value.setUTCHours(0, 0, 0, 0); return value; };
const startOfMonth = () => { const value = new Date(); value.setUTCDate(1); value.setUTCHours(0, 0, 0, 0); return value; };
const billableStatuses = ["completed", "fallback"] as const;

export async function canGenerate(visitorId: string): Promise<AccessDecision> {
  const db = await getDb();
  if (!db) throw new Error("Access service is temporarily unavailable.");
  const settings = await getReleaseSettings();
  const releaseMode = settings.releaseMode;
  if (!settings.generationEnabled) return { allowed: false, reason: "generation_disabled", releaseMode, catalogTier: "full", remaining: null };

  const daily = startOfDay(); const monthly = startOfMonth();
  const [dailyRows, monthlyRows] = await Promise.all([
    db.select({ id: generationLogs.id }).from(generationLogs).where(and(gte(generationLogs.createdAt, daily), inArray(generationLogs.status, billableStatuses))),
    db.select({ id: generationLogs.id }).from(generationLogs).where(and(gte(generationLogs.createdAt, monthly), inArray(generationLogs.status, billableStatuses))),
  ]);
  if (dailyRows.length >= settings.globalDailyGenerationLimit) return { allowed: false, reason: "global_limit", releaseMode, catalogTier: "full", remaining: null };
  if (monthlyRows.length >= settings.monthlyGenerationLimit) return { allowed: false, reason: "monthly_limit", releaseMode, catalogTier: "full", remaining: null };
  if (releaseMode === "PRIVATE") return { allowed: true, releaseMode, catalogTier: "full", remaining: null };
  if (releaseMode === "BETA_PUBLIC") {
    const visitorRows = await db.select({ id: generationLogs.id }).from(generationLogs).where(and(eq(generationLogs.visitorId, visitorId), gte(generationLogs.createdAt, daily), inArray(generationLogs.status, billableStatuses)));
    const remaining = Math.max(0, settings.betaDailyVisitorLimit - visitorRows.length);
    return remaining > 0 ? { allowed: true, releaseMode, catalogTier: "beta", remaining } : { allowed: false, reason: "daily_limit", releaseMode, catalogTier: "beta", remaining: 0 };
  }
  const entitlement = await getCurrentEntitlement(visitorId);
  if (!entitlement) return { allowed: false, reason: "redeem_required", releaseMode, catalogTier: "basic", remaining: 0 };
  const remaining = Math.max(0, entitlement.generationAllowance - entitlement.generationUsed);
  return remaining > 0 ? { allowed: true, releaseMode, catalogTier: entitlement.catalogTier, remaining } : { allowed: false, reason: "redeem_exhausted", releaseMode, catalogTier: entitlement.catalogTier, remaining: 0 };
}

export function selectVisibleProducts<T extends { status: string; isFeatured: number; featuredPriority: number; catalogTier: string; category: string }>(items: T[], tier: CatalogTier, betaLimit: number) {
  const eligible = items.filter((item) => item.status === "in_stock" && (tier === "full" || item.catalogTier === tier || item.catalogTier === "beta"));
  if (tier !== "beta") return eligible;
  const sorted = [...eligible].sort((a, b) => b.isFeatured - a.isFeatured || b.featuredPriority - a.featuredPriority || a.category.localeCompare(b.category));
  const categoryFirst = ["top", "bottom", "dress", "outer"].flatMap((category) => sorted.find((item) => item.category === category) ?? []);
  const unique: T[] = [];
  for (const item of [...categoryFirst, ...sorted]) {
    if (!unique.includes(item)) unique.push(item);
  }
  return unique.slice(0, betaLimit);
}

export async function consumeRedeemAllowance(visitorId: string) {
  const db = await getDb();
  if (!db) return;
  const entitlement = await getCurrentEntitlement(visitorId);
  if (!entitlement) return;
  await db.update(visitorEntitlements).set({ generationUsed: sql`${visitorEntitlements.generationUsed} + 1` }).where(and(eq(visitorEntitlements.id, entitlement.id), lt(visitorEntitlements.generationUsed, entitlement.generationAllowance)));
}

export async function redeemAccessCode(visitorId: string, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Redeem service is temporarily unavailable.");
  const codeHash = createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
  const redeem = (await db.select().from(redeemCodes).where(eq(redeemCodes.codeHash, codeHash)).limit(1))[0];
  const now = new Date();
  if (!redeem || redeem.status !== "ACTIVE" || (redeem.expiresAt && redeem.expiresAt <= now) || redeem.usedCount >= redeem.maxUses) throw new Error("REDEEM_CODE_INVALID");
  await db.insert(visitorEntitlements).values({ visitorId, redeemCodeId: redeem.id, generationAllowance: redeem.generationAllowance, catalogTier: redeem.catalogTier });
  await db.update(redeemCodes).set({ usedCount: sql`${redeemCodes.usedCount} + 1`, status: redeem.usedCount + 1 >= redeem.maxUses ? "USED" : "ACTIVE" }).where(eq(redeemCodes.id, redeem.id));
  return { generationAllowance: redeem.generationAllowance, catalogTier: redeem.catalogTier };
}

export async function saveGenerationFeedback(input: { generationRequestId: string; visitorId: string; feedback: "love" | "okay" | "not_like_me" | "garment_inaccurate" }) {
  const db = await getDb();
  if (!db) throw new Error("Feedback service is temporarily unavailable.");
  await db.insert(generationFeedback).values(input);
}
