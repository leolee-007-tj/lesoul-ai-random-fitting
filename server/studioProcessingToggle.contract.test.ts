import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("pure-white studio processing switch", () => {
  it("stores a central owner-controlled setting and rejects disabled generation server-side", () => {
    const schema = source("../drizzle/schema.ts");
    const admin = source("./routers/admin.ts");
    expect(schema).toContain('studioImageProcessingEnabled: int("studioImageProcessingEnabled").default(1).notNull()');
    expect(admin).toContain("studioImageProcessingEnabled: z.number().int().min(0).max(1).optional()");
    expect(admin).toContain("STUDIO_IMAGE_PROCESSING_DISABLED");
  });

  it("renders studio controls only while the central setting is enabled", () => {
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    const release = source("../client/src/pages/ReleaseControl.tsx");
    expect(manager).toContain("const studioProcessingEnabled = releaseConfig.data?.studioImageProcessingEnabled === 1");
    expect(manager).toContain('auth.user?.role === "admin" && studioProcessingEnabled');
    expect(release).toContain('toggle(c.studio, "studioImageProcessingEnabled")');
  });
});
