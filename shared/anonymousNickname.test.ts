import { describe, expect, it } from "vitest";
import { anonymousNickname } from "./anonymousNickname";

describe("anonymousNickname", () => {
  it("keeps the same identity stable and returns localized two-word nicknames", () => {
    const identity = "visitor_abc123";
    expect(anonymousNickname(identity, "ko")).toBe(anonymousNickname(identity, "ko"));
    expect(anonymousNickname(identity, "ko").split(" ")).toHaveLength(2);
    expect(anonymousNickname(identity, "en").split(" ")).toHaveLength(2);
    expect(anonymousNickname(identity, "zh").split(" ")).toHaveLength(2);
  });
});
