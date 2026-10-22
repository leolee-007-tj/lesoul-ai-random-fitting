import { z } from "zod";
import { canGenerate, getReleaseSettings, saveGenerationFeedback } from "../access";
import { getAiRoleCapabilities, getCustomerLookbookRemaining } from "../aiUsageController";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const visitor = z.string().min(1).max(96);

export const accessRouter = router({
  status: publicProcedure.input(z.object({ visitorId: visitor })).query(async ({ input, ctx }) => {
    const actor = ctx.user ? { openId: ctx.user.openId, role: ctx.user.role } : null;
    const [access, settings, capabilities, customerLookbookRemaining] = await Promise.all([canGenerate(input.visitorId, actor), getReleaseSettings(), getAiRoleCapabilities({ visitorId: input.visitorId, actor }), getCustomerLookbookRemaining(input.visitorId, actor)]);
    return { ...access, capabilities: { ...capabilities, customerLookbookRemaining }, betaCatalogLimit: settings.betaCatalogLimit, betaDailyVisitorLimit: settings.betaDailyVisitorLimit };
  }),
  redeem: protectedProcedure.input(z.object({ code: z.string().min(3).max(64) })).mutation(async () => {
    throw new Error("REDEEM_DISABLED_USE_VIP_ACCOUNT");
  }),
  generationFeedback: publicProcedure.input(z.object({ visitorId: visitor, generationRequestId: z.string().uuid(), feedback: z.enum(["love", "okay", "not_like_me", "garment_inaccurate"]) })).mutation(async ({ input }) => {
    await saveGenerationFeedback(input);
    return { success: true };
  }),
});
