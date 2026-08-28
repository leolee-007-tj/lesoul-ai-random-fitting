import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { isPrimaryOperator, publicProcedure, router } from "./_core/trpc";
import { createTestAccessToken, TEST_ACCESS_COOKIE, TEST_ACCESS_MAX_AGE_MS, verifyTestLogin, VISITOR_ID_COOKIE, VISITOR_ID_MAX_AGE_MS, readPersistedVisitorId } from "./testAccess";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACCESS_MAX_AGE_MS, createAdminAccessToken, createVipAccessToken, hashVipPassword, normalizeVipUsername, verifyBootstrapSecret, verifyVipPassword, VIP_ACCESS_COOKIE, VIP_ACCESS_MAX_AGE_MS } from "./vipAccess";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { catalogRouter, generationRouter } from "./routers/catalog";
import { uploadRouter } from "./routers/uploads";
import { adminRouter } from "./routers/admin";
import { lookRouter } from "./routers/look";
import { stylistRouter } from "./routers/stylist";
import { accessRouter } from "./routers/access";
import { bodyModelRouter } from "./routers/bodyModel";
import { savedLooksRouter } from "./routers/savedLooks";
import { purchaseRouter } from "./routers/purchase";
import { operationsRouter } from "./routers/operations";
import { adminTrialRouter } from "./routers/adminTrial";
import { trialStoreRouter } from "./routers/trialStore";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      const user = opts.ctx.user;
      if (!user) return null;
      // The configured project owner is the sole permanent administrator. This
      // response-level normalization guarantees an OAuth callback cannot briefly
      // render owner navigation as NORMAL while a stale database role is healing.
      return { id: user.id, openId: user.openId, name: user.name, email: user.email, loginMethod: user.loginMethod, role: isPrimaryOperator(user) ? "admin" : user.role, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt, lastSignedIn: user.lastSignedIn };
    }),
    testSession: publicProcedure.query(({ ctx }) => ctx.testAccess ? { active: true, visitorId: ctx.testAccess.visitorId } : { active: false, visitorId: null }),
    guestLogin: publicProcedure.input(z.object({ visitorId: z.string().min(8).max(96) })).mutation(({ ctx, input }) => {
      const visitorId = readPersistedVisitorId(ctx.req) ?? input.visitorId;
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(VISITOR_ID_COOKIE, visitorId, { ...cookieOptions, maxAge: VISITOR_ID_MAX_AGE_MS });
      ctx.res.cookie(TEST_ACCESS_COOKIE, createTestAccessToken(visitorId), { ...cookieOptions, maxAge: TEST_ACCESS_MAX_AGE_MS });
      return { success: true as const, visitorId };
    }),
    testLogin: publicProcedure.input(z.object({ username: z.string().trim().min(1).max(48), password: z.string().min(1).max(96), visitorId: z.string().min(8).max(96) })).mutation(({ ctx, input }) => {
      if (!verifyTestLogin(input.username, input.password)) {
        return { success: false as const };
      }
      const visitorId = readPersistedVisitorId(ctx.req) ?? input.visitorId;
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Keep identity recovery separate from authentication: logout clears the
      // access token, but this long-lived cookie preserves the visitor's data
      // when the browser's local storage is reset.
      ctx.res.cookie(VISITOR_ID_COOKIE, visitorId, { ...cookieOptions, maxAge: VISITOR_ID_MAX_AGE_MS });
      ctx.res.cookie(TEST_ACCESS_COOKIE, createTestAccessToken(visitorId), { ...cookieOptions, maxAge: TEST_ACCESS_MAX_AGE_MS });
      return { success: true as const, visitorId };
    }),
    vipLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("VIP_LOGIN_UNAVAILABLE");
      const account = (await db.select().from(users).where(eq(users.username, normalizeVipUsername(input.username))).limit(1))[0];
      if (!account || account.role !== "vip" || !verifyVipPassword(input.password, account.passwordHash)) return { success: false as const, reason: "invalid" as const };
      if (!account.isActive) return { success: false as const, reason: "inactive" as const };
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(VIP_ACCESS_COOKIE, createVipAccessToken({ userId: account.id, openId: account.openId }), { ...cookieOptions, maxAge: VIP_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    storeDisplayLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("STORE_DISPLAY_LOGIN_UNAVAILABLE");
      const account = (await db.select().from(users).where(eq(users.username, normalizeVipUsername(input.username))).limit(1))[0];
      if (!account || account.role !== "store_display" || !verifyVipPassword(input.password, account.passwordHash)) return { success: false as const, reason: "invalid" as const };
      if (!account.isActive) return { success: false as const, reason: "inactive" as const };
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(VIP_ACCESS_COOKIE, createVipAccessToken({ userId: account.id, openId: account.openId }), { ...cookieOptions, maxAge: VIP_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    adminLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("ADMIN_LOGIN_UNAVAILABLE");
      const account = (await db.select().from(users).where(eq(users.username, normalizeVipUsername(input.username))).limit(1))[0];
      if (!account || account.role !== "admin" || !account.isPrimaryAdmin || !verifyVipPassword(input.password, account.passwordHash)) return { success: false as const, reason: "invalid" as const };
      if (!account.isActive) return { success: false as const, reason: "inactive" as const };
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_ACCESS_COOKIE, createAdminAccessToken({ userId: account.id, openId: account.openId }), { ...cookieOptions, maxAge: ADMIN_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    trialStoreLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("TRIAL_STORE_LOGIN_UNAVAILABLE");
      const account = (await db.select().from(users).where(eq(users.username, normalizeVipUsername(input.username))).limit(1))[0];
      if (!account || account.role !== "store_trial" || !verifyVipPassword(input.password, account.passwordHash)) return { success: false as const, reason: "invalid" as const };
      if (!account.isActive) return { success: false as const, reason: "inactive" as const };
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_ACCESS_COOKIE, createAdminAccessToken({ userId: account.id, openId: account.openId }), { ...cookieOptions, maxAge: ADMIN_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    bootstrapAdmin: publicProcedure.input(z.object({ setupCode: z.string().min(12).max(256), username: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9._-]+$/), password: z.string().min(8).max(128), displayName: z.string().trim().max(120).optional() })).mutation(async ({ ctx, input }) => {
      if (!verifyBootstrapSecret(input.setupCode)) return { success: false as const, reason: "invalid" as const };
      const db = await getDb(); if (!db) throw new Error("ADMIN_BOOTSTRAP_UNAVAILABLE");
      const existingPrimaryAdmin = (await db.select({ id: users.id }).from(users).where(eq(users.isPrimaryAdmin, 1)).limit(1))[0];
      if (existingPrimaryAdmin) return { success: false as const, reason: "used" as const };
      const username = normalizeVipUsername(input.username);
      const duplicate = (await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1))[0];
      if (duplicate) return { success: false as const, reason: "duplicate" as const };
      const openId = `admin:${randomUUID()}`;
      const inserted = await db.insert(users).values({ openId, username, passwordHash: hashVipPassword(input.password), name: input.displayName || null, loginMethod: "admin_password", role: "admin", isActive: 1, isPrimaryAdmin: 1 });
      const userId = Number((inserted as any).insertId);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_ACCESS_COOKIE, createAdminAccessToken({ userId, openId }), { ...cookieOptions, maxAge: ADMIN_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(TEST_ACCESS_COOKIE, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(VISITOR_ID_COOKIE, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(VIP_ACCESS_COOKIE, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(ADMIN_ACCESS_COOKIE, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  catalog: catalogRouter,
  generations: generationRouter,
  uploads: uploadRouter,
  admin: adminRouter,
  look: lookRouter,
  stylist: stylistRouter,
  access: accessRouter,
  bodyModel: bodyModelRouter,
  savedLooks: savedLooksRouter,
  purchase: purchaseRouter,
  operations: operationsRouter,
  adminTrial: adminTrialRouter,
  trialStore: trialStoreRouter,
});

export type AppRouter = typeof appRouter;
