import { z } from "zod";
import { generateFashionLook } from "../fashionProvider";
import { publicProcedure, router } from "../_core/trpc";

const lookRequest = z.object({
  userImage: z.string().min(1),
  pose: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  clothing: z.array(z.object({ id: z.number().int(), name: z.string(), category: z.string(), imageUrl: z.string(), description: z.string() })).min(1),
  background: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  style: z.enum(["RANDOM", "DAILY", "ELEGANT", "CHIC", "CASUAL", "MINIMAL"]),
});

export const lookRouter = router({
  generate: publicProcedure.input(lookRequest).mutation(async ({ input }) => generateFashionLook(input)),
});
