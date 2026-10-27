import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { createServer, get } from "node:http";
import type { AddressInfo } from "node:net";
import { storageGet, storageGetSignedUrl, storagePut } from "./storage";
import { registerStorageProxy } from "./_core/storageProxy";

vi.mock("./_core/env", () => ({ ENV: { forgeApiUrl: "https://forge.example.test/", forgeApiKey: "fixture-key" } }));
let request: ReturnType<typeof vi.fn>;
beforeEach(() => { request = vi.fn(); vi.stubGlobal("fetch", request); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function proxy(path = "/manus-storage/lesoul/catalog/products/old/photo.jpg") {
  const app = express(); registerStorageProxy(app);
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    return await new Promise<{ status: number; headers: Record<string, unknown>; body: string }>((resolve, reject) => {
      get({ hostname: "127.0.0.1", port: (server.address() as AddressInfo).port, path }, res => {
        let body = ""; res.on("data", chunk => { body += chunk; });
        res.on("end", () => resolve({ status: res.statusCode!, headers: res.headers, body }));
      }).on("error", reject);
    });
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
}

describe("Manus persistent storage compatibility", () => {
  it("keeps existing object keys and proxy references without local directory dependence", async () => {
    expect(await storageGet("/lesoul/catalog/products/old/photo.jpg")).toEqual({
      key: "lesoul/catalog/products/old/photo.jpg", url: "/manus-storage/lesoul/catalog/products/old/photo.jpg",
    });
    expect(request).not.toHaveBeenCalled();
  });
  it("uses an existing key without renaming it when requesting a temporary read URL", async () => {
    request.mockResolvedValue(new Response(JSON.stringify({ url: "https://objects.example.test/old.jpg?signature=fixture" })));
    await storageGetSignedUrl("lesoul/catalog/products/old/photo.jpg");
    const target = new URL(request.mock.calls[0][0]);
    expect(target.searchParams.get("path")).toBe("lesoul/catalog/products/old/photo.jpg");
  });
  it("persists a stable proxy reference rather than a signed upload URL", async () => {
    request.mockResolvedValueOnce(new Response(JSON.stringify({ url: "https://objects.example.test/upload?signature=fixture" })))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const result = await storagePut("lesoul/catalog/products/top/photo.jpg", "fixture", "image/jpeg");
    expect(result.key).toMatch(/^lesoul\/catalog\/products\/top\/photo_[a-f0-9]{8}\.jpg$/);
    expect(result.url).toBe(`/manus-storage/${result.key}`);
    expect(JSON.stringify(result)).not.toContain("signature");
  });
  it("never forwards raw provider bodies through storage errors", async () => {
    request.mockResolvedValue(new Response("PRIVATE_PROVIDER_DETAIL", { status: 403 }));
    await expect(storageGetSignedUrl("old.jpg")).rejects.toThrow("Storage signed URL failed (403)");
    await expect(storagePut("new.jpg", "fixture")).rejects.toThrow("Storage presign failed (403)");
  });
  it.each(["javascript:alert(1)", "http://objects.example.test/a", "https://user:private@objects.example.test/a", "", null])("rejects an invalid signed link: %s", async url => {
    request.mockResolvedValue(new Response(JSON.stringify({ url })));
    await expect(storageGetSignedUrl("old.jpg")).rejects.toThrow("Storage backend returned an invalid signed URL");
  });
  it("redirects existing product references with no-store", async () => {
    request.mockResolvedValue(new Response(JSON.stringify({ url: "https://objects.example.test/old.jpg?signature=fixture" })));
    const result = await proxy();
    expect(result.status).toBe(307); expect(result.headers["cache-control"]).toBe("no-store");
    expect(result.headers.location).toBe("https://objects.example.test/old.jpg?signature=fixture");
  });
  it("does not cache backend failures or leak their contents to logs", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockResolvedValue(new Response("PRIVATE_PROVIDER_DETAIL", { status: 503 }));
    const result = await proxy();
    expect(result.status).toBe(502); expect(result.headers["cache-control"]).toBe("no-store");
    expect(result.body).not.toContain("PRIVATE_PROVIDER_DETAIL");
    expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE_PROVIDER_DETAIL");
    request.mockResolvedValue(new Response(JSON.stringify({ url: "https://objects.example.test/recovered.jpg" })));
    expect((await proxy()).status).toBe(307);
  });
  it("redacts transport errors, including URLs attached by the HTTP client", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockRejectedValue(new Error("https://objects.example.test/PRIVATE_SIGNED_LINK"));
    expect((await proxy()).status).toBe(502);
    expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE_SIGNED_LINK");
  });
});
