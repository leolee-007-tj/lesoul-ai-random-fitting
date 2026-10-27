import { describe, expect, it } from "vitest";
import { parseCustomerMeasurements } from "./customerMeasurements";
const empty = { height: "", weight: "", shoulderWidth: "", chest: "", waist: "", hip: "" };
describe("optional customer measurement input", () => {
  it("allows every measurement to remain empty", () => {
    const result = parseCustomerMeasurements(empty, "ko");
    expect(result.errors).toEqual([]);
    expect(Object.values(result.values)).toEqual([null, null, null, null, null, null]);
  });
  it("accepts whitespace, explicit units, fullwidth digits and decimal commas", () => {
    expect(parseCustomerMeasurements({ ...empty, height: " １６５ cm ", weight: "55,5kg", waist: "70 센티미터" }, "ko")).toEqual({ values: {height:165,weight:55.5,shoulderWidth:null,chest:null,waist:70,hip:null}, errors: [] });
  });
  it.each(["0", "abc", "1.65m", "165kg", "Infinity", "1e2", "164 165", "241"])("rejects ambiguous or out-of-range height %s without guessing", height => {
    const result = parseCustomerMeasurements({...empty,height}, "ko");
    expect(result.values.height).toBeNull(); expect(result.errors).toEqual(["키: 80–240 cm 숫자로 입력하거나 비워 주세요."]);
  });
  it("reports each invalid field in the selected language", () => {
    expect(parseCustomerMeasurements({...empty,waist:"20",hip:"abc"}, "zh").errors).toEqual(["腰围：请输入 40–180 cm 的数值，或留空。", "臀围：请输入 40–200 cm 的数值，或留空。"]);
  });
});
