import { describe, expect, it } from "vitest";
import en from "../client/src/i18n/locales/en.json";
import ko from "../client/src/i18n/locales/ko.json";
import zh from "../client/src/i18n/locales/zh.json";

const poseKeys = ["handPocket", "side", "front", "walking", "crossedArms", "seated", "standing", "elegant"] as const;

describe("pose localization", () => {
  it("provides a non-empty title and description for every supported pose in EN, KO, and ZH", () => {
    for (const locale of [en, ko, zh]) {
      for (const key of poseKeys) {
        const pose = locale.poseCatalog[key];
        expect(pose.title.trim().length).toBeGreaterThan(0);
        expect(pose.description.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
