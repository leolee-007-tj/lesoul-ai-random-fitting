import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createTestAccessToken, TEST_ACCESS_COOKIE, TEST_ACCESS_MAX_AGE_MS, verifyTestLogin } from "./testAccess";
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
    me: publicProcedure.query(opts => opts.ctx.user),
    testSession: publicProcedure.query(({ ctx }) => ctx.testAccess ? { active: true, visitorId: ctx.testAccess.visitorId } : { active: false, visitorId: null }),
    testLogin: publicProcedure.input(z.object({ username: z.string().trim().min(1).max(48), password: z.string().min(1).max(96), visitorId: z.string().min(8).max(96) })).mutation(({ ctx, input }) => {
      if (!verifyTestLogin(input.username, input.password)) {
        return { success: false as const };
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(TEST_ACCESS_COOKIE, createTestAccessToken(input.visitorId), { ...cookieOptions, maxAge: TEST_ACCESS_MAX_AGE_MS });
      return { success: true as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(TEST_ACCESS_COOKIE, { ...cookieOptions, maxAge: -1 });
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
