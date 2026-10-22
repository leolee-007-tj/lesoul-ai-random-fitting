import { describe, expect, it } from "vitest";
import { shuffleWithinNewArrivalGroups } from "./catalogOrder";

describe("catalog ordering", () => {
  it("keeps new arrivals before current products without mixing groups", () => {
    const result = shuffleWithinNewArrivalGroups([
      { id: "current-a", isNew: 0 },
      { id: "new-a", isNew: 1 },
      { id: "current-b", isNew: false },
      { id: "new-b", isNew: true },
    ], () => 0);
    expect(result.map((item) => item.id)).toEqual(["new-b", "new-a", "current-b", "current-a"]);
  });

  it("allows each group to change internally while preserving the boundary", () => {
    let next = 0.9;
    const result = shuffleWithinNewArrivalGroups([
      { id: "new-a", isNew: 1 },
      { id: "new-b", isNew: 1 },
      { id: "current-a", isNew: 0 },
      { id: "current-b", isNew: 0 },
    ], () => { next = next === 0.9 ? 0 : 0.9; return next; });
    const newIds = result.slice(0, 2).map((item) => item.id).sort();
    const currentIds = result.slice(2).map((item) => item.id).sort();
    expect(newIds).toEqual(["new-a", "new-b"]);
    expect(currentIds).toEqual(["current-a", "current-b"]);
    expect(result.findIndex((item) => item.isNew === 0)).toBe(2);
  });
});
