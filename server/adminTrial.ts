import { eq } from "drizzle-orm";
import { releaseSettings, users } from "../drizzle/schema";
import { getReleaseSettings } from "./access";
import { getDb } from "./db";

export type AdminTrialStatus = {
  status: "active" | "expired";
  startedAt: Date;
  expiresAt: Date;
  remainingMs: number;
  paymentQrUrl: string | null;
  paymentNoticeEn: string;
  paymentNoticeKo: string;
  paymentNoticeZh: string;
  usageGuideQrUrl: string | null;
  usageGuideNoticeEn: string;
  usageGuideNoticeKo: string;
  usageGuideNoticeZh: string;
};

export function resolveAdminTrialWindow(startedAt: Date, durationHours: number, nowMs = Date.now()) {
  const expiresAt = new Date(startedAt.getTime() + Math.max(1, durationHours) * 60 * 60 * 1000);
  const remainingMs = Math.max(0, expiresAt.getTime() - nowMs);
  return { status: remainingMs > 0 ? "active" as const : "expired" as const, expiresAt, remainingMs };
}

/**
 * The trial is enforced whenever an administrator requests protected data. No
 * timer is required: an expired account is denied even if no background job ran.
 */
export async function getAdminTrialStatus(userId: number, startIfMissing = false): Promise<AdminTrialStatus> {
  const db = await getDb();
  if (!db) throw new Error("ADMIN_TRIAL_SETTINGS_UNAVAILABLE");
  let account = (await db.select({ id: users.id, role: users.role, adminTrialStartedAt: users.adminTrialStartedAt, adminTrialDurationHours: users.adminTrialDurationHours }).from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!account || account.role !== "admin") throw new Error("ADMIN_TRIAL_ACCOUNT_NOT_FOUND");
  if (!account.adminTrialStartedAt && startIfMissing) {
    const startedAt = new Date();
    await db.update(users).set({ adminTrialStartedAt: startedAt }).where(eq(users.id, userId));
    account = { ...account, adminTrialStartedAt: startedAt };
  }
  const settings = await getReleaseSettings();
  const startedAt = account.adminTrialStartedAt ?? new Date();
  const window = resolveAdminTrialWindow(startedAt, account.adminTrialDurationHours || 48);
  return {
    status: window.status,
    startedAt,
    expiresAt: window.expiresAt,
    remainingMs: window.remainingMs,
    paymentQrUrl: settings.adminTrialPaymentQrUrl || null,
    paymentNoticeEn: settings.adminTrialPaymentNoticeEn,
    paymentNoticeKo: settings.adminTrialPaymentNoticeKo,
    paymentNoticeZh: settings.adminTrialPaymentNoticeZh,
    usageGuideQrUrl: settings.adminTrialUsageGuideQrUrl || null,
    usageGuideNoticeEn: settings.adminTrialUsageGuideNoticeEn,
    usageGuideNoticeKo: settings.adminTrialUsageGuideNoticeKo,
    usageGuideNoticeZh: settings.adminTrialUsageGuideNoticeZh,
  };
}
