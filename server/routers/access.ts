import { z } from "zod";
import { canGenerate, getReleaseSettings, redeemAccessCode, saveGenerationFeedback } from "../access";
import { publicProcedure, router } from "../_core/trpc";

const visitor = z.string().min(1).max(96);

export const accessRouter = router({
  status: publicProcedure.input(z.object({ visitorId: visitor })).query(async ({ input }) => {
    const [access, settings] = await Promise.all([canGenerate(input.visitorId), getReleaseSettings()]);
    return { ...access, betaCatalogLimit: settings.betaCatalogLimit, betaDailyVisitorLimit: settings.betaDailyVisitorLimit };
  }),
  redeem: publicProcedure.input(z.object({ visitorId: visitor, code: z.string().min(3).max(64) })).mutation(async ({ input }) => redeemAccessCode(input.visitorId, input.code)),
  generationFeedback: publicProcedure.input(z.object({ visitorId: visitor, generationRequestId: z.string().uuid(), feedback: z.enum(["love", "okay", "not_like_me", "garment_inaccurate"]) })).mutation(async ({ input }) => {
    await saveGenerationFeedback(input);
    return { success: true };
  }),
});
