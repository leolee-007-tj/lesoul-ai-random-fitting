import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { users } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { sdk } from "./sdk";
import { readTestAccessSession, type TestAccessSession } from "../testAccess";
import { getDb } from "../db";
import { readVipAccessSession } from "../vipAccess";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  testAccess: TestAccessSession | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    const vipSession = readVipAccessSession(opts.req);
    if (vipSession) {
      const db = await getDb();
      const vipAccount = db ? (await db.select().from(users).where(and(eq(users.id, vipSession.userId), eq(users.openId, vipSession.openId), eq(users.role, "vip"), eq(users.isActive, 1))).limit(1))[0] : null;
      user = vipAccount ?? null;
    }
  }

  // A real authenticated account always wins. A stale public-test cookie must
  // never turn VIP, owner, or administrator data into visitor-scoped data.
  const testAccess = user ? null : readTestAccessSession(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    testAccess,
  };
}
