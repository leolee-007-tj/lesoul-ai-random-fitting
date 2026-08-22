import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getReleaseSettings } from "../access";
import { getCatalog } from "../db";
import { getOriginalPrice } from "../../shared/productCommerce";
import { resolveCentralPrice, type PricingTier } from "../../shared/pricingPolicy";
import { customerProcedure, publicProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";

const requestItems = z.array(z.object({ productId: z.number().int().positive(), selectedSize: z.string().trim().min(1).max(32), quantity: z.number().int().min(1).max(99), purchaseType: z.enum(["NORMAL", "RESERVATION"]).optional() })).min(1).max(20);

function requestNumber() {
  const now = new Date();
  const date = `${String(now.getUTCFullYear()).slice(-2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  return `LS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export const purchaseRouter = router({
  config: publicProcedure.query(async () => {
    const settings = await getReleaseSettings();
    return { mode: settings.purchaseMode, maxItems: settings.purchaseListMaxItems, pricingMode: settings.pricingMode, purchaseNoticeEn: settings.purchaseNoticeEn, purchaseNoticeKo: settings.purchaseNoticeKo, purchaseNoticeZh: settings.purchaseNoticeZh };
  }),
  createRequest: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), items: requestItems, source: z.enum(["ai_fitting", "quick_fit", "catalog", "detail"]).optional(), generationId: z.string().max(96).nullable().optional(), lookId: z.string().max(96).nullable().optional() })).mutation(async ({ input, ctx }) => {
    const visitorId = resolveCustomerVisitorId(ctx, input.visitorId);
    const settings = await getReleaseSettings();
    if (settings.purchaseMode !== "PURCHASE_LIST") throw new Error("PURCHASE_LIST_MODE_UNAVAILABLE");
    if (input.items.length > settings.purchaseListMaxItems) throw new Error("PURCHASE_LIST_LIMIT_REACHED");
    const catalog = await getCatalog();
    const current = new Map(catalog.products.map((product) => [product.id, product]));
    const unavailable = input.items.find((item) => { const product = current.get(item.productId); return !product || product.isActive === 0 || product.availabilityStatus === "SOLD_OUT"; });
    if (unavailable) throw new Error(`PURCHASE_ITEM_UNAVAILABLE:${unavailable.productId}`);
    const invalidSize = input.items.find((item) => {
      const product = current.get(item.productId)!;
      const allowed = product.sizeOptions?.filter((size) => size.available !== false).map((size) => size.label.trim()) ?? [];
      return allowed.length ? !allowed.includes(item.selectedSize) : !(item.selectedSize === "F" || item.selectedSize === "FREE");
    });
    if (invalidSize) throw new Error(`PURCHASE_SIZE_UNAVAILABLE:${invalidSize.productId}`);
    const pricingTier: PricingTier = ctx.user?.role === "vip" ? "VIP" : "NORMAL";
    const totalUnits = input.items.reduce((sum, item) => sum + item.quantity, 0);
    const items = input.items.map((item) => {
      const product = current.get(item.productId)!;
      const pricing = resolveCentralPrice(getOriginalPrice(product), { mode: settings.pricingMode, tier: pricingTier, quantity: totalUnits, normalDiscountPercent: product.normalDiscountPercent, vipDiscountPercent: product.vipDiscountPercent });
      return { productId: product.id, productName: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, productImage: product.imageViews?.front?.original ?? product.imageUrl, catalogDisplay: product.catalogDisplay, selectedSize: item.selectedSize, quantity: item.quantity, currentPrice: pricing.unitPrice, status: product.status, availabilityStatus: product.availabilityStatus, purchaseType: product.availabilityStatus === "PRE_ORDER" ? "RESERVATION" as const : "NORMAL" as const };
    });
    const referenceTotal = items.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
    return { purchaseRequestId: requestNumber(), createdAt: new Date(), visitorId, source: input.source ?? "detail", generationId: input.generationId ?? null, lookId: input.lookId ?? null, releaseMode: settings.releaseMode, items, referenceTotal, purchaseNoticeEn: settings.purchaseNoticeEn, purchaseNoticeKo: settings.purchaseNoticeKo, purchaseNoticeZh: settings.purchaseNoticeZh };
  }),
});
