import { z } from "zod";
import { customerProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";

export const profileInput = z.object({
  visitorId: z.string().min(1).max(96),
  modelKey: z.string().min(8).max(48).optional(),
  heightCm: z.number().int().min(140).max(200),
  weightKg: z.number().int().min(40).max(180),
  bustCm: z.number().int().min(60).max(160).nullable().optional(),
  waistCm: z.number().int().min(45).max(140).nullable().optional(),
  hipCm: z.number().int().min(60).max(170).nullable().optional(),
  genderPresentation: z.literal("female").default("female"),
  bodyShape: z.enum(["slim", "straight", "curvy", "petite", "tall", "plus", "custom"]).default("custom"),
  hairLength: z.enum(["short", "medium", "long"]).default("medium"),
  hairStyle: z.enum(["straight", "natural_wave", "bob"]).default("straight"),
  hairColor: z.enum(["black", "dark_brown", "brown", "light_brown"]).default("dark_brown"),
  skinTone: z.enum(["light", "light_medium", "medium", "medium_deep", "deep"]).default("light_medium"),
  consent: z.literal(true),
});

/** Retained only for validation of historical inputs; it is never sent to an image service. */
export const modelPrompt = (input: z.infer<typeof profileInput>) => `Personal fashion model creation is retired. Submitted height ${input.heightCm} cm and weight ${input.weightKg} kg are not sent to an image-generation service.`;

const retired = () => { throw new Error("IMAGE_MODEL_RETIRED_USE_CURATED_LOOKS"); };

export const bodyModelRouter = router({
  liyingReferenceModels: customerProcedure.query(async () => ({ imageUrls: {} })),
  create: customerProcedure.input(profileInput).mutation(async ({ input, ctx }) => {
    resolveCustomerVisitorId(ctx, input.visitorId);
    return retired();
  }),
  approve: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), modelId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
    resolveCustomerVisitorId(ctx, input.visitorId);
    return retired();
  }),
  latest: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96) })).query(async ({ input, ctx }) => {
    resolveCustomerVisitorId(ctx, input.visitorId);
    return null;
  }),
});
