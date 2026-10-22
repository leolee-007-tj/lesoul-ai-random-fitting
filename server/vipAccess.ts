import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { ENV } from "./_core/env";

export const VIP_ACCESS_COOKIE = "lesoul_vip_access";
export const VIP_ACCESS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
export const ADMIN_ACCESS_COOKIE = "lesoul_admin_access";
export const ADMIN_ACCESS_MAX_AGE_MS = VIP_ACCESS_MAX_AGE_MS;

type VipSessionPayload = { userId: number; openId: string; expiresAt: number };

function secret() { return ENV.cookieSecret || process.env.JWT_SECRET || ""; }
function equal(left: string, right: string) {
  const leftBytes = Buffer.from(left); const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function verifyBootstrapSecret(candidate: string) {
  const expected = process.env.LESOUL_OWNER_BOOTSTRAP_SECRET ?? "";
  return Boolean(expected) && equal(candidate, expected);
}
function sign(payload: string) {
  const key = secret();
  if (!key) throw new Error("VIP_SESSION_UNAVAILABLE");
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function normalizeVipUsername(value: string) { return value.trim().toLowerCase(); }
export function hashVipPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const digest = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${digest}`;
}
export function verifyVipPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [scheme, salt, digest, ...extra] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !digest || extra.length) return false;
  return equal(scryptSync(password, salt, 64).toString("base64url"), digest);
}

export function createVipAccessToken(input: { userId: number; openId: string }, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ ...input, expiresAt: now + VIP_ACCESS_MAX_AGE_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function readVipAccessSession(req: Request): VipSessionPayload | null {
  const token = parseCookieHeader(req.headers.cookie ?? "")[VIP_ACCESS_COOKIE];
  if (!token) return null;
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length || !secret()) return null;
  try {
    if (!equal(signature, sign(payload))) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<VipSessionPayload>;
    if (!Number.isInteger(decoded.userId) || !decoded.openId || typeof decoded.expiresAt !== "number" || decoded.expiresAt <= Date.now()) return null;
    return decoded as VipSessionPayload;
  } catch { return null; }
}

export function createAdminAccessToken(input: { userId: number; openId: string }, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ ...input, expiresAt: now + ADMIN_ACCESS_MAX_AGE_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readAdminAccessSession(req: Request): VipSessionPayload | null {
  const token = parseCookieHeader(req.headers.cookie ?? "")[ADMIN_ACCESS_COOKIE];
  if (!token) return null;
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length || !secret()) return null;
  try {
    if (!equal(signature, sign(payload))) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<VipSessionPayload>;
    if (!Number.isInteger(decoded.userId) || !decoded.openId || typeof decoded.expiresAt !== "number" || decoded.expiresAt <= Date.now()) return null;
    return decoded as VipSessionPayload;
  } catch { return null; }
}
