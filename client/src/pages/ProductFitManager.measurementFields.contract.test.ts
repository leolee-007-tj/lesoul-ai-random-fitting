import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./ProductFitManager.tsx", import.meta.url), "utf8");

describe("product fit measurement field management", () => {
  it("uses the selected product category's managed measurement fields", () => {
    expect(source).toContain("categoryMeasurementFields(displayCategory ?? { baseCategory: fallbackBaseCategory(category) })");
    expect(source).toContain("fieldsFor(category, displayCategory)");
    expect(source).toContain("selected.displayCategory");
  });

  it("keeps the base-category defaults as a safe fallback for older products", () => {
    expect(source).toContain("fallbackBaseCategory(category)");
    expect(source).toContain("categoryMeasurementFields");
  });
});
