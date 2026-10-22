import { describe, expect, it } from "vitest";
import { CARE_LABEL_SEED } from "./careLabelSeed";
import { decodeCareLabelImageDataUrl } from "./routers/uploads";
import { localizedCareLabelText } from "../shared/careLabels";

describe("Care Labels integration", () => {
  it("keeps the complete stable LS-0001…LS-0384 source catalog", () => {
    expect(CARE_LABEL_SEED).toHaveLength(384);
    expect(new Set(CARE_LABEL_SEED.map((item) => item.id)).size).toBe(384);
    expect(CARE_LABEL_SEED[0].id).toBe("LS-0001");
    expect(CARE_LABEL_SEED.at(-1)?.id).toBe("LS-0384");
    expect(CARE_LABEL_SEED.every((item) => item.standard && item.safety && item.grade && item.dealer && item.address)).toBe(true);
  });

  it("accepts SVG care assets but rejects executable SVG content", () => {
    const safe = `data:image/svg+xml;base64,${Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0\"/></svg>").toString("base64")}`;
    expect(decodeCareLabelImageDataUrl(safe).extension).toBe("svg");
    const unsafe = `data:image/svg+xml;base64,${Buffer.from("<svg><script>alert(1)</script></svg>").toString("base64")}`;
    expect(() => decodeCareLabelImageDataUrl(unsafe)).toThrow("Unsafe SVG");
  });

  it("provides consistent localized labels without translating source product data", () => {
    expect(localizedCareLabelText("ko").catalog).toContain("케어");
    expect(localizedCareLabelText("zh").catalog).toContain("洗标");
    expect(localizedCareLabelText("en").catalog).toContain("CARE");
    expect(CARE_LABEL_SEED[0].name).toBe("卡其色水洗裤");
  });
});
