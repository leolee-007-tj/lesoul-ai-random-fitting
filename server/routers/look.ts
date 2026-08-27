import { z } from "zod";
import { customerProcedure, publicProcedure, router } from "../_core/trpc";
import { getGenerationLog, getGenerationPerformance } from "../db";

const retiredGenerationInput = z.object({
  visitorId: z.string().min(1).max(96),
  generationId: z.string().uuid().optional(),
}).passthrough();

/**
 * Historical generated LOOK records remain readable, but new image generation
 * has been retired from LESOUL. Product recommendations are curated separately.
 */
export const lookRouter = router({
  generate: customerProcedure.input(retiredGenerationInput).mutation(async () => {
    throw new Error("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
  }),
  status: publicProcedure.input(z.object({ generationId: z.string().uuid() })).query(async ({ input }) => {
    const log = await getGenerationLog(input.generationId);
    if (log) return log;
    return {
      requestId: input.generationId,
      status: "not_found" as const,
      resultImageUrl: null,
      errorMessage: null,
      durationMs: null,
      validationStatus: "not_enabled" as const,
    };
  }),
  performance: publicProcedure.query(getGenerationPerformance),
});
