import { describe, expect, it } from "vitest";
import { hashVisitorIp } from "./db";

describe("visitor IP deduplication", () => {
  it("creates a stable opaque hash and never returns the raw address", () => {
    const first = hashVisitorIp("203.0.113.10");
    const repeated = hashVisitorIp("203.0.113.10");
    const other = hashVisitorIp("203.0.113.11");

    expect(first).toHaveLength(64);
    expect(first).toBe(repeated);
    expect(first).not.toBe(other);
    expect(first).not.toContain("203.0.113.10");
  });

  it("uses the first forwarded address and treats missing addresses as unknown", () => {
    expect(hashVisitorIp("203.0.113.10, 198.51.100.4")).toBe(hashVisitorIp("203.0.113.10"));
    expect(hashVisitorIp(undefined)).toBeNull();
    expect(hashVisitorIp("   ")).toBeNull();
  });
});
