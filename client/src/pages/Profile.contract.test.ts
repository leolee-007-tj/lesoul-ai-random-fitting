import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("customer profile and curated-look policy", () => {
  it("keeps the profile customer-facing and sends retired image routes to curated looks", () => {
    const app = source("../App.tsx");
    const nav = source("../components/MobileBottomNav.tsx");
    const profile = source("./Profile.tsx");
    expect(app).toContain('path={"/profile"} component={() => <CustomerGate><Profile /></CustomerGate>}');
    expect(app).toContain('path={"/quick-fit"} component={() => <CustomerGate><StyleMatch /></CustomerGate>}');
    expect(nav).not.toContain('href: "/quick-fit"');
    expect(profile).toContain("SAVED LOOKS");
    expect(profile).toContain("INTERESTED PIECES");
    expect(profile).toContain("PREVIOUS PURCHASE REQUEST");
  });
});
