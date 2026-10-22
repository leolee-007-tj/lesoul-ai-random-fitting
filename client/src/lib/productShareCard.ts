import { getOriginalPrice, localizedProductName } from "@shared/productCommerce";
import { formatCentralDiscount, resolveCentralPrice, type PricingMode } from "@shared/pricingPolicy";

type Locale = "en" | "ko" | "zh";

export type ProductShareCardData = {
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  brand?: string | null;
  imageUrl: string;
  price?: number | null;
  priceOriginal?: number | null;
  normalDiscountPercent?: number | null;
  vipDiscountPercent?: number | null;
  priceSale?: number | null;
  discountRate?: number | null;
  saleEnabled?: number | boolean | null;
  centralSaleEnabled?: number | boolean | null;
  isNew?: number | boolean | null;
  excludeNewArrivalsFromSale?: number | boolean | null;
  saleEndsAt?: Date | string | null;
  pricingMode?: PricingMode | null;
};

function normalizeForCommerce(product: ProductShareCardData) {
  return { ...product, price: product.price ?? undefined, priceOriginal: product.priceOriginal ?? undefined, priceSale: product.priceSale ?? undefined, discountRate: product.discountRate ?? undefined };
}

export function productShareCardPrice(product: ProductShareCardData, locale: Locale) {
  const normalized = normalizeForCommerce(product);
  const price = resolveCentralPrice(getOriginalPrice(normalized), { mode: product.pricingMode, centralSaleEnabled: product.centralSaleEnabled, tier: "NORMAL", normalDiscountPercent: product.normalDiscountPercent, vipDiscountPercent: product.vipDiscountPercent, isNew: product.isNew, excludeNewArrivalsFromSale: product.excludeNewArrivalsFromSale, saleEndsAt: product.saleEndsAt });
  const formatter = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "en-US", { style: "currency", currency: "CNY", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return { price: formatter.format(price.unitPrice), original: formatter.format(price.original), discount: formatCentralDiscount(price.discountPercent, locale) };
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

export async function buildProductShareCard(product: ProductShareCardData, locale: Locale): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Share card rendering is unavailable.");
  context.fillStyle = "#f7f4ee";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#191512";
  context.font = "600 40px Georgia, serif";
  context.fillText("LESOUL", 68, 86);
  context.fillStyle = "#756b60";
  context.font = "700 16px Arial, sans-serif";
  context.fillText("THE QUIET LUXURY EDIT", 70, 120);

  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load the product image for a share card."));
    image.src = product.imageUrl;
  });
  context.save();
  context.beginPath();
  context.roundRect(68, 170, 944, 820, 34);
  context.clip();
  drawCover(context, image, 68, 170, 944, 820);
  context.restore();

  const name = localizedProductName(normalizeForCommerce(product), locale);
  const price = productShareCardPrice(product, locale);
  context.fillStyle = "#8a7a6b";
  context.font = "700 16px Arial, sans-serif";
  context.fillText((product.brand || "LESOUL").toUpperCase(), 70, 1068);
  context.fillStyle = "#191512";
  context.font = "500 42px Georgia, serif";
  const title = name.length > 36 ? `${name.slice(0, 33)}…` : name;
  context.fillText(title, 68, 1128);
  context.font = "700 32px Arial, sans-serif";
  context.fillText(price.price, 68, 1192);
  if (price.original) {
    context.fillStyle = "#8a7a6b";
    context.font = "400 20px Arial, sans-serif";
    context.fillText(price.original, 228, 1192);
    context.strokeStyle = "#8a7a6b";
    context.lineWidth = 2;
    context.beginPath(); context.moveTo(228, 1184); context.lineTo(228 + context.measureText(price.original).width, 1184); context.stroke();
  }
  if (price.discount) {
    context.fillStyle = "#191512";
    context.font = "700 16px Arial, sans-serif";
    context.fillText(price.discount, 70, 1242);
  }
  context.fillStyle = "#756b60";
  context.font = "500 16px Arial, sans-serif";
  context.fillText("lesoulai.com · Scan or open the shared link to view details", 68, 1300);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create the product share card.")), "image/jpeg", 0.94));
}
