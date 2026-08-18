import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { savedLooks } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const lookSnapshot = z.object({
  id: z.string().min(1).max(96),
  lookCode: z.string().min(1).max(48),
  imageUrl: z.string().min(1),
  snapshot: z.unknown(),
});

export const savedLooksRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    return db.select().from(savedLooks).where(eq(savedLooks.userId, ctx.user.id)).orderBy(desc(savedLooks.createdAt));
  }),
  sync: protectedProcedure.input(lookSnapshot).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    await db.insert(savedLooks).values({ userId: ctx.user.id, lookId: input.id, lookCode: input.lookCode, imageUrl: input.imageUrl, snapshot: input.snapshot }).onDuplicateKeyUpdate({ set: { lookCode: input.lookCode, imageUrl: input.imageUrl, snapshot: input.snapshot } });
    return { success: true };
  }),
});
