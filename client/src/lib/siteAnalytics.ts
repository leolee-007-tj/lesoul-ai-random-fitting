import { getVisitorId } from "./visitor";

const CONSENT_KEY = "lesoul-site-analytics-consent";

export type AnalyticsConsent = "accepted" | "declined" | null;

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, null>) {
  try { window.localStorage.setItem(CONSENT_KEY, value); } catch {}
}

export function getCoarseDeviceInfo() {
  const ua = navigator.userAgent || "";
  const width = Math.max(window.innerWidth || 0, window.screen?.width || 0);
  const deviceType = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "tablet" : /Mobi|Android|iPhone|iPod/i.test(ua) || width < 768 ? "phone" : width >= 768 ? "desktop" : "unknown";
  const operatingSystem = /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Android/i.test(ua) ? "Android" : /Mac OS X/i.test(ua) ? "macOS" : /Windows/i.test(ua) ? "Windows" : /Linux/i.test(ua) ? "Linux" : "unknown";
  const browser = /CriOS|Chrome/i.test(ua) ? "Chrome" : /FxiOS|Firefox/i.test(ua) ? "Firefox" : /EdgiOS|Edg/i.test(ua) ? "Edge" : /SamsungBrowser/i.test(ua) ? "Samsung Internet" : /Safari/i.test(ua) ? "Safari" : "Other";
  const screenClass = width < 390 ? "small" : width < 768 ? "medium" : width < 1280 ? "large" : "wide";
  return { deviceType: deviceType as "phone" | "tablet" | "desktop" | "unknown", operatingSystem, browser, screenClass };
}

export function getSiteVisitPayload(locale: string, entryPath: string) {
  const coarse = getCoarseDeviceInfo();
  return { visitorId: getVisitorId(), ...coarse, locale: locale.startsWith("ko") ? "ko" as const : locale.startsWith("zh") ? "zh" as const : "en" as const, entryPath: entryPath.slice(0, 160) || "/" };
}
