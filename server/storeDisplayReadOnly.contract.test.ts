import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const trpc = readFileSync(new URL("./_core/trpc.ts", import.meta.url), "utf8");
const stylist = readFileSync(new URL("./routers/stylist.ts", import.meta.url), "utf8");

describe("store display read-only access", () => {
  it("provides a read-only authenticated procedure without customer mutation access", () => {
    expect(trpc).toContain("customerReadProcedure");
    expect(trpc).toContain("Read-only customer catalog queries also serve store-display accounts");
    expect(trpc).toContain("ctx.user && !ctx.testAccess");
  });

  it("uses the read-only procedure for published looks and display recommendations", () => {
    expect(stylist).toContain("published: customerReadProcedure");
    expect(stylist).toContain("displayRecommend: customerReadProcedure");
    expect(stylist).toContain("feedback: customerProcedure");
  });
});
