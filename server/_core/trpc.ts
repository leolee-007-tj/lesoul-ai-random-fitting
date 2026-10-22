import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ENV } from "./env";
import { getAdminTrialStatus } from "../adminTrial";
import { requireActiveTrialStore } from "../trialStore";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export function resolveCustomerVisitorId(ctx: TrpcContext, requestedVisitorId: string) {
  if (ctx.testAccess) {
    if (ctx.testAccess.visitorId !== requestedVisitorId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "VISITOR_OWNERSHIP_MISMATCH" });
    }
    return ctx.testAccess.visitorId;
  }
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  if (ctx.user.role === "store_display") {
    throw new TRPCError({ code: "FORBIDDEN", message: "STORE_DISPLAY_READ_ONLY" });
  }
  const accountVisitorId = `account:${ctx.user.openId}`;
  if (requestedVisitorId !== accountVisitorId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "ACCOUNT_OWNERSHIP_MISMATCH" });
  }
  return accountVisitorId;
}

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/** A store display is intentionally limited to the managed catalogue and local greeting screen. */
export const storeDisplayProcedure = t.procedure.use(
  t.middleware(async opts => {
    if (!opts.ctx.user || opts.ctx.user.role !== "store_display") throw new TRPCError({ code: "FORBIDDEN", message: "STORE_DISPLAY_ONLY" });
    return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
  }),
);

export function isPrimaryOperator(user: NonNullable<TrpcContext["user"]>) {
  return Boolean((ENV.ownerOpenId && user.openId === ENV.ownerOpenId) || (user.role === "admin" && user.isPrimaryAdmin));
}

export const trialStoreSessionProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "store_trial") throw new TRPCError({ code: "FORBIDDEN", message: "NOT_TRIAL_STORE" });
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const trialStoreProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "store_trial") throw new TRPCError({ code: "FORBIDDEN", message: "NOT_TRIAL_STORE" });
    try { await requireActiveTrialStore(ctx.user.id); }
    catch (error) { throw new TRPCError({ code: "FORBIDDEN", message: error instanceof Error && error.message === "TRIAL_STORE_EXPIRED" ? "TRIAL_STORE_EXPIRED" : "TRIAL_STORE_UNAVAILABLE" }); }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

async function ensureActiveAdministratorTrial(user: NonNullable<TrpcContext["user"]>) {
  // The configured owner or established primary owner is permanent. The
  // fallback is essential in production environments where OWNER_OPEN_ID is
  // unavailable at request time but the owner row is already marked primary.
  if (isPrimaryOperator(user)) return;
  const trial = await getAdminTrialStatus(user.id, true);
  if (trial.status === "expired") throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_TRIAL_EXPIRED" });
}

/** Customer operations require either the isolated browser-bound test session or an existing signed-in account. */
export const customerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user && !ctx.testAccess) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }
    if (ctx.user?.role === "store_display") {
      throw new TRPCError({ code: "FORBIDDEN", message: "STORE_DISPLAY_READ_ONLY" });
    }
    return next({ ctx });
  }),
);

/** Read-only customer catalog queries also serve store-display accounts. */
export const customerReadProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user && !ctx.testAccess) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }
    return next({ ctx });
  }),
);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    await ensureActiveAdministratorTrial(ctx.user);

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/** Product catalog management is available to the configured project owner even
 * when their account has not separately been promoted to the admin role. */
export const ownerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    const isOwner = Boolean(ctx.user && isPrimaryOperator(ctx.user));
    if (!ctx.user || !isPrimaryOperator(ctx.user)) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    await ensureActiveAdministratorTrial(ctx.user);
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

/** Only the configured workspace owner may administer other password-based ADMIN accounts. */
export const ownerOnlyProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    const isOwner = Boolean(ctx.user && isPrimaryOperator(ctx.user));
    if (!isOwner || !ctx.user) throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    await ensureActiveAdministratorTrial(ctx.user);
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
