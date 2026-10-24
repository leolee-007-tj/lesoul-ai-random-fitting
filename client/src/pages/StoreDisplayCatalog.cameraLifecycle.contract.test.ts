import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

// Exercise only the reviewed camera callbacks with fake media, never the page or a real device.
function setup() {
  const calls: { resolve: (value: unknown) => void; reject: (reason: Error) => void }[] = [];
  const video = { srcObject: null as unknown, play: vi.fn(async () => {}) };
  const state = { error: "", open: false };
  const refs = { cameraStreamRef: { current: null as unknown }, cameraRequestRef: { current: 0 }, videoRef: { current: video as typeof video | null } };
  const context = vm.createContext({
    resetRecommendationSession: vi.fn(),
    ...refs, cameraFacingMode: "environment", copy: { cameraPermission: "permission", cameraUnsupported: "unsupported" },
    navigator: { mediaDevices: { getUserMedia: vi.fn(() => new Promise((resolve, reject) => calls.push({ resolve, reject }))) } },
    setCameraOpen: (value: boolean) => { state.open = value; },
    setCameraError: (value: string) => { state.error = value; },
    setCapturedPhoto: vi.fn(), setCustomerLookbookUrl: vi.fn(), setCustomerLookbookExpanded: vi.fn(), customerLookbook: { reset: vi.fn() },
  });
  const start = source.indexOf("  const stopCamera =");
  const end = source.indexOf("  const capturePhoto =", start);
  if (start < 0 || end < 0) throw new Error("Reviewed callback boundaries missing");
  const callbacks = vm.runInContext(source.slice(start, end) + ";({ stopCamera, closeCamera, openCamera });", context, { timeout: 1000 });
  return { ...refs, calls, video, state, ...callbacks };
}
function media() {
  const stop = vi.fn();
  return { stream: { getTracks: () => [{ stop }] }, stop };
}

describe("store camera request lifecycle", () => {
  it("stops a grant arriving after close without attaching it", async () => {
    const h = setup(); const pending = h.openCamera(); h.closeCamera(); const m = media();
    h.calls[0].resolve(m.stream); await pending;
    expect(m.stop).toHaveBeenCalledOnce(); expect(h.cameraStreamRef.current).toBeNull(); expect(h.video.srcObject).toBeNull(); expect(h.video.play).not.toHaveBeenCalled();
  });
  it("invalidates a pending request on unmount cleanup", async () => {
    expect(source).toContain("useEffect(() => () => stopCamera(), [])");
    const h = setup(); const pending = h.openCamera(); h.stopCamera(); h.videoRef.current = null; const m = media();
    h.calls[0].resolve(m.stream); await pending; expect(m.stop).toHaveBeenCalledOnce(); expect(h.cameraStreamRef.current).toBeNull();
  });
  it("keeps the newer stream when an older request resolves later", async () => {
    const h = setup(); const old = h.openCamera(); const latest = h.openCamera(); const a = media(); const b = media();
    h.calls[1].resolve(b.stream); await latest; h.calls[0].resolve(a.stream); await old;
    expect(a.stop).toHaveBeenCalledOnce(); expect(b.stop).not.toHaveBeenCalled(); expect(h.cameraStreamRef.current).toBe(b.stream); expect(h.video.srcObject).toBe(b.stream);
  });
  it("ignores a stale permission failure after a new request succeeds", async () => {
    const h = setup(); const old = h.openCamera(); const latest = h.openCamera(); const m = media();
    h.calls[1].resolve(m.stream); await latest; h.calls[0].reject(new Error("denied")); await old;
    expect(h.state.error).toBe(""); expect(h.cameraStreamRef.current).toBe(m.stream); expect(m.stop).not.toHaveBeenCalled();
  });
  it("releases the acquired stream when playback fails", async () => {
    const h = setup(); h.video.play.mockRejectedValueOnce(new Error("play failed")); const pending = h.openCamera(); const m = media(); h.calls[0].resolve(m.stream); await pending;
    expect(m.stop).toHaveBeenCalledOnce(); expect(h.cameraStreamRef.current).toBeNull(); expect(h.video.srcObject).toBeNull(); expect(h.state.error).toBe("permission");
  });
  it("releases a grant if the video element is unavailable", async () => {
    const h = setup(); const pending = h.openCamera(); h.videoRef.current = null; const m = media(); h.calls[0].resolve(m.stream); await pending;
    expect(m.stop).toHaveBeenCalledOnce(); expect(h.cameraStreamRef.current).toBeNull();
  });
  it("does not stop a newer stream when old playback rejects", async () => {
    const h = setup(); let rejectPlay!: (error: Error) => void; let beginPlay!: () => void;
    const playStarted = new Promise<void>((resolve) => { beginPlay = resolve; });
    h.video.play.mockImplementationOnce(() => { beginPlay(); return new Promise<void>((_, reject) => { rejectPlay = reject; }); });
    const old = h.openCamera(); const a = media(); h.calls[0].resolve(a.stream); await playStarted;
    const latest = h.openCamera(); const b = media(); h.calls[1].resolve(b.stream); await latest;
    rejectPlay(new Error("old playback ended")); await old;
    expect(a.stop).toHaveBeenCalledOnce(); expect(b.stop).not.toHaveBeenCalled(); expect(h.cameraStreamRef.current).toBe(b.stream); expect(h.state.error).toBe("");
  });
  it("reports a current permission denial without retaining media", async () => {
    const h = setup(); const pending = h.openCamera(); h.calls[0].reject(new Error("denied")); await pending;
    expect(h.state.error).toBe("permission"); expect(h.cameraStreamRef.current).toBeNull(); expect(h.video.srcObject).toBeNull();
  });
  it("keeps normal open and close behavior", async () => {
    const h = setup(); const pending = h.openCamera(); const m = media(); h.calls[0].resolve(m.stream); await pending;
    expect(h.video.play).toHaveBeenCalledOnce(); expect(h.video.srcObject).toBe(m.stream); expect(h.state.open).toBe(true);
    h.closeCamera(); expect(m.stop).toHaveBeenCalledOnce(); expect(h.cameraStreamRef.current).toBeNull(); expect(h.video.srcObject).toBeNull(); expect(h.state.open).toBe(false);
  });
});
