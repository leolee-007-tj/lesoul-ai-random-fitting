import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { aiAccessBlocks, aiUsageEvents, generationLogs, releaseSettings, visitorEntitlements } from "../drizzle/schema";

export type AiFeatureType = "AI_BODY_MODEL" | "AI_FITTING" | "QUICK_FIT" | "REGENERATION" | "AI_STYLIST";
export type AiUsageOutcome = "SUCCESS" | "FAILED" | "CANCELLED" | "BLOCKED_BY_LIMIT" | "BLOCKED_BY_BUDGET" | "PAUSED";
export type AiBlockReason = "paused" | "budget_limit" | "daily_limit" | "global_limit" | "monthly_limit" | "redeem_required" | "redeem_exhausted" | "quota_exhausted";

export type AiAccessDecision = {
  allowed: boolean;
  reason?: AiBlockReason;
  remaining: number | null;
  isVip: boolean;
  isAdmin: boolean;
  releaseMode: "PRIVATE" | "BETA_PUBLIC" | "REDEEM_CODE";
  catalogTier: "beta" | "basic" | "full";
  estimatedCostFen: number;
};

const imageFeatures: AiFeatureType[] = ["AI_BODY_MODEL", "AI_FITTING", "QUICK_FIT", "REGENERATION"];
const successfulStatus = ["SUCCESS"] as const;
const billableRequestStatuses = ["REQUESTED", "SUCCESS", "FAILED", "CANCELLED"] as const;
const startOfDay = () => { const value = new Date(); value.setUTCHours(0, 0, 0, 0); return value; };
const startOfMonth = () => { const value = new Date(); value.setUTCDate(1); value.setUTCHours(0, 0, 0, 0); return value; };

export async function getCentralSettings() {
  const db = await getDb();
  if (!db) throw new Error("AI settings are temporarily unavailable.");
  const existing = (await db.select().from(releaseSettings).where(eq(releaseSettings.id, 1)).limit(1))[0];
  if (existing) return existing;
  await db.insert(releaseSettings).values({ id: 1 });
  return (await db.select().from(releaseSettings).where(eq(releaseSettings.id, 1)).limit(1))[0]!;
}

export async function getCentralEntitlement(visitorId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const now = new Date();
  const rows = await db.select().from(visitorEntitlements).where(eq(visitorEntitlements.visitorId, visitorId)).orderBy(desc(visitorEntitlements.createdAt));
  return rows.find((row) => !row.expiresAt || row.expiresAt > now);
}

export function estimatedFeatureCost(settings: Awaited<ReturnType<typeof getCentralSettings>>, feature: AiFeatureType) {
  switch (feature) {
    case "AI_BODY_MODEL": return settings.aiBodyModelEstimatedCostFen;
    case "QUICK_FIT": return settings.quickFitEstimatedCostFen;
    case "REGENERATION": return settings.regenerationEstimatedCostFen;
    case "AI_FITTING": return settings.aiFittingEstimatedCostFen;
    case "AI_STYLIST": return 0;
  }
}

function isOwnerVisitor(visitorId: string) {
  return visitorId === `account:${ENV.ownerOpenId}`;
}

async function successfulGenerationCount(visitorId: string) {
  const db = await getDb();
  if (!db) return 0;
  const [events, logs] = await Promise.all([
    db.select({ generationId: aiUsageEvents.generationId }).from(aiUsageEvents).where(and(eq(aiUsageEvents.visitorId, visitorId), inArray(aiUsageEvents.featureType, imageFeatures), inArray(aiUsageEvents.status, successfulStatus))),
    db.select({ requestId: generationLogs.requestId }).from(generationLogs).where(and(eq(generationLogs.visitorId, visitorId), eq(generationLogs.status, "completed"))),
  ]);
  const eventGenerationIds = new Set(events.map((event) => event.generationId).filter((id): id is string => Boolean(id)));
  const historicalSuccessfulLogs = logs.filter((log) => !eventGenerationIds.has(log.requestId)).length;
  const bodyModelSuccesses = events.filter((event) => !event.generationId).length;
  const imageGenerationSuccesses = events.filter((event) => event.generationId).length;
  return historicalSuccessfulLogs + imageGenerationSuccesses + bodyModelSuccesses;
}

async function pendingReservations(visitorId: string) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: aiUsageEvents.id }).from(aiUsageEvents).where(and(eq(aiUsageEvents.visitorId, visitorId), inArray(aiUsageEvents.featureType, imageFeatures), eq(aiUsageEvents.status, "REQUESTED")));
  return rows.length;
}

export async function evaluateAiAccess(input: { visitorId: string; feature: AiFeatureType; skipQuota?: boolean }): Promise<AiAccessDecision> {
  const db = await getDb();
  if (!db) throw new Error("AI access service is temporarily unavailable.");
  const settings = await getCentralSettings();
  const isAdmin = isOwnerVisitor(input.visitorId);
  const entitlement = await getCentralEntitlement(input.visitorId);
  const isVip = Boolean(entitlement?.isUnlimited);
  const releaseMode = settings.releaseMode;
  const catalogTier = entitlement?.catalogTier ?? (releaseMode === "BETA_PUBLIC" ? "beta" : "full");
  const estimatedCostFen = estimatedFeatureCost(settings, input.feature);
  const base = { releaseMode, catalogTier, isVip, isAdmin, estimatedCostFen } as const;
  const activeBlock = (await db.select().from(aiAccessBlocks).where(eq(aiAccessBlocks.visitorId, input.visitorId)).limit(1))[0];
  if (activeBlock?.isActive) return { allowed: false, reason: "paused", remaining: null, ...base };
  if (!settings.generationEnabled && input.feature !== "AI_STYLIST") return { allowed: false, reason: "paused", remaining: null, ...base };

  const now = new Date();
  const [dailyEvents, monthlyEvents] = await Promise.all([
    db.select({ id: aiUsageEvents.id }).from(aiUsageEvents).where(and(gte(aiUsageEvents.startedAt, startOfDay()), inArray(aiUsageEvents.featureType, imageFeatures), inArray(aiUsageEvents.status, billableRequestStatuses))),
    db.select({ estimatedCostFen: aiUsageEvents.estimatedCostFen }).from(aiUsageEvents).where(and(gte(aiUsageEvents.startedAt, startOfMonth()), inArray(aiUsageEvents.featureType, imageFeatures), inArray(aiUsageEvents.status, billableRequestStatuses))),
  ]);
  const effectiveDailyRequestLimit = settings.dailyAiRequestLimit > 0 ? settings.dailyAiRequestLimit : settings.globalDailyGenerationLimit;
  if (input.feature !== "AI_STYLIST" && effectiveDailyRequestLimit > 0 && dailyEvents.length >= effectiveDailyRequestLimit) return { allowed: false, reason: "daily_limit", remaining: null, ...base };
  if (input.feature !== "AI_STYLIST" && settings.monthlyGenerationLimit > 0 && monthlyEvents.length >= settings.monthlyGenerationLimit) return { allowed: false, reason: "monthly_limit", remaining: null, ...base };
  const monthlyEstimatedCostFen = monthlyEvents.reduce((total, item) => total + item.estimatedCostFen, 0);
  if (input.feature !== "AI_STYLIST" && settings.stopAiAtBudgetLimit && settings.monthlyAiBudgetFen > 0 && monthlyEstimatedCostFen + estimatedCostFen > settings.monthlyAiBudgetFen) return { allowed: false, reason: "budget_limit", remaining: null, ...base };
  if (input.feature === "AI_STYLIST" || input.skipQuota || isAdmin || isVip) return { allowed: true, remaining: isVip ? null : settings.normalAiGenerationLimit, ...base };
  if (releaseMode === "REDEEM_CODE" && !entitlement) return { allowed: false, reason: "redeem_required", remaining: 0, ...base };

  const [completed, reserved] = await Promise.all([successfulGenerationCount(input.visitorId), pendingReservations(input.visitorId)]);
  const remaining = Math.max(0, settings.normalAiGenerationLimit - completed - reserved);
  if (remaining <= 0) return { allowed: false, reason: "quota_exhausted", remaining: 0, ...base };
  return { allowed: true, remaining, ...base };
}

export async function beginAiUsage(input: { visitorId: string; feature: AiFeatureType; generationId?: string | null; provider: string; model?: string | null; skipQuota?: boolean }) {
  const access = await evaluateAiAccess({ visitorId: input.visitorId, feature: input.feature, skipQuota: input.skipQuota });
  const db = await getDb();
  if (!db) throw new Error("AI usage service is temporarily unavailable.");
  if (!access.allowed) {
    const status = access.reason === "paused" ? "PAUSED" : access.reason === "budget_limit" ? "BLOCKED_BY_BUDGET" : "BLOCKED_BY_LIMIT" as const;
    await db.insert(aiUsageEvents).values({ visitorId: input.visitorId, generationId: input.generationId ?? null, featureType: input.feature, requestType: input.feature === "AI_STYLIST" ? "RULE_ENGINE" : "IMAGE_GENERATION", provider: input.provider, model: input.model ?? null, status, estimatedCostFen: 0, completedAt: new Date(), errorMessage: access.reason ?? null });
    throw new Error(`GENERATION_ACCESS_DENIED:${access.reason}`);
  }
  const entitlement = await getCentralEntitlement(input.visitorId);
  const created = await db.insert(aiUsageEvents).values({ visitorId: input.visitorId, entitlementId: entitlement?.id ?? null, generationId: input.generationId ?? null, featureType: input.feature, requestType: input.feature === "AI_STYLIST" ? "RULE_ENGINE" : "IMAGE_GENERATION", provider: input.provider, model: input.model ?? null, status: "REQUESTED", estimatedCostFen: access.estimatedCostFen });
  return { eventId: Number(created[0].insertId), access };
}

export async function finishAiUsage(eventId: number, outcome: Extract<AiUsageOutcome, "SUCCESS" | "FAILED" | "CANCELLED">, details?: { durationMs?: number; errorMessage?: string; providerUsageMetadata?: Record<string, unknown> | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(aiUsageEvents).set({ status: outcome, durationMs: details?.durationMs ?? null, errorMessage: details?.errorMessage ?? null, providerUsageMetadata: details?.providerUsageMetadata ?? null, completedAt: new Date() }).where(eq(aiUsageEvents.id, eventId));
}

/** Rule-only Stylist interactions are visible in analytics but never spend budget or customer generation quota. */
export async function recordRuleEngineUse(visitorId: string | undefined) {
  if (!visitorId) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(aiUsageEvents).values({ visitorId, featureType: "AI_STYLIST", requestType: "RULE_ENGINE", provider: "lesoul_rule_engine", status: "SUCCESS", estimatedCostFen: 0, completedAt: new Date() });
}

export async function getAiUsageSummary(range: "today" | "7d" | "30d" | "all" = "30d") {
  const db = await getDb();
  if (!db) throw new Error("AI usage service is temporarily unavailable.");
  const since = range === "today" ? startOfDay() : range === "7d" ? new Date(Date.now() - 7 * 86400000) : range === "30d" ? new Date(Date.now() - 30 * 86400000) : null;
  const events = since ? await db.select().from(aiUsageEvents).where(gte(aiUsageEvents.startedAt, since)).orderBy(desc(aiUsageEvents.startedAt)) : await db.select().from(aiUsageEvents).orderBy(desc(aiUsageEvents.startedAt));
  return events;
}
