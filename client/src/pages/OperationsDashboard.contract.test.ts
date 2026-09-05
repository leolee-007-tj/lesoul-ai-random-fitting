import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dashboard = readFileSync(new URL("./OperationsDashboard.tsx", import.meta.url), "utf8");
const adminRouter = readFileSync(new URL("../../../server/routers/admin.ts", import.meta.url), "utf8");
const catalogRouter = readFileSync(new URL("../../../server/routers/catalog.ts", import.meta.url), "utf8");

describe("administrator operations after camera removal", () => {
  it("does not expose camera management from operations", () => {
    expect(dashboard).not.toContain('href="/release-control"');
    expect(dashboard).not.toContain("<Camera");
    expect(dashboard).not.toContain("copy.camera");
  });

  it("keeps legacy camera server procedures role-protected if old data remains", () => {
    expect(adminRouter).toContain("updatePresenceAlertConfig: ownerProcedure");
    expect(catalogRouter).toContain("presenceAlertConfig: storeDisplayProcedure");
  });
});
