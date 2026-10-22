import { describe, expect, it } from "vitest";
import { optionalKoreanCustomerCopy, requiredKoreanCustomerCopy } from "./adminTranslation";

describe("administrator Korean-source translation inputs", () => {
  it("normalizes required and optional Korean customer copy before translation", () => {
    expect(requiredKoreanCustomerCopy("  블랙 울 재킷  ")).toBe("블랙 울 재킷");
    expect(optionalKoreanCustomerCopy("  정교한 비율의 출근 코디  ")).toBe("정교한 비율의 출근 코디");
    expect(optionalKoreanCustomerCopy("   ")).toBeNull();
  });
});
