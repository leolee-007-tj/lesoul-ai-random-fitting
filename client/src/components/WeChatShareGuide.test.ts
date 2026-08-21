import { describe, expect, it } from "vitest";
import { buildProductShareUrl, isWeChatUserAgent } from "./WeChatShareGuide";

describe("WeChat share guidance helpers", () => {
  it("detects WeChat without treating ordinary mobile browsers as WeChat", () => {
    expect(isWeChatUserAgent("Mozilla/5.0 MicroMessenger/8.0.48")).toBe(true);
    expect(isWeChatUserAgent("Mozilla/5.0 Mobile Safari/604.1")).toBe(false);
  });

  it("builds a stable catalog product link", () => {
    expect(buildProductShareUrl("https://lesoul.example/style-match?old=value", 42)).toBe("https://lesoul.example/catalog?product=42");
  });
});
