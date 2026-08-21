import { eq } from "drizzle-orm";
import { releaseSettings } from "../drizzle/schema";
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
export async function getAdminTrialStatus(startIfMissing = false): Promise<AdminTrialStatus> {
  let settings = await getReleaseSettings();
  if (!settings.adminTrialStartedAt && startIfMissing) {
    const db = await getDb();
    if (!db) throw new Error("ADMIN_TRIAL_SETTINGS_UNAVAILABLE");
    const startedAt = new Date();
    await db.update(releaseSettings).set({ adminTrialStartedAt: startedAt }).where(eq(releaseSettings.id, 1));
    settings = { ...settings, adminTrialStartedAt: startedAt };
  }
  const startedAt = settings.adminTrialStartedAt ?? new Date();
  const window = resolveAdminTrialWindow(startedAt, settings.adminTrialDurationHours || 48);
  return {
    status: window.status,
    startedAt,
    expiresAt: window.expiresAt,
    remainingMs: window.remainingMs,
    paymentQrUrl: settings.adminTrialPaymentQrUrl || null,
    paymentNoticeEn: settings.adminTrialPaymentNoticeEn,
    paymentNoticeKo: settings.adminTrialPaymentNoticeKo,
    paymentNoticeZh: settings.adminTrialPaymentNoticeZh,
  };
}
