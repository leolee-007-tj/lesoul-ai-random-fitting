import { TRPCError } from "@trpc/server";
import { getAdminTrialStatus } from "../adminTrial";
import { protectedProcedure, router } from "../_core/trpc";

export const adminTrialRouter = router({
  /** This is deliberately not behind the trial gate, so expired administrators can see the renewal notice. */
  status: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_TRIAL_ADMIN_ONLY" });
    return getAdminTrialStatus(true);
  }),
});
