import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("release control after camera removal", () => {
  it("removes camera and sound controls while preserving release settings", () => {
    const page = readFileSync(new URL("./ReleaseControl.tsx", import.meta.url), "utf8");
    expect(page).not.toContain("trpc.uploads.presenceAudio.useMutation");
    expect(page).not.toContain("PresenceAudioRecorder");
    expect(page).not.toContain("presenceSoundUploader");
    expect(page).toContain("excludeNewArrivalsFromSale");
    expect(page).toContain("purchaseListMaxItems");
    expect(page).toContain("adminTrialPaymentQrUrl");
    expect(page).toContain('import MobileBottomNav from "@/components/MobileBottomNav"');
    expect(page).toContain("<MobileBottomNav />");
  });
});
