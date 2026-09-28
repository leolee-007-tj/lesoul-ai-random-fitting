import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Care Labels and login QR contracts", () => {
  const root = path.resolve(process.cwd());
  it("uses stable product IDs and keeps price out of the public catalog page", () => {
    const source = fs.readFileSync(path.join(root, "client/src/pages/CareLabelCatalog.tsx"), "utf8");
    expect(source).toContain("/product/${row.id}");
    expect(source).not.toContain("privatePrices");
    expect(source).toContain("StoreQr");
    expect(source).toContain("CareLabelProductQr");
    expect(source).toContain('publicItem("origin"');
    expect(source).toContain('publicItem("dealer"');
    expect(source).toContain('publicItem("address"');
    expect(source).toContain('publicItem("phone"');
    expect(source).toContain("sm:grid-cols-3");
  });

  it("renders every product QR from the fixed final Manus origin with Chinese card copy", () => {
    const shared = fs.readFileSync(path.join(root, "shared/careLabels.ts"), "utf8");
    const qr = fs.readFileSync(path.join(root, "client/src/components/CareLabelProductQr.tsx"), "utf8");
    const print = fs.readFileSync(path.join(root, "client/src/pages/CareLabelPrint.tsx"), "utf8");
    expect(shared).toContain('CARE_LABEL_PUBLIC_ORIGIN = "https://lesoulai-xabhv8qd.manus.space"');
    expect(shared).toContain("/product/${id}");
    expect(qr).toContain("LESOUL 商品二维码");
    expect(qr).toContain("微信或手机相机扫码查看商品洗标资料");
    expect(print).toContain("商品二维码打印册");
    expect(print).toContain("products.map");
  });

  it("contains no legacy chatgpt.site URL in active Care Labels code", () => {
    const activeFiles = [
      "shared/careLabels.ts",
      "client/src/pages/CareLabelCatalog.tsx",
      "client/src/pages/CareLabelAdmin.tsx",
      "client/src/pages/CareLabelPrint.tsx",
      "client/src/components/CareLabelProductQr.tsx",
      "server/routers/careLabels.ts",
    ];
    for (const file of activeFiles) expect(fs.readFileSync(path.join(root, file), "utf8")).not.toContain("chatgpt.site");
  });

  it("keeps the QR scan guide inside the existing login context", () => {
    const source = fs.readFileSync(path.join(root, "client/src/pages/Login.tsx"), "utf8");
    expect(source).toContain('type LoginMode = "normal" | "vip" | "trial" | "display" | "admin" | "qr"');
    expect(source).toContain("qrInfoOpen");
    expect(source).toContain("aria-modal=\"true\"");
    expect(source).toContain("setMode(\"normal\")");
  });
});
