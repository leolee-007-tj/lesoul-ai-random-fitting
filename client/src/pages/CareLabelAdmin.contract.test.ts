import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Care Labels admin contracts", () => {
  const root = path.resolve(process.cwd());
  it("is linked from the existing Operations dashboard instead of a separate password area", () => {
    const operations = fs.readFileSync(path.join(root, "client/src/pages/OperationsDashboard.tsx"), "utf8");
    expect(operations).toContain('href="/care-labels/admin"');
    const admin = fs.readFileSync(path.join(root, "client/src/pages/CareLabelAdmin.tsx"), "utf8");
    expect(admin).toContain("trpc.careLabels.admin.useQuery");
    expect(admin).toContain("trpc.careLabels.updatePrivatePrice.useMutation");
    expect(admin).toContain('accept="image/svg+xml,image/png,image/jpeg,image/webp"');
    expect(admin).toContain("LESOUL_QR_PNG_SVG_FINAL_779a7da5.zip");
    expect(admin).toContain("LESOUL_QR_CARDS_CHINESE_c0bb0b21.pdf");
    expect(admin).toContain("QR_MATCHING_b8c78314.xlsx");
    expect(admin).toContain('href="/care-labels/print"');
  });
});
