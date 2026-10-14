import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("privacy-minimized anonymous site analytics contract", () => {
  it("sends only an opaque visitor id, supported locale, and bounded entry path", () => {
    const analytics = source("./siteAnalytics.ts");
    const schema = source("../../../drizzle/schema.ts");
    expect(analytics).toContain("getVisitorId");
    expect(analytics).toContain("entryPath.slice(0, 160)");
    expect(analytics).not.toContain("getCoarseDeviceInfo");
    expect(analytics).not.toContain("device.model");
    expect(analytics).not.toContain("operatingSystem");
    expect(analytics).not.toContain("navigator.userAgent");
    expect(schema).toContain("siteVisitSummaries");
    expect(schema).not.toContain("userAgent");
    expect(schema).not.toContain("ipAddress");
  });

  it("uses a non-interactive footer notice instead of a consent dialog", () => {
    const gate = source("../components/CustomerGate.tsx");
    const notice = source("../components/AnonymousAnalyticsNotice.tsx");
    const banner = source("../components/AnalyticsConsentBanner.tsx");
    expect(gate).not.toContain("analyticsConsent");
    expect(gate).toContain("AnonymousAnalyticsNotice");
    expect(notice).toContain('role="note"');
    expect(notice).not.toContain("onDecision");
    expect(banner).toContain("AnonymousAnalyticsNotice");
    expect(banner).not.toContain("setAnalyticsConsent");
  });

  it("keeps only the opaque visitor id and daily uniqueness at the server boundary", () => {
    const router = source("../../../server/routers/operations.ts");
    const catalog = source("../../../server/routers/catalog.ts");
    const db = source("../../../server/db.ts");
    const schema = source("../../../drizzle/schema.ts");
    const gate = source("../components/CustomerGate.tsx");
    expect(router).toContain("siteVisitAnalytics: ownerProcedure");
    expect(catalog).toContain("trackSiteVisit");
    expect(catalog).not.toContain("deviceType: z.enum");
    expect(db).toContain("uniqueVisitors: new Set");
    expect(db).toContain("visitorIpHash");
    expect(db).toContain("hashVisitorIp");
    expect(db).toContain('deviceType: "unknown"');
    expect(schema).toContain("site_visit_daily_unique");
    expect(db).toContain("isExcludedAnalyticsRole");
    expect(db).toContain('role === "admin"');
    expect(db).toContain('row.entryPath.startsWith("/operations")');
    expect(gate).toContain('"store_display"');
  });
});
