import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { aiAccessBlocks, aiUsageEvents, redeemCodes, releaseSettings, users, visitorEntitlements } from "../../drizzle/schema";
import { getDb } from "../db";
import { getCentralEntitlement, getCentralSettings } from "../aiUsageController";
import { ownerOnlyProcedure, ownerProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { hashVipPassword, normalizeVipUsername } from "../vipAccess";
import { anonymousNickname } from "../../shared/anonymousNickname";

const rangeSchema = z.enum(["today", "7d", "30d", "all"]).default("30d");
const cnyFen = z.number().int().min(0).max(10_000_000_00);
const startFor = (range: z.infer<typeof rangeSchema>) => {
  const now = new Date();
  if (range === "today") { now.setUTCHours(0, 0, 0, 0); return now; }
  if (range === "7d") return new Date(Date.now() - 7 * 86400000);
  if (range === "30d") return new Date(Date.now() - 30 * 86400000);
  return null;
};
const billableStatuses = ["REQUESTED", "SUCCESS", "FAILED", "CANCELLED"] as const;
const featureLabel = (feature: string) => ({ AI_BODY_MODEL: "AI Body Model", AI_FITTING: "AI Fitting", LIYING_AI: "李瀛 AI", QUICK_FIT: "Quick AI", REGENERATION: "Regeneration", AI_STYLIST: "AI Style Match" }[feature] ?? feature);

export const operationsRouter = router({
  dashboard: ownerProcedure.input(z.object({ range: rangeSchema })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Operations data is temporarily unavailable.");
    const since = startFor(input.range);
    const events = since ? await db.select().from(aiUsageEvents).where(gte(aiUsageEvents.startedAt, since)).orderBy(desc(aiUsageEvents.startedAt)) : await db.select().from(aiUsageEvents).orderBy(desc(aiUsageEvents.startedAt));
    const allUsers = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users);
    const billable = events.filter((event) => billableStatuses.includes(event.status as (typeof billableStatuses)[number]));
    const featureMap = new Map<string, { featureType: string; label: string; requests: number; success: number; failed: number; averageDurationMs: number; estimatedCostFen: number; durations: number[] }>();
    for (const event of events) {
      const row = featureMap.get(event.featureType) ?? { featureType: event.featureType, label: featureLabel(event.featureType), requests: 0, success: 0, failed: 0, averageDurationMs: 0, estimatedCostFen: 0, durations: [] };
      row.requests += 1;
      if (event.status === "SUCCESS") row.success += 1;
      if (event.status === "FAILED") row.failed += 1;
      if (event.durationMs != null) row.durations.push(event.durationMs);
      if (billableStatuses.includes(event.status as (typeof billableStatuses)[number])) row.estimatedCostFen += event.estimatedCostFen;
      featureMap.set(event.featureType, row);
    }
    const featureRanking = Array.from(featureMap.values()).map(({ durations, ...row }) => ({ ...row, averageDurationMs: durations.length ? Math.round(durations.reduce((total: number, value: number) => total + value, 0) / durations.length) : null })).sort((a, b) => b.requests - a.requests);
    const dayKeys = Array.from({ length: 7 }, (_, index) => { const date = new Date(Date.now() - (6 - index) * 86400000); return date.toISOString().slice(0, 10); });
    const trend = dayKeys.map((date) => ({ date, requests: 0, success: 0, estimatedCostFen: 0 }));
    const trendByDate = new Map(trend.map((point) => [point.date, point]));
    for (const event of events) {
      const key = event.startedAt.toISOString().slice(0, 10); const point = trendByDate.get(key); if (!point) continue;
      point.requests += 1; if (event.status === "SUCCESS") point.success += 1;
      if (billableStatuses.includes(event.status as (typeof billableStatuses)[number])) point.estimatedCostFen += event.estimatedCostFen;
    }
    const settings = await getCentralSettings();
    const estimatedCostFen = billable.reduce((total, event) => total + event.estimatedCostFen, 0);
    const actualRequests = billable.length;
    const accountVisitors = new Set(events.filter((event) => event.visitorId.startsWith("account:")).map((event) => event.visitorId));
    const anonymousVisitors = new Set(events.filter((event) => !event.visitorId.startsWith("account:")).map((event) => event.visitorId));
    const success = events.filter((event) => event.status === "SUCCESS").length;
    const failure = events.filter((event) => event.status === "FAILED").length;
    const averageDurationMs = events.filter((event) => event.durationMs != null).length ? Math.round(events.filter((event) => event.durationMs != null).reduce((total, event) => total + (event.durationMs ?? 0), 0) / events.filter((event) => event.durationMs != null).length) : null;
    const monthlyBudgetPercent = settings.monthlyAiBudgetFen > 0 ? Math.min(100, Math.round((estimatedCostFen / settings.monthlyAiBudgetFen) * 1000) / 10) : null;
    return { range: input.range, metrics: { registeredUsers: allUsers.length, accountVisitors: accountVisitors.size, anonymousVisitors: anonymousVisitors.size, totalRequests: events.length, actualRequests, success, failure, averageDurationMs, estimatedCostFen, configuredMonthlyBudgetFen: settings.monthlyAiBudgetFen, monthlyBudgetPercent, manuallyEnteredActualCostFen: settings.monthlyActualAiCostFen }, featureRanking, trend, settings: { generationEnabled: Boolean(settings.generationEnabled), dailyAiRequestLimit: settings.dailyAiRequestLimit, stopAiAtBudgetLimit: Boolean(settings.stopAiAtBudgetLimit) } };
  }),
  users: ownerProcedure.input(z.object({ locale: z.enum(["en", "ko", "zh"]).default("ko") }).default({ locale: "ko" })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Operations data is temporarily unavailable.");
    const [registered, events, blocks] = await Promise.all([
      db.select({ id: users.id, openId: users.openId, username: users.username, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)),
      db.select().from(aiUsageEvents).orderBy(desc(aiUsageEvents.startedAt)),
      db.select().from(aiAccessBlocks),
    ]);
    const usageByVisitor = new Map<string, typeof events>();
    events.forEach((event) => usageByVisitor.set(event.visitorId, [...(usageByVisitor.get(event.visitorId) ?? []), event]));
    const blockByVisitor = new Map(blocks.map((block) => [block.visitorId, block]));
    const accounts = await Promise.all(registered.map(async (account) => {
      const visitorId = `account:${account.openId}`; const usage = usageByVisitor.get(visitorId) ?? []; const entitlement = await getCentralEntitlement(visitorId);
      const usageByFeature = Object.fromEntries(Array.from(new Set(usage.map((event) => event.featureType))).map((feature) => [feature, usage.filter((event) => event.featureType === feature).length]));
      return { kind: "account" as const, visitorId, user: { ...account, name: anonymousNickname(visitorId, input.locale) }, aiRequestCount: usage.length, usageByFeature, latestAiRequestAt: usage[0]?.startedAt ?? null, isVip: account.role === "vip", generationAllowance: entitlement?.generationAllowance ?? null, generationUsed: entitlement?.generationUsed ?? null, entitlementExpiresAt: entitlement?.expiresAt ?? null, isBlocked: Boolean(blockByVisitor.get(visitorId)?.isActive), blockReason: blockByVisitor.get(visitorId)?.reason ?? null };
    }));
    const visitorAggregates = Array.from(usageByVisitor.entries()).filter(([visitorId]) => !visitorId.startsWith("account:")).map(([visitorId, usage]) => ({ kind: "visitor" as const, visitorId, user: { id: null, openId: null, username: null, name: anonymousNickname(visitorId, input.locale), email: null, role: "user", isActive: 1, createdAt: null, lastSignedIn: null }, aiRequestCount: usage.length, latestAiRequestAt: usage[0]?.startedAt ?? null, isVip: false, generationAllowance: null, generationUsed: null, entitlementExpiresAt: null, isBlocked: Boolean(blockByVisitor.get(visitorId)?.isActive), blockReason: blockByVisitor.get(visitorId)?.reason ?? null }));
    return { accounts, visitors: visitorAggregates };
  }),
  ownerStatus: ownerProcedure.query(({ ctx }) => ({ isOwner: Boolean(ENV.ownerOpenId && ctx.user.openId === ENV.ownerOpenId) })),
  setUserAccess: ownerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), isBlocked: z.boolean(), reason: z.string().trim().max(240).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Operations data is temporarily unavailable.");
    const existing = (await db.select().from(aiAccessBlocks).where(eq(aiAccessBlocks.visitorId, input.visitorId)).limit(1))[0];
    if (existing) await db.update(aiAccessBlocks).set({ isActive: input.isBlocked ? 1 : 0, reason: input.reason ?? null }).where(eq(aiAccessBlocks.visitorId, input.visitorId));
    else await db.insert(aiAccessBlocks).values({ visitorId: input.visitorId, isActive: input.isBlocked ? 1 : 0, reason: input.reason ?? null });
    return { success: true };
  }),
  createVipAccount: ownerProcedure.input(z.object({ username: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9._-]+$/), password: z.string().min(8).max(128), displayName: z.string().trim().max(120).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("VIP_ACCOUNT_SERVICE_UNAVAILABLE");
    const username = normalizeVipUsername(input.username);
    const existing = (await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1))[0];
    if (existing) throw new Error("VIP_ID_ALREADY_EXISTS");
    const openId = `vip:${randomUUID()}`;
    await db.insert(users).values({ openId, username, passwordHash: hashVipPassword(input.password), name: input.displayName || null, loginMethod: "vip_password", role: "vip", isActive: 1 });
    return { success: true, username };
  }),
  updateVipAccount: ownerProcedure.input(z.object({ userId: z.number().int().positive(), isActive: z.boolean().optional(), displayName: z.string().trim().max(120).nullable().optional(), newPassword: z.string().min(8).max(128).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("VIP_ACCOUNT_SERVICE_UNAVAILABLE");
    const account = (await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!account || account.role !== "vip") throw new Error("VIP_ACCOUNT_NOT_FOUND");
    const set: Record<string, unknown> = {};
    if (input.isActive !== undefined) set.isActive = input.isActive ? 1 : 0;
    if (input.displayName !== undefined) set.name = input.displayName;
    if (input.newPassword) set.passwordHash = hashVipPassword(input.newPassword);
    if (Object.keys(set).length) await db.update(users).set(set).where(eq(users.id, input.userId));
    return { success: true };
  }),
  createAdminAccount: ownerOnlyProcedure.input(z.object({ username: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9._-]+$/), password: z.string().min(8).max(128), displayName: z.string().trim().max(120).optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("ADMIN_ACCOUNT_SERVICE_UNAVAILABLE");
    const username = normalizeVipUsername(input.username);
    const existing = (await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1))[0];
    if (existing) throw new Error("ADMIN_ID_ALREADY_EXISTS");
    await db.insert(users).values({ openId: `admin:${randomUUID()}`, username, passwordHash: hashVipPassword(input.password), name: input.displayName || null, loginMethod: "admin_password", role: "admin", isActive: 1 });
    return { success: true, username };
  }),
  updateAdminAccount: ownerOnlyProcedure.input(z.object({ userId: z.number().int().positive(), isActive: z.boolean().optional(), displayName: z.string().trim().max(120).nullable().optional(), newPassword: z.string().min(8).max(128).optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("ADMIN_ACCOUNT_SERVICE_UNAVAILABLE");
    const account = (await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
    if (!account || account.role !== "admin") throw new Error("ADMIN_ACCOUNT_NOT_FOUND");
    const set: Record<string, unknown> = {};
    if (input.isActive !== undefined) set.isActive = input.isActive ? 1 : 0;
    if (input.displayName !== undefined) set.name = input.displayName;
    if (input.newPassword) set.passwordHash = hashVipPassword(input.newPassword);
    if (Object.keys(set).length) await db.update(users).set(set).where(eq(users.id, input.userId));
    return { success: true };
  }),
  settings: ownerProcedure.query(async () => {
    const settings = await getCentralSettings();
    return { ...settings, estimatedCostsAreConfigOnly: true };
  }),
  updateSettings: ownerProcedure.input(z.object({ generationEnabled: z.boolean().optional(), normalAiGenerationLimit: z.number().int().min(0).max(100).optional(), normalStyleMatchLimit: z.number().int().min(0).max(100).optional(), normalStyleMatchEnabled: z.boolean().optional(), quickAiAdminOnly: z.boolean().optional(), liyingAiVipEnabled: z.boolean().optional(), curatedOutfitsPriority: z.boolean().optional(), dailyAiRequestLimit: z.number().int().min(0).max(100_000).optional(), monthlyAiBudgetFen: cnyFen.optional(), stopAiAtBudgetLimit: z.boolean().optional(), monthlyActualAiCostFen: cnyFen.nullable().optional(), aiBodyModelEstimatedCostFen: cnyFen.optional(), aiFittingEstimatedCostFen: cnyFen.optional(), quickFitEstimatedCostFen: cnyFen.optional(), regenerationEstimatedCostFen: cnyFen.optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Operations data is temporarily unavailable.");
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) if (value !== undefined) set[key] = typeof value === "boolean" ? (value ? 1 : 0) : value;
    if (Object.keys(set).length) await db.update(releaseSettings).set(set).where(eq(releaseSettings.id, 1));
    return getCentralSettings();
  }),
  redeemHistory: ownerProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Operations data is temporarily unavailable.");
    const codes = await db.select({ id: redeemCodes.id, status: redeemCodes.status, catalogTier: redeemCodes.catalogTier, generationAllowance: redeemCodes.generationAllowance, isUnlimited: redeemCodes.isUnlimited, maxUses: redeemCodes.maxUses, usedCount: redeemCodes.usedCount, campaign: redeemCodes.campaign, note: redeemCodes.note, expiresAt: redeemCodes.expiresAt, createdAt: redeemCodes.createdAt }).from(redeemCodes).orderBy(desc(redeemCodes.createdAt));
    return codes;
  }),
});
