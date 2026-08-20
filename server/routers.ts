import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createTestAccessToken, TEST_ACCESS_COOKIE, TEST_ACCESS_MAX_AGE_MS, verifyTestLogin } from "./testAccess";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACCESS_MAX_AGE_MS, createAdminAccessToken, createVipAccessToken, normalizeVipUsername, verifyVipPassword, VIP_ACCESS_COOKIE, VIP_ACCESS_MAX_AGE_MS } from "./vipAccess";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
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

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? ({ id: opts.ctx.user.id, openId: opts.ctx.user.openId, name: opts.ctx.user.name, email: opts.ctx.user.email, loginMethod: opts.ctx.user.loginMethod, role: opts.ctx.user.role, isActive: opts.ctx.user.isActive, createdAt: opts.ctx.user.createdAt, updatedAt: opts.ctx.user.updatedAt, lastSignedIn: opts.ctx.user.lastSignedIn }) : null),
    testSession: publicProcedure.query(({ ctx }) => ctx.testAccess ? { active: true, visitorId: ctx.testAccess.visitorId } : { active: false, visitorId: null }),
    testLogin: publicProcedure.input(z.object({ username: z.string().trim().min(1).max(48), password: z.string().min(1).max(96), visitorId: z.string().min(8).max(96) })).mutation(({ ctx, input }) => {
      if (!verifyTestLogin(input.username, input.password)) {
        return { success: false as const };
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(TEST_ACCESS_COOKIE, createTestAccessToken(input.visitorId), { ...cookieOptions, maxAge: TEST_ACCESS_MAX_AGE_MS });
      return { success: true as const };
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
    adminLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(64), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("ADMIN_LOGIN_UNAVAILABLE");
      const account = (await db.select().from(users).where(eq(users.username, normalizeVipUsername(input.username))).limit(1))[0];
      if (!account || account.role !== "admin" || !verifyVipPassword(input.password, account.passwordHash)) return { success: false as const, reason: "invalid" as const };
      if (!account.isActive) return { success: false as const, reason: "inactive" as const };
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_ACCESS_COOKIE, createAdminAccessToken({ userId: account.id, openId: account.openId }), { ...cookieOptions, maxAge: ADMIN_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(TEST_ACCESS_COOKIE, { ...cookieOptions, maxAge: -1 });
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
});

export type AppRouter = typeof appRouter;
