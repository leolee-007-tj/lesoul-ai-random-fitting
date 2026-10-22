import type { Express } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { products } from "../drizzle/schema";

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character); }

function absoluteUrl(origin: string, value: string | null | undefined) {
  if (!value) return `${origin}/favicon.ico`;
  try { return new URL(value, origin).toString(); } catch { return `${origin}/favicon.ico`; }
}

function localized(value: { name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; description: string; descriptionEn?: string | null; descriptionKo?: string | null; descriptionZh?: string | null }, language: string) {
  if (language === "ko") return { title: value.nameKo || value.name, description: value.descriptionKo || value.description };
  if (language === "zh") return { title: value.nameZh || value.name, description: value.descriptionZh || value.description };
  return { title: value.nameEn || value.name, description: value.descriptionEn || value.description };
}

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
  app.get("/share/product/:id", async (req, res) => {
    const origin = `${req.protocol}://${req.get("host")}`;
    const productId = Number(req.params.id);
    const language = req.query.lang === "ko" || req.query.lang === "zh" ? String(req.query.lang) : "en";
    const fallbackTitle = language === "ko" ? "LESOUL 상품" : language === "zh" ? "LESOUL 商品" : "LESOUL product";
    const fallbackDescription = language === "ko" ? "LESOUL 상품 상세를 확인해 보세요." : language === "zh" ? "查看 LESOUL 商品详情。" : "View this LESOUL product.";
    const target = `/catalog?product=${Number.isFinite(productId) ? productId : 0}&source=wechat_share`;
    try {
      const db = await getDb();
      const product = db && Number.isInteger(productId) ? (await db.select({ id: products.id, name: products.name, nameEn: products.nameEn, nameKo: products.nameKo, nameZh: products.nameZh, description: products.description, descriptionEn: products.descriptionEn, descriptionKo: products.descriptionKo, descriptionZh: products.descriptionZh, imageUrl: products.imageUrl, imageViews: products.imageViews }).from(products).where(eq(products.id, productId)).limit(1))[0] : null;
      if (product) {
        const text = localized(product, language);
        const imageViews = product.imageViews as { front?: string | null } | null;
        const image = absoluteUrl(origin, imageViews?.front || product.imageUrl);
        return res.type("html").set("Cache-Control", "public, max-age=300").send(`<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta property="og:type" content="product"><meta property="og:title" content="${escapeXml(text.title)}"><meta property="og:description" content="${escapeXml(text.description.slice(0, 240))}"><meta property="og:image" content="${escapeXml(image)}"><meta property="og:image:alt" content="${escapeXml(text.title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeXml(text.title)}"><meta name="twitter:description" content="${escapeXml(text.description.slice(0, 240))}"><meta name="twitter:image" content="${escapeXml(image)}"><meta http-equiv="refresh" content="0; url=${target}"><title>${escapeXml(text.title)}</title></head><body><a href="${target}">${escapeXml(text.title)}</a></body></html>`);
      }
    } catch { /* Fall through to a safe generic preview and client route. */ }
    return res.type("html").set("Cache-Control", "public, max-age=60").send(`<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta property="og:type" content="product"><meta property="og:title" content="${fallbackTitle}"><meta property="og:description" content="${fallbackDescription}"><meta property="og:image" content="${absoluteUrl(origin, null)}"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0; url=${target}"><title>${fallbackTitle}</title></head><body><a href="${target}">${fallbackDescription}</a></body></html>`);
  });
}
