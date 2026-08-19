import { createHmac, timingSafeEqual } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { ENV } from "./_core/env";

export const TEST_ACCESS_COOKIE = "lesoul_test_access";
const TEST_ACCESS_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type TestAccessSession = {
  visitorId: string;
  expiresAt: number;
};

function configuredLogin() {
  return {
    // Public test credentials stay server-side. Deployment secrets can override
    // them without shipping either value to browser code.
    username: process.env.LESOUL_TEST_LOGIN_ID ?? "lesoul",
    password: process.env.LESOUL_TEST_LOGIN_PASSWORD ?? "8888",
  };
}

function secret() {
  return ENV.cookieSecret || process.env.JWT_SECRET || "";
}

function equal(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function sign(payload: string) {
  const key = secret();
  if (!key) throw new Error("TEST_ACCESS_SESSION_UNAVAILABLE");
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function isValidVisitorId(visitorId: string) {
  return /^[A-Za-z0-9_-]{8,96}$/.test(visitorId);
}

export function verifyTestLogin(username: string, password: string) {
  const configured = configuredLogin();
  return Boolean(configured.username && configured.password && equal(username, configured.username) && equal(password, configured.password));
}

export function createTestAccessToken(visitorId: string, now = Date.now()) {
  if (!isValidVisitorId(visitorId)) throw new Error("INVALID_VISITOR_ID");
  const payload = Buffer.from(JSON.stringify({ visitorId, expiresAt: now + TEST_ACCESS_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readTestAccessSession(req: Request): TestAccessSession | null {
  const token = parseCookieHeader(req.headers.cookie ?? "")[TEST_ACCESS_COOKIE];
  if (!token) return null;
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length || !secret()) return null;
  let expected: string;
  try { expected = sign(payload); } catch { return null; }
  if (!equal(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<TestAccessSession>;
    if (!parsed.visitorId || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now() || !isValidVisitorId(parsed.visitorId)) return null;
    return { visitorId: parsed.visitorId, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export const TEST_ACCESS_MAX_AGE_MS = TEST_ACCESS_TTL_MS;
