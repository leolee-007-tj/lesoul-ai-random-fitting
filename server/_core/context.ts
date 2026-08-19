import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { readTestAccessSession, type TestAccessSession } from "../testAccess";

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
