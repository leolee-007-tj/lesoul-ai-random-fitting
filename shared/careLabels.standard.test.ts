import { describe, expect, it } from "vitest";
import {
  CARE_LABEL_GRADES,
  CARE_LABEL_MATERIALS,
  CARE_LABEL_PUBLIC_FIELD_OPTIONS,
  CARE_LABEL_SAFETY_CATEGORIES,
  CARE_LABEL_STANDARDS,
  defaultPublicFields,
  recommendedCareLabelSettings,
} from "./careLabels";

describe("Care Labels Chinese apparel standard controls", () => {
  it("provides the requested execution standards, safety classes, grades, and common materials", () => {
    expect(CARE_LABEL_STANDARDS.some((item) => item.key === "GB_T_22849_2014")).toBe(true);
    expect(CARE_LABEL_STANDARDS.some((item) => item.key === "GB_T_14272_2021")).toBe(true);
    expect(CARE_LABEL_SAFETY_CATEGORIES.map((item) => item.key)).toEqual(expect.arrayContaining(["A", "B", "C"]));
    expect(CARE_LABEL_GRADES.map((item) => item.nameZh)).toEqual(expect.arrayContaining(["优等品", "合格品", "一等品", "待确认"]));
    expect(CARE_LABEL_MATERIALS.map((item) => item.key)).toEqual(expect.arrayContaining(["cotton", "polyester", "wool", "cashmere", "leather", "down", "spandex"]));
  });

  it("recommends a standard without overwriting source text automatically", () => {
    const result = recommendedCareLabelSettings({ name: "黑色羽绒服", category: "上装", composition: "聚酯纤维", filling: "羽绒" });
    expect(result.executionStandardKey).toBe("GB_T_14272_2021");
    expect(result.safetyCategoryKey).toBe("C");
    expect(result.grade).toBe("合格品");
  });

  it("defaults old products to a useful checked public subset and honors explicit choices", () => {
    const oldProduct = { id: "LS-0001", name: "商品" } as any;
    expect(defaultPublicFields(oldProduct)).toContain("standard");
    expect(CARE_LABEL_PUBLIC_FIELD_OPTIONS.length).toBeGreaterThan(10);
    expect(defaultPublicFields({ ...oldProduct, publicFields: ["name", "composition"] } as any)).toEqual(["name", "composition"]);
  });
});
