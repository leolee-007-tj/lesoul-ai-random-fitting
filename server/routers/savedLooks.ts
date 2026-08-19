import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { savedLooks } from "../../drizzle/schema";
import { getDb } from "../db";
import { customerProcedure, router } from "../_core/trpc";

const lookSnapshot = z.object({
  id: z.string().min(1).max(96),
  lookCode: z.string().min(1).max(48),
  imageUrl: z.string().min(1),
  snapshot: z.unknown(),
});

export const savedLooksRouter = router({
  list: customerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    if (ctx.testAccess) {
      return db.select().from(savedLooks).where(eq(savedLooks.visitorId, ctx.testAccess.visitorId)).orderBy(desc(savedLooks.createdAt));
    }
    return db.select().from(savedLooks).where(eq(savedLooks.userId, ctx.user!.id)).orderBy(desc(savedLooks.createdAt));
  }),
  sync: customerProcedure.input(lookSnapshot).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    const visitorId = ctx.testAccess?.visitorId ?? `account:${ctx.user!.openId}`;
    await db.insert(savedLooks).values({ userId: ctx.testAccess ? null : ctx.user!.id, visitorId, lookId: input.id, lookCode: input.lookCode, imageUrl: input.imageUrl, snapshot: input.snapshot }).onDuplicateKeyUpdate({ set: { lookCode: input.lookCode, imageUrl: input.imageUrl, snapshot: input.snapshot } });
    return { success: true };
  }),
  remove: customerProcedure.input(z.object({ lookId: z.string().min(1).max(96) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    const ownership = ctx.testAccess ? and(eq(savedLooks.visitorId, ctx.testAccess.visitorId), eq(savedLooks.lookId, input.lookId)) : and(eq(savedLooks.userId, ctx.user!.id), eq(savedLooks.lookId, input.lookId));
    await db.delete(savedLooks).where(ownership);
    return { success: true };
  }),
  clear: customerProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Saved looks are temporarily unavailable.");
    await db.delete(savedLooks).where(ctx.testAccess ? eq(savedLooks.visitorId, ctx.testAccess.visitorId) : eq(savedLooks.userId, ctx.user!.id));
    return { success: true };
  }),
});
