import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("category measurement field management contract", () => {
  it("stores category field templates and validates them in the administrator API", () => {
    expect(source("../drizzle/schema.ts")).toContain('measurementFields: json("measurementFields")');
    const admin = source("./routers/admin.ts");
    const db = source("./db.ts");
    expect(admin).toContain("measurementFields: z.array(z.enum(MEASUREMENT_FIELD_KEYS))");
    expect(db).toContain("normalizeMeasurementFields");
  });

  it("connects the dedicated category editor and Fit Manager to the same category field template", () => {
    expect(source("../client/src/components/CategoryManagementPanel.tsx")).toContain("saveFields");
    expect(source("../client/src/pages/ProductFitManager.tsx")).toContain("categoryMeasurementFields(isSetProduct(product)");
    expect(source("../client/src/pages/OperationsDashboard.tsx")).toContain("종류 · 치수 관리");
    expect(source("../client/src/pages/ProductManagerV2.tsx")).not.toContain("CategoryManagementPanel");
  });
});
