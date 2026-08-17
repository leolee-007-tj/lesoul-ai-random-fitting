import { describe, expect, it } from "vitest";
import { replaceDetailSlot } from "../shared/productImageViews";

const detail = (name: string) => ({ original: `${name}-original`, studioCut: `${name}-studio`, thumbnail: `${name}-thumb` });

describe("detail image slot targeting", () => {
  it("adds a Detail 1 asset at index zero without creating a Detail 2 asset", () => {
    expect(replaceDetailSlot([], 0, detail("one"))).toEqual([detail("one")]);
  });

  it("writes Detail 2 at index one while preserving Detail 1", () => {
    expect(replaceDetailSlot([detail("one")], 1, detail("two"))).toEqual([detail("one"), detail("two")]);
  });

  it("replaces Detail 1 without modifying Detail 2", () => {
    expect(replaceDetailSlot([detail("one"), detail("two")], 0, detail("replacement"))).toEqual([detail("replacement"), detail("two")]);
  });
});
