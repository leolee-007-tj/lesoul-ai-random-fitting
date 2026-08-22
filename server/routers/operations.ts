import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { aiAccessBlocks, aiUsageEvents, productShareVisits, products, redeemCodes, releaseSettings, trialStoreProducts, trialStores, users, visitorEntitlements } from "../../drizzle/schema";
import { getDb } from "../db";
import { getCentralEntitlement, getCentralSettings } from "../aiUsageController";
import { isPrimaryOperator, ownerOnlyProcedure, ownerProcedure, publicProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { hashVipPassword, normalizeVipUsername } from "../vipAccess";
import { anonymousNickname } from "../../shared/anonymousNickname";
import { resolveAiProviderStatus } from "../../shared/aiProvider";
import { TRIAL_STORE_DURATION_MS } from "../trialStore";
import { decodeImageDataUrl, MAX_PRODUCT_IMAGE_BYTES } from "./uploads";
import { storagePut } from "../storage";
import { getLiyingReferenceImageUrls, LIYING_REFERENCE_MODEL_KEYS } from "../liyingReferenceModels";

const rangeSchema = z.enum(["today", "7d", "30d", "all"]).default("30d");
const cnyFen = z.number().int().min(0).max(10_000_000_00);
const liyingModelKey = z.enum(["petite", "balanced", "volume"]);
const startFor = (range: z.infer<typeof rangeSchema>) => {
  const now = new Date();
  if (range === "today") { now.setUTCHours(0, 0, 0, 0); return now; }
  if (range === "7d") return new Date(Date.now() - 7 * 86400000);
  if (range === "30d") return new Date(Date.now() - 30 * 86400000);
  return null;
};
const billableStatuses = ["REQUESTED", "SUCCESS", "FAILED", "CANCELLED"] as const;
const featureLabel = (feature: string) => ({ AI_BODY_MODEL: "AI Body Model", AI_FITTING: "AI Fitting", LIYING_AI: "李瀛 AI", QUICK_FIT: "Quick AI", REGENERATION: "Regeneration", AI_STYLIST: "AI Style Match" }[feature] ?? feature);
const paidExtensionInput = z.object({
  storeId: z.number().int().positive(),
  months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]).optional(),
  expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((value) => Boolean(value.months) !== Boolean(value.expiresOn), { message: "Choose one extension period." });

function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function endOfUtcDate(value: string) {
  return new Date(`${value}T23:59:59.999Z`);
}

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
      db.select({ id: users.id, openId: users.openId, username: users.username, name: users.name, email: users.email, role: users.role, isActive: users.isActive, adminTrialStartedAt: users.adminTrialStartedAt, adminTrialDurationHours: users.adminTrialDurationHours, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)),
      db.select().from(aiUsageEvents).orderBy(desc(aiUsageEvents.startedAt)),
      db.select().from(aiAccessBlocks),
    ]);
    const usageByVisitor = new Map<string, typeof events>();
    events.forEach((event) => usageByVisitor.set(event.visitorId, [...(usageByVisitor.get(event.visitorId) ?? []), event]));
    const blockByVisitor = new Map(blocks.map((block) => [block.visitorId, block]));
    const accounts = await Promise.all(registered.map(async (account) => {
      const visitorId = `account:${account.openId}`; const usage = usageByVisitor.get(visitorId) ?? []; const entitlement = await getCentralEntitlement(visitorId);
      const usageByFeature = Object.fromEntries(Array.from(new Set(usage.map((event) => event.featureType))).map((feature) => [feature, usage.filter((event) => event.featureType === feature).length]));
      const displayName = account.name?.trim() || anonymousNickname(`account:${account.role}:${account.username || account.openId}`, input.locale);
      return { kind: "account" as const, visitorId, displayName, user: account, aiRequestCount: usage.length, usageByFeature, latestAiRequestAt: usage[0]?.startedAt ?? null, isVip: account.role === "vip", generationAllowance: entitlement?.generationAllowance ?? null, generationUsed: entitlement?.generationUsed ?? null, entitlementExpiresAt: entitlement?.expiresAt ?? null, isBlocked: Boolean(blockByVisitor.get(visitorId)?.isActive), blockReason: blockByVisitor.get(visitorId)?.reason ?? null };
    }));
    const visitorAggregates = Array.from(usageByVisitor.entries()).filter(([visitorId]) => !visitorId.startsWith("account:")).map(([visitorId, usage]) => ({ kind: "visitor" as const, visitorId, displayName: anonymousNickname(visitorId, input.locale), user: { id: null, openId: null, username: null, name: null, email: null, role: "user", isActive: 1, createdAt: null, lastSignedIn: null }, aiRequestCount: usage.length, latestAiRequestAt: usage[0]?.startedAt ?? null, isVip: false, generationAllowance: null, generationUsed: null, entitlementExpiresAt: null, isBlocked: Boolean(blockByVisitor.get(visitorId)?.isActive), blockReason: blockByVisitor.get(visitorId)?.reason ?? null }));
    return { accounts, visitors: visitorAggregates };
  }),
  ownerStatus: publicProcedure.query(({ ctx }) => ({ isOwner: Boolean(ctx.user && isPrimaryOperator(ctx.user)) })),
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
  trialStores: ownerOnlyProcedure.query(async () => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const stores = await db.select({ id: trialStores.id, ownerUserId: trialStores.ownerUserId, status: trialStores.status, storeName: trialStores.storeName, startedAt: trialStores.startedAt, expiresAt: trialStores.expiresAt, resetAt: trialStores.resetAt, username: users.username, displayName: users.name, isActive: users.isActive }).from(trialStores).innerJoin(users, eq(trialStores.ownerUserId, users.id)).orderBy(desc(trialStores.createdAt));
    return stores;
  }),
  createTrialStore: ownerOnlyProcedure.input(z.object({ username: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9._-]+$/), password: z.string().min(8).max(128), displayName: z.string().trim().max(120).optional(), storeName: z.string().trim().min(1).max(80).optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const username = normalizeVipUsername(input.username);
    const existing = (await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1))[0];
    if (existing) throw new Error("TRIAL_STORE_ID_ALREADY_EXISTS");
    const now = new Date(); const expiresAt = new Date(now.getTime() + TRIAL_STORE_DURATION_MS);
    await db.transaction(async (tx) => {
      const inserted = await tx.insert(users).values({ openId: `trial:${randomUUID()}`, username, passwordHash: hashVipPassword(input.password), name: input.displayName || null, loginMethod: "trial_store_password", role: "store_trial", isActive: 1 });
      const userId = Number((inserted as any).insertId);
      await tx.insert(trialStores).values({ ownerUserId: userId, storeName: input.storeName || "MY TRIAL STORE", startedAt: now, expiresAt });
    });
    return { success: true, username, expiresAt };
  }),
  resetTrialStore: ownerOnlyProcedure.input(z.object({ storeId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = (await db.select().from(trialStores).where(eq(trialStores.id, input.storeId)).limit(1))[0];
    if (!store) throw new Error("TRIAL_STORE_NOT_FOUND");
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx.delete(trialStoreProducts).where(eq(trialStoreProducts.storeId, store.id));
      await tx.update(trialStores).set({ status: "ACTIVE", storeName: "MY TRIAL STORE", paymentQrUrl: null, purchaseNotice: null, startedAt: now, expiresAt: new Date(now.getTime() + TRIAL_STORE_DURATION_MS), resetAt: now }).where(eq(trialStores.id, store.id));
      await tx.update(users).set({ isActive: 1 }).where(eq(users.id, store.ownerUserId));
    });
    return { success: true };
  }),
  extendTrialStoreAccess: ownerOnlyProcedure.input(paidExtensionInput).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = (await db.select().from(trialStores).where(eq(trialStores.id, input.storeId)).limit(1))[0];
    if (!store) throw new Error("TRIAL_STORE_NOT_FOUND");
    const now = new Date();
    const base = store.expiresAt.getTime() > now.getTime() ? store.expiresAt : now;
    const expiresAt = input.months ? addCalendarMonths(base, input.months) : endOfUtcDate(input.expiresOn!);
    if (expiresAt.getTime() <= now.getTime()) throw new Error("TRIAL_STORE_EXPIRY_MUST_BE_FUTURE");
    await db.transaction(async (tx) => {
      await tx.update(trialStores).set({ status: "ACTIVE", expiresAt }).where(eq(trialStores.id, store.id));
      await tx.update(users).set({ isActive: 1 }).where(eq(users.id, store.ownerUserId));
    });
    return { success: true, storeId: store.id, expiresAt, retainedWorkspace: store.status === "ACTIVE" && store.expiresAt.getTime() > now.getTime() };
  }),
  setTrialStoreActive: ownerOnlyProcedure.input(z.object({ storeId: z.number().int().positive(), isActive: z.boolean() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = (await db.select().from(trialStores).where(eq(trialStores.id, input.storeId)).limit(1))[0];
    if (!store) throw new Error("TRIAL_STORE_NOT_FOUND");
    await db.update(users).set({ isActive: input.isActive ? 1 : 0 }).where(eq(users.id, store.ownerUserId));
    return { success: true };
  }),
  settings: ownerProcedure.query(async () => {
    const settings = await getCentralSettings();
    return { ...settings, estimatedCostsAreConfigOnly: true };
  }),
  liyingReferenceModels: ownerOnlyProcedure.query(async () => ({ imageUrls: await getLiyingReferenceImageUrls() })),
  uploadLiyingReferenceImage: ownerOnlyProcedure.input(z.object({ modelKey: liyingModelKey, dataUrl: z.string().min(40).max(30_000_000) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("LIYING_REFERENCE_SERVICE_UNAVAILABLE");
    const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES);
    const { url } = await storagePut(`lesoul/liying-reference-models/${input.modelKey}/${randomUUID()}.${extension}`, buffer, mimeType);
    const current = await getLiyingReferenceImageUrls();
    const imageUrls = { ...current, [input.modelKey]: url };
    await db.update(releaseSettings).set({ liyingReferenceImageUrls: imageUrls }).where(eq(releaseSettings.id, 1));
    return { imageUrls, updatedModelKey: input.modelKey };
  }),
  providerStatus: ownerProcedure.query(async () => {
    const settings = await getCentralSettings();
    // Qwen credentials have intentionally not been supplied yet. Do not make
    // outbound calls or infer a connection from a client-side setting.
    const qwenConfigured = false;
    return {
      qwenConfigured,
      image: resolveAiProviderStatus(settings.aiImageProviderPreference, qwenConfigured),
      text: resolveAiProviderStatus(settings.aiTextProviderPreference, qwenConfigured),
      qwenEndpoint: "Beijing / China region",
    };
  }),
  productShareAnalytics: ownerProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Product share analytics are temporarily unavailable.");
    const rows = await db.select({ productId: productShareVisits.productId, visits: count() }).from(productShareVisits).groupBy(productShareVisits.productId).orderBy(desc(count()));
    if (!rows.length) return { total: 0, products: [] };
    const productRows = await db.select({ id: products.id, name: products.name, nameEn: products.nameEn, nameKo: products.nameKo, nameZh: products.nameZh, imageUrl: products.imageUrl, imageViews: products.imageViews }).from(products).where(inArray(products.id, rows.map((item) => item.productId)));
    const productsById = new Map(productRows.map((item) => [item.id, item]));
    const ranked = rows.flatMap((item) => {
      const product = productsById.get(item.productId);
      return product ? [{ product, visits: Number(item.visits) }] : [];
    });
    return { total: ranked.reduce((sum, item) => sum + item.visits, 0), products: ranked };
  }),
  updateSettings: ownerProcedure.input(z.object({ generationEnabled: z.boolean().optional(), normalAiGenerationLimit: z.number().int().min(0).max(100).optional(), normalStyleMatchLimit: z.number().int().min(0).max(100).optional(), normalStyleMatchEnabled: z.boolean().optional(), quickAiAdminOnly: z.boolean().optional(), liyingAiVipEnabled: z.boolean().optional(), curatedOutfitsPriority: z.boolean().optional(), aiImageProviderPreference: z.enum(["FORGE", "QWEN"]).optional(), aiTextProviderPreference: z.enum(["FORGE", "QWEN"]).optional(), dailyAiRequestLimit: z.number().int().min(0).max(100_000).optional(), monthlyAiBudgetFen: cnyFen.optional(), stopAiAtBudgetLimit: z.boolean().optional(), monthlyActualAiCostFen: cnyFen.nullable().optional(), aiBodyModelEstimatedCostFen: cnyFen.optional(), aiFittingEstimatedCostFen: cnyFen.optional(), quickFitEstimatedCostFen: cnyFen.optional(), regenerationEstimatedCostFen: cnyFen.optional() })).mutation(async ({ input }) => {
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
