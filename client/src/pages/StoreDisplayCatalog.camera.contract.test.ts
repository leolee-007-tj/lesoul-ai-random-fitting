import { describe, expect, it } from "vitest";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("store display camera recommendations", () => {
  it("keeps camera controls inside the store display page and supports both cameras", () => {
    expect(source).toContain("navigator.mediaDevices?.getUserMedia");
    expect(source).toContain("facingMode: { ideal: requestedFacingMode }");
    expect(source).toContain('useState<"environment" | "user">("environment")');
    expect(source).toContain("switchCamera");
    expect(source).toContain("SwitchCamera");
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
