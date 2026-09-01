import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("privacy-minimized site analytics contract", () => {
  it("does not retain raw IP, user-agent, or exact device model data", () => {
    const analytics = source("./siteAnalytics.ts");
    const schema = source("../../../drizzle/schema.ts");
    expect(analytics).toContain("getCoarseDeviceInfo");
    expect(analytics).not.toContain("device.model");
    expect(schema).toContain("siteVisitSummaries");
    expect(schema).not.toContain("userAgent");
    expect(schema).not.toContain("ipAddress");
  });

  it("requires an explicit visitor consent choice before the customer gate tracks a visit", () => {
    const gate = source("../components/CustomerGate.tsx");
    const banner = source("../components/AnalyticsConsentBanner.tsx");
    expect(gate).toContain('analyticsConsent !== "accepted"');
    expect(gate).toContain("trackSiteVisit.mutate");
    expect(banner).toContain('"accepted"');
    expect(banner).toContain('"declined"');
  });

  it("keeps visit analytics behind the owner procedure and daily visitor uniqueness", () => {
    const router = source("../../../server/routers/operations.ts");
    const catalog = source("../../../server/routers/catalog.ts");
    const db = source("../../../server/db.ts");
    const schema = source("../../../drizzle/schema.ts");
    expect(router).toContain("siteVisitAnalytics: ownerProcedure");
    expect(catalog).toContain("trackSiteVisit");
    expect(db).toContain("recordSiteVisit");
    expect(schema).toContain("site_visit_daily_unique");
  });
});
