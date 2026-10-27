import { recommendationFailureMessage } from "../lib/recommendationErrors";
import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { stylistRouter } from "../../../server/routers/stylist";
import type { AppRouter } from "../../../server/routers";

const source = fs.readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");
const products = [{ id: 1, category: "top" }, { id: 2, category: "bottom" }];
function setup() {
  const state = { stage: "idle", error: "", url: null as string | null, expanded: false };
  const recommend = vi.fn(async () => ({ products }));
  const generate = vi.fn(async (_input?: unknown) => ({ imageUrl: "fixture-image" }));
  const refs = { recommendationRequestRef: { current: 0 }, recommendationBusyRef: { current: false } };
  const recommendReset = vi.fn();
  const imageReset = vi.fn();
  const setCapturedPhoto = vi.fn();
  const context = vm.createContext({
    ...refs, recommendationFailureMessage, locale:"ko", capturedPhoto: "data:image/jpeg;base64,FIXTURE", displayRecommendationInput: { photoDataUrl: "fixture" }, customerProfile: {}, customerMeasurements: { values: {}, errors: [] },
    personalizedRecommendations: { mutateAsync: recommend, reset: recommendReset }, customerLookbook: { mutateAsync: generate, reset: imageReset },
    recommendationCopy: { noProducts: "no-products", recommendFailed: "recommend-failed", imageFailed: "image-failed" },
    setRecommendationStage: (value: string) => { state.stage = value; },
    setRecommendationError: (value: string) => { state.error = value; },
    setCustomerLookbookUrl: (value: string | null) => { state.url = value; },
    setCustomerLookbookExpanded: (value: boolean) => { state.expanded = value; },
    setCapturedPhoto,
  });
  const start = source.indexOf("  const resetRecommendationSession =");
  const end = source.indexOf("  const stopCamera =", start);
  if (start < 0 || end < 0) throw new Error("Recommendation callback boundaries missing");
  const compiled = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const callbacks = vm.runInContext(compiled + ";({ runPersonalizedRecommendation, resetRecommendationSession });", context, { timeout: 1000 });
  return { state, recommend, generate, ...refs, ...callbacks, recommendReset, imageReset, setCapturedPhoto, context };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("camera recommendation to fitting image", () => {
  it("runs recommendations then image generation and opens the returned image", async () => {
    const h = setup();
    await h.runPersonalizedRecommendation();
    expect(h.recommend).toHaveBeenCalledOnce();
    expect(h.generate).toHaveBeenCalledWith(expect.objectContaining({ productIds: [1, 2], photoDataUrl: "data:image/jpeg;base64,FIXTURE" }));
    expect(h.state).toEqual({ stage: "idle", error: "", url: "fixture-image", expanded: true });
  });
  it("explains the invalid field before any recommendation or image request", async () => {
    const h = setup();
    h.context.customerMeasurements = { values: {}, errors: ["키: 80–240 cm 숫자로 입력하거나 비워 주세요."] };
    await h.runPersonalizedRecommendation();
    expect(h.state.error).toContain("키: 80–240 cm");
    expect(h.state.stage).toBe("idle");
    expect(h.recommend).not.toHaveBeenCalled();
    expect(h.generate).not.toHaveBeenCalled();
  });
  it("shows a recommendation failure and does not generate an image", async () => {
    const h = setup(); h.recommend.mockRejectedValueOnce(new Error("fixture failure"));
    await h.runPersonalizedRecommendation();
    expect(h.state.error).toBe("recommend-failed"); expect(h.state.stage).toBe("idle"); expect(h.generate).not.toHaveBeenCalled();
  });
  it("shows a no-stock result instead of silently stopping", async () => {
    const h = setup(); h.recommend.mockResolvedValueOnce({ products: [] });
    await h.runPersonalizedRecommendation();
    expect(h.state.error).toBe("no-products"); expect(h.generate).not.toHaveBeenCalled();
  });
  it("distinguishes an image service failure from a recommendation failure", async () => {
    const h = setup(); h.generate.mockRejectedValueOnce(new Error("fixture provider failure"));
    await h.runPersonalizedRecommendation();
    expect(h.state.error).toBe("image-failed"); expect(h.state.stage).toBe("idle"); expect(h.state.url).toBeNull();
  });
  it("blocks duplicate clicks while either stage is in progress", async () => {
    const h = setup(); const d = deferred<{ imageUrl: string }>(); h.generate.mockReturnValueOnce(d.promise);
    const first = h.runPersonalizedRecommendation(); await Promise.resolve();
    await h.runPersonalizedRecommendation();
    expect(h.recommend).toHaveBeenCalledOnce(); expect(h.generate).toHaveBeenCalledOnce(); expect(h.state.stage).toBe("generating");
    d.resolve({ imageUrl: "fixture-image" }); await first;
  });
  it("does not start generation if the customer closes during recommendations", async () => {
    const h = setup(); const d = deferred<{ products: typeof products }>(); h.recommend.mockReturnValueOnce(d.promise);
    const first = h.runPersonalizedRecommendation(); h.resetRecommendationSession();
    d.resolve({ products }); await first;
    expect(h.generate).not.toHaveBeenCalled(); expect(h.setCapturedPhoto).toHaveBeenCalledWith(null);
    expect(h.recommendReset).toHaveBeenCalledOnce(); expect(h.imageReset).toHaveBeenCalledOnce();
  });
  it("ignores a generated image that arrives after the customer closes", async () => {
    const h = setup(); const d = deferred<{ imageUrl: string }>(); h.generate.mockReturnValueOnce(d.promise);
    const first = h.runPersonalizedRecommendation(); await Promise.resolve(); h.resetRecommendationSession();
    d.resolve({ imageUrl: "stale-image" }); await first;
    expect(h.state.url).toBeNull(); expect(h.state.expanded).toBe(false);
  });
});

describe("camera photo transport", () => {
  it("uses the mutation endpoint and places large photo input only in a POST body", async () => {
    expect(stylistRouter._def.procedures.displayRecommend._def.type).toBe("mutation");
    let observed: { url: string; method?: string; body: unknown } | undefined;
    const client = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({
      url: "https://fixture.invalid/api/trpc", transformer: superjson,
      fetch: async (url, init) => {
        observed = { url: String(url), method: init?.method, body: init?.body };
        return new Response(JSON.stringify([{ result: { data: superjson.serialize({ products: [] }) } }]), { headers: { "content-type": "application/json" } });
      },
    })] });
    await client.stylist.displayRecommend.mutate({ visitorId: "display-session", photoDataUrl: "data:image/jpeg;base64," + "A".repeat(100000) });
    expect(observed?.method).toBe("POST"); expect(observed!.url.length).toBeLessThan(300);
    expect(observed?.url).not.toContain("photoDataUrl"); expect(observed?.body).toContain("data:image/jpeg;base64,");
  });
});
