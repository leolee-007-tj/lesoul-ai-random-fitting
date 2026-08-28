import { and, desc, eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { getDb } from "./db";
import { generationFeedback, redeemCodes, visitorEntitlements } from "../drizzle/schema";
import { normaliseAvailabilityStatus, type AvailabilityStatus } from "../shared/productAvailability";
import { type AiActor, evaluateAiAccess, getCentralEntitlement, getCentralSettings } from "./aiUsageController";

export type ReleaseMode = "PRIVATE" | "BETA_PUBLIC" | "REDEEM_CODE";
export type CatalogTier = "beta" | "basic" | "full";
export type AccessSource = "wechat_moments" | "direct" | "admin_test";

export type AccessDecision = {
  allowed: boolean;
  reason?: "generation_disabled" | "daily_limit" | "global_limit" | "monthly_limit" | "redeem_required" | "redeem_exhausted" | "budget_limit" | "role_forbidden" | "style_match_disabled" | "style_match_quota";
  releaseMode: ReleaseMode;
  catalogTier: CatalogTier;
  remaining: number | null;
  isVip: boolean;
};

export async function getReleaseSettings() {
  return getCentralSettings();
}

export async function getCurrentEntitlement(visitorId: string) {
  return getCentralEntitlement(visitorId);
}

export const remainingLookAllowance = (allowance: number, used: number, isUnlimited = false) => isUnlimited ? null : Math.max(0, allowance - used);

export async function canGenerate(visitorId: string, actor?: AiActor): Promise<AccessDecision> {
  const decision = await evaluateAiAccess({ visitorId, feature: "AI_FITTING", actor });
  const reasonMap = { paused: "generation_disabled", budget_limit: "budget_limit", daily_limit: "global_limit", global_limit: "global_limit", monthly_limit: "monthly_limit", redeem_required: "redeem_required", redeem_exhausted: "redeem_exhausted", quota_exhausted: "daily_limit", role_forbidden: "role_forbidden", style_match_disabled: "style_match_disabled", style_match_quota: "style_match_quota" } as const;
  return { allowed: decision.allowed, ...(decision.reason ? { reason: reasonMap[decision.reason] } : {}), releaseMode: decision.releaseMode, catalogTier: decision.catalogTier, remaining: decision.remaining, isVip: decision.isVip };
}

export type CustomerRole = "user" | "vip" | "admin" | "store_trial" | "store_display" | null | undefined;

/** Customer-facing VIP previews are enforced server-side and never rely on a hidden client card. */
export function canViewVipEarlyAccess(item: { vipEarlyAccess?: number | null }, role: CustomerRole) {
  return item.vipEarlyAccess !== 1 || role === "vip" || role === "admin";
}

export function selectVisibleProducts<T extends { status: string; isActive?: number; availabilityStatus?: AvailabilityStatus; vipEarlyAccess?: number | null; isFeatured: number; featuredPriority: number; catalogTier: string; category: string }>(items: T[], tier: CatalogTier, betaLimit: number, role: CustomerRole = null) {
  const eligible = items.filter((item) => item.isActive !== 0 && normaliseAvailabilityStatus(item.availabilityStatus, item.status) === "IN_STOCK" && canViewVipEarlyAccess(item, role) && (tier === "full" || item.catalogTier === tier || item.catalogTier === "beta"));
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
  // Quota is now derived from successful centrally-recorded usage events. Kept as a no-op compatibility export.
  void visitorId;
}

export async function redeemAccessCode(visitorId: string, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Redeem service is temporarily unavailable.");
  const codeHash = createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
  const redeem = (await db.select().from(redeemCodes).where(eq(redeemCodes.codeHash, codeHash)).limit(1))[0];
  const now = new Date();
  if (!redeem || redeem.status !== "ACTIVE" || (redeem.expiresAt && redeem.expiresAt <= now) || redeem.usedCount >= redeem.maxUses) throw new Error("REDEEM_CODE_INVALID");
  const existing = (await db.select({ id: visitorEntitlements.id }).from(visitorEntitlements).where(and(eq(visitorEntitlements.visitorId, visitorId), eq(visitorEntitlements.redeemCodeId, redeem.id))).limit(1))[0];
  if (existing) throw new Error("REDEEM_CODE_ALREADY_USED");
  await db.insert(visitorEntitlements).values({ visitorId, redeemCodeId: redeem.id, generationAllowance: redeem.generationAllowance, isUnlimited: redeem.isUnlimited, catalogTier: redeem.catalogTier });
  await db.update(redeemCodes).set({ usedCount: sql`${redeemCodes.usedCount} + 1`, status: redeem.usedCount + 1 >= redeem.maxUses ? "USED" : "ACTIVE" }).where(eq(redeemCodes.id, redeem.id));
  return { generationAllowance: redeem.generationAllowance, isUnlimited: Boolean(redeem.isUnlimited), catalogTier: redeem.catalogTier };
}

export async function saveGenerationFeedback(input: { generationRequestId: string; visitorId: string; feedback: "love" | "okay" | "not_like_me" | "garment_inaccurate" }) {
  const db = await getDb();
  if (!db) throw new Error("Feedback service is temporarily unavailable.");
  await db.insert(generationFeedback).values(input);
}
