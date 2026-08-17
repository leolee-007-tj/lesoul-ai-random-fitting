import { z } from "zod";
import { generateFashionLook } from "../fashionProvider";
import { publicProcedure, router } from "../_core/trpc";

const lookRequest = z.object({
  userImage: z.string().min(1),
  pose: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  clothing: z.array(z.object({ id: z.number().int(), name: z.string(), category: z.string(), imageUrl: z.string(), images: z.array(z.string()).nullable().optional(), description: z.string(), color: z.string().nullable().optional(), fabric: z.string().nullable().optional(), texture: z.string().nullable().optional(), fit: z.string().nullable().optional(), length: z.string().nullable().optional(), width: z.string().nullable().optional(), details: z.string().nullable().optional(), neckline: z.string().nullable().optional(), sleeve: z.string().nullable().optional() })).min(1),
  background: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  style: z.enum(["RANDOM", "DAILY", "ELEGANT", "CHIC", "CASUAL", "MINIMAL"]),
  adjustments: z.object({ overallFit: z.enum(["looser", "as_is", "tighter"]).optional(), proportion: z.enum(["shorter_torso", "as_is", "longer_legs"]).optional(), lighting: z.enum(["darker", "as_is", "brighter"]).optional(), items: z.record(z.string(), z.object({ length: z.enum(["shorter", "as_is", "longer"]).optional(), width: z.enum(["narrower", "as_is", "wider"]).optional(), color: z.enum(["muted", "as_is", "vibrant"]).optional(), details: z.enum(["simpler", "as_is", "detailed"]).optional() })).optional() }).optional(),
});

export const lookRouter = router({
  generate: publicProcedure.input(lookRequest).mutation(async ({ input }) => generateFashionLook(input)),
});
