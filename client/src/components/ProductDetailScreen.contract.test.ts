import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("product detail notice placement", () => {
  it("keeps the dark-color notice in the detail view footer area", () => {
    const source = readFileSync(new URL("./ProductDetailScreen.tsx", import.meta.url), "utf8");
    expect(source).toContain('<BlackColorVerificationNotice color={product.color} className="mt-5" />');
    const noticeSource = readFileSync(new URL("./BlackColorVerificationNotice.tsx", import.meta.url), "utf8");
    expect(noticeSource).toContain('data-detail-modal-color-notice="true"');
    expect(source).not.toContain('<BlackColorVerificationNotice color={product.color} className="mt-2" />');
    expect(source).toContain('trpc.displayLookbook.publicForProduct.useQuery');
    expect(source).toContain('생성된 룩북은 자동 저장되어 다른 방문자도 볼 수 있습니다.');
    expect(source).toContain('공개 AI 룩북');
    expect(source).toContain('publicImageExpanded');
    expect(source).toContain("fitting_room_mirror");
    expect(source).toContain("화이트·그레이 스튜디오");
  });
});
