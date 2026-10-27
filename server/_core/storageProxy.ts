import type { Express } from "express";
import { ENV } from "./env";
import { storageGetSignedUrl } from "../storage";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    // Both redirects and temporary backend failures must be revalidated. A
    // cached error can otherwise hide an existing product photo after recovery.
    res.set("Cache-Control", "no-store");
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const url = await storageGetSignedUrl(key);
      res.redirect(307, url);
    } catch {
      // Error objects and Forge response bodies may contain signed URLs/keys.
      console.error("[StorageProxy] backend request failed");
      res.status(502).send("Storage proxy error");
    }
  });
}
