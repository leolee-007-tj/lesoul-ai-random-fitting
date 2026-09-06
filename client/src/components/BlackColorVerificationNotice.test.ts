import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getBlackColorVerificationNotice, shouldShowBlackColorVerificationNotice } from "./BlackColorVerificationNotice";

describe("black colour verification notice", () => {
  it("detects dark colour metadata without showing for unrelated colours", () => {
    expect(shouldShowBlackColorVerificationNotice("Black")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("블랙")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("黑色")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("차콜")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("Navy")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("다크 브라운")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("深蓝")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("深棕")).toBe(true);
    expect(shouldShowBlackColorVerificationNotice("Ivory")).toBe(false);
  });

  it("renders the notice for every detail product with a restrained visual treatment", () => {
    const source = readFileSync(new URL("./BlackColorVerificationNotice.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("if (!shouldShowBlackColorVerificationNotice(color)) return null;");
    expect(source).toContain("bg-[#f3efe9]/75");
    expect(source).toContain("text-[9px]");
  });

  it("keeps the lighting verification guidance localized", () => {
    expect(getBlackColorVerificationNotice("ko")).toContain("실물 색상");
    expect(getBlackColorVerificationNotice("zh")).toContain("实物颜色");
    expect(getBlackColorVerificationNotice("en")).toContain("actual colour");
  });
});
