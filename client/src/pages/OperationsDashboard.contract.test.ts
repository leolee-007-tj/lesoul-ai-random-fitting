import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dashboard = readFileSync(new URL("./OperationsDashboard.tsx", import.meta.url), "utf8");
const adminRouter = readFileSync(new URL("../../../server/routers/admin.ts", import.meta.url), "utf8");
const catalogRouter = readFileSync(new URL("../../../server/routers/catalog.ts", import.meta.url), "utf8");

describe("administrator camera management entry", () => {
  it("shows an explicit camera-alert management link on operations", () => {
    expect(dashboard).toContain('href="/release-control"');
    expect(dashboard).toContain("copy.camera");
    expect(dashboard).toContain("<Camera size={15} />");
  });

  it("keeps configuration administrator-only and playback configuration display-only", () => {
    expect(adminRouter).toContain("updatePresenceAlertConfig: ownerProcedure");
    expect(catalogRouter).toContain("presenceAlertConfig: storeDisplayProcedure");
  });
});
