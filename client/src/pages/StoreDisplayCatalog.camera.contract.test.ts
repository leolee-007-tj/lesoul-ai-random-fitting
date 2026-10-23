import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("store display camera recommendations", () => {
  it("keeps rear-camera-only portrait capture consistent with the iPad display contract", () => {
    expect(source).toContain("navigator.mediaDevices?.getUserMedia");
    // The store display uses a fixed rear camera; the broader display contract owns this requirement.
    expect(source).toContain('const cameraFacingMode = "environment" as const;');
    expect(source).toContain("facingMode: { exact: cameraFacingMode }");
    expect(source).toContain("aspectRatio: { ideal: 9 / 16 }");
    expect(source).not.toContain("onClick={switchCamera}");
    expect(source).not.toContain("<SwitchCamera");
    expect(source).toContain("audio: false");
    expect(source).toContain("cameraStreamRef.current?.getTracks().forEach");
  });

  it("captures a session-only photo without uploading it", () => {
    expect(source).toContain("canvas.toDataURL(\"image/jpeg\", 0.92)");
    expect(source).toContain("setCapturedPhoto");
    expect(source).not.toContain("uploadImage");
  });

  it("uses administrator-published curated looks for recommendations", () => {
    expect(source).toContain("trpc.stylist.published.useQuery({ locale })");
    expect(source).toContain("copy.recommendations");
    expect(source).toContain("outfit.products.map");
  });

  it("keeps the close action visible and captures detailed customer requests", () => {
    expect(source).toContain("sticky top-0 z-20");
    expect(source).toContain("title={copy.closeCamera}");
    expect(source).toContain("detailText");
    expect(source).toContain("detailRequirements");
    expect(source).toContain("detailPlaceholder");
  });
});
