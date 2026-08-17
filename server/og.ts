import type { Express } from "express";

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character); }

function ogSvg(lookCode: string) {
  const code = escapeXml(lookCode.slice(0, 48) || "LOOK");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f5f2ec"/><rect x="628" y="42" width="500" height="546" rx="28" fill="#24211e"/><rect x="664" y="78" width="428" height="390" rx="18" fill="#d9d1c6"/><path d="M878 154c-54 0-98 44-98 98v104h196V252c0-54-44-98-98-98z" fill="#847568"/><circle cx="878" cy="182" r="42" fill="#c7b2a0"/><path d="M805 391h146l-24 117H829z" fill="#f8f6f1"/><text x="72" y="104" font-family="Georgia, serif" font-size="48" font-weight="600" fill="#171717">LESOUL AI LOOK</text><text x="72" y="496" font-family="Arial, sans-serif" font-size="20" letter-spacing="4" fill="#70675e">${code}</text><text x="72" y="548" font-family="Georgia, serif" font-size="30" fill="#171717">Create your own AI fashion look</text></svg>`;
}

export function registerOgRoutes(app: Express) {
  app.get("/api/og/look", (req, res) => { res.type("image/svg+xml").set("Cache-Control", "public, max-age=3600").send(ogSvg(String(req.query.code ?? "LESOUL LOOK"))); });
  app.get("/share/:code", (req, res) => {
    const code = String(req.params.code).slice(0, 48);
    const origin = `${req.protocol}://${req.get("host")}`;
    const image = `${origin}/api/og/look?code=${encodeURIComponent(code)}`;
    const target = `/?look=${encodeURIComponent(code)}`;
    res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta property="og:title" content="LESOUL AI LOOK ${escapeXml(code)}"><meta property="og:description" content="Check out this AI-generated fashion look featuring LESOUL products."><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=${target}"><title>LESOUL AI LOOK ${escapeXml(code)}</title></head><body></body></html>`);
  });
}
