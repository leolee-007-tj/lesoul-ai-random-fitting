import { describe, expect, it } from "vitest";
import { bodyModelCopy } from "../client/src/i18n/bodyModelCopy";

describe("AI Body Model localization", () => {
  it("provides complete Korean and Chinese body-model actions instead of English-only labels", () => {
    expect(bodyModelCopy.ko.create).toBe("AI 모델 만들기");
    expect(bodyModelCopy.ko.hairLength).toBe("머리 길이");
    expect(bodyModelCopy.zh.create).toBe("创建我的 AI 模特");
    expect(bodyModelCopy.zh.skinTone).toBe("肤色");
  });

  it("keeps all supported languages complete for preview and consent flows", () => {
    for (const language of ["en", "ko", "zh"] as const) {
      expect(bodyModelCopy[language].consent).toBeTruthy();
      expect(bodyModelCopy[language].readyTitle).toBeTruthy();
      expect(bodyModelCopy[language].stages).toHaveLength(4);
    }
  });
});
