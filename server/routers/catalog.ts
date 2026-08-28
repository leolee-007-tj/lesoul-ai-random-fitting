import { z } from "zod";
import { createGeneration, getCatalog, getGenerationForUser, getProductDetailById, listGenerationsForUser, recordWeChatProductShareVisit, saveGeneration, updateGenerationResult } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";
import { selectOutfit } from "../styling";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { canViewVipEarlyAccess, getCurrentEntitlement, getReleaseSettings, selectVisibleProducts } from "../access";
import { getPurchaseAvailability } from "../../shared/purchasePolicy";

const lookCode = () => `LOOK-${Math.floor(100 + Math.random() * 900)}`;

async function createEditorialFallback(id: number, look: string, place: string) {
  const safeLook = look.replace(/[<>&"']/g, "");
  const safePlace = place.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500"><rect width="1200" height="1500" fill="#e8ddd0"/><rect x="70" y="70" width="1060" height="1360" rx="48" fill="#fdf9f3" stroke="#b89e83" stroke-width="2"/><circle cx="965" cy="235" r="215" fill="#d2bba4" opacity=".45"/><rect x="168" y="365" width="864" height="650" rx="340" fill="#40332b"/><rect x="252" y="464" width="696" height="510" rx="260" fill="#8b7355"/><text x="125" y="180" fill="#705b49" font-family="serif" font-size="38" letter-spacing="11">LESOUL LOOK</text><text x="125" y="1205" fill="#3d3028" font-family="serif" font-size="90">EDITORIAL</text><text x="130" y="1272" fill="#806753" font-family="sans-serif" font-size="26" letter-spacing="5">${safeLook}</text><text x="130" y="1345" fill="#806753" font-family="sans-serif" font-size="25">${safePlace} · CURATED STYLE PREVIEW</text></svg>`;
  return storagePut(`lesoul/editorials/${id}-fallback.svg`, svg, "image/svg+xml");
}

export const catalogRouter = router({
  branding: publicProcedure.query(async () => {
    const settings = await getReleaseSettings();
    return { storeName: settings.storeName || "LESOUL LOOK", storeTaglineEn: settings.storeTaglineEn || "A quieter way to discover your next LOOK.", storeTaglineKo: settings.storeTaglineKo || "다음 LOOK을 더 조용하고 선명하게 발견하는 방법.", storeTaglineZh: settings.storeTaglineZh || "以更安静、更清晰的方式发现你的下一套 LOOK。" };
  }),
  presenceAlertConfig: publicProcedure.query(async () => {
    const settings = await getReleaseSettings();
    const enabled = Boolean(settings.presenceAlertEnabled && settings.presenceAlertSoundUrl);
    return { enabled, soundUrl: enabled ? settings.presenceAlertSoundUrl : null };
  }),
  bootstrap: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96).optional() }).optional()).query(async ({ input, ctx }) => {
    const [catalog, settings, entitlement] = await Promise.all([getCatalog(), getReleaseSettings(), input?.visitorId ? getCurrentEntitlement(input.visitorId) : undefined]);
    const tier = settings.releaseMode === "PRIVATE" ? "full" : settings.releaseMode === "BETA_PUBLIC" ? "beta" : entitlement?.catalogTier ?? "beta";
    const customerProducts = selectVisibleProducts(catalog.products, tier, settings.betaCatalogLimit, ctx.user?.role).map(({ purchaseUrl, purchasePlatform, ...product }) => product);
    return { ...catalog, products: customerProducts, access: { releaseMode: settings.releaseMode, catalogTier: tier, betaCatalogLimit: settings.betaCatalogLimit, generationEnabled: Boolean(settings.generationEnabled) } };
  }),
  products: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96).optional() }).optional()).query(async ({ input, ctx }) => {
    const [catalog, settings, entitlement] = await Promise.all([getCatalog(), getReleaseSettings(), input?.visitorId ? getCurrentEntitlement(input.visitorId) : undefined]);
    const tier = settings.releaseMode === "PRIVATE" ? "full" : settings.releaseMode === "BETA_PUBLIC" ? "beta" : entitlement?.catalogTier ?? "beta";
    return selectVisibleProducts(catalog.products, tier, settings.betaCatalogLimit, ctx.user?.role).map(({ purchaseUrl, purchasePlatform, ...product }) => product);
  }),
  browseProducts: publicProcedure.query(async ({ ctx }) => (await getCatalog()).products.filter((product) => product.isActive !== 0 && canViewVipEarlyAccess(product, ctx.user?.role)).map(({ purchaseUrl, purchasePlatform, ...product }) => product)),
  productDetail: publicProcedure.input(z.object({ productId: z.number().int().positive(), visitorId: z.string().min(1).max(96).optional(), browseAll: z.boolean().optional() })).query(async ({ input, ctx }) => {
    const [product, settings, entitlement] = await Promise.all([getProductDetailById(input.productId), getReleaseSettings(), input.visitorId ? getCurrentEntitlement(input.visitorId) : undefined]);
    if (!product) return { status: "not_found" as const, product: null };
    const tier = settings.releaseMode === "PRIVATE" ? "full" : settings.releaseMode === "BETA_PUBLIC" ? "beta" : entitlement?.catalogTier ?? "beta";
    const visible = canViewVipEarlyAccess(product, ctx.user?.role) && (input.browseAll
      ? product.isActive !== 0
      : tier === "beta"
        ? selectVisibleProducts((await getCatalog()).products, tier, settings.betaCatalogLimit, ctx.user?.role).some((item) => item.id === product.id)
        : selectVisibleProducts([product], tier, settings.betaCatalogLimit, ctx.user?.role).some((item) => item.id === product.id));
    if (!visible) return { status: "not_found" as const, product: null };
    const purchaseStatus = getPurchaseAvailability({ exists: true, enabled: Boolean(settings.purchaseQrEnabled), status: product.status, purchaseQrUrl: product.purchaseQrUrl });
    return {
      status: "available" as const,
      purchaseStatus,
      product: {
        id: product.id, name: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh,
        brand: product.brand, category: product.category, displayCategory: product.displayCategory ?? null, season: product.season, color: product.color, style: product.style,
        status: product.status, isActive: product.isActive, availabilityStatus: product.availabilityStatus, vipEarlyAccess: product.vipEarlyAccess, isNew: product.isNew, newArrivalAt: product.newArrivalAt, price: product.price, priceOriginal: product.priceOriginal, normalDiscountPercent: product.normalDiscountPercent, vipDiscountPercent: product.vipDiscountPercent, productType: product.productType, setComponents: product.setComponents, discountRate: product.discountRate, priceSale: product.priceSale, saleEnabled: product.saleEnabled, imageUrl: product.imageUrl, images: product.images, imageViews: product.imageViews,
        description: product.description, descriptionEn: product.descriptionEn, descriptionKo: product.descriptionKo, descriptionZh: product.descriptionZh,
        garmentMeasurements: product.garmentMeasurements, catalogDisplay: product.catalogDisplay, sizeOptions: product.sizeOptions, stretchLevel: product.stretchLevel,
      },
    };
  }),
  trackWeChatShareVisit: publicProcedure.input(z.object({ productId: z.number().int().positive(), visitorId: z.string().min(1).max(96) })).mutation(async ({ input, ctx }) => ({ tracked: ctx.user?.role === "admin" ? false : await recordWeChatProductShareVisit(input) })),
  poses: publicProcedure.query(async () => (await getCatalog()).poses),
  backgrounds: publicProcedure.query(async () => (await getCatalog()).backgrounds),
  purchaseInfo: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(async ({ input, ctx }) => {
    const [catalog, settings] = await Promise.all([getCatalog(), getReleaseSettings()]);
    const product = catalog.products.find((item) => item.id === input.productId);
    const permittedProduct = product && canViewVipEarlyAccess(product, ctx.user?.role) ? product : undefined;
    const status = getPurchaseAvailability({ exists: Boolean(permittedProduct), enabled: Boolean(settings.purchaseQrEnabled), status: permittedProduct?.status, purchaseQrUrl: permittedProduct?.purchaseQrUrl });
    const notices = { purchaseNoticeEn: settings.purchaseNoticeEn, purchaseNoticeKo: settings.purchaseNoticeKo, purchaseNoticeZh: settings.purchaseNoticeZh };
    if (!permittedProduct || status === "not_found" || status === "feature_off" || status === "sold_out") return { status, product: null, ...notices };
    if (status === "consult") return { status, product: { id: permittedProduct.id, name: permittedProduct.name, nameEn: permittedProduct.nameEn, nameKo: permittedProduct.nameKo, nameZh: permittedProduct.nameZh, imageUrl: permittedProduct.imageUrl, price: permittedProduct.price, priceOriginal: permittedProduct.priceOriginal, discountRate: permittedProduct.discountRate, priceSale: permittedProduct.priceSale, saleEnabled: permittedProduct.saleEnabled }, ...notices };
    return { status: "available" as const, product: { id: permittedProduct.id, name: permittedProduct.name, nameEn: permittedProduct.nameEn, nameKo: permittedProduct.nameKo, nameZh: permittedProduct.nameZh, imageUrl: permittedProduct.imageUrl, price: permittedProduct.price, priceOriginal: permittedProduct.priceOriginal, discountRate: permittedProduct.discountRate, priceSale: permittedProduct.priceSale, saleEnabled: permittedProduct.saleEnabled, purchaseQrUrl: permittedProduct.purchaseQrUrl, purchaseQrUpdatedAt: permittedProduct.purchaseQrUpdatedAt }, ...notices };
  }),
});

export const generationRouter = router({
  prepare: protectedProcedure.input(z.object({ userPhotoUrl: z.string().min(1), poseId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const catalog = await getCatalog();
    const pose = catalog.poses.find((item) => item.id === input.poseId);
    if (!pose) throw new Error("선택한 포즈를 찾을 수 없습니다.");
    const outfit = selectOutfit(catalog.products, catalog.backgrounds);
    const id = await createGeneration({
      userId: ctx.user.id,
      userPhotoUrl: input.userPhotoUrl,
      poseId: pose.id,
      backgroundId: outfit.background.id,
      topProductId: outfit.top?.id,
      bottomProductId: outfit.bottom?.id,
      outerProductId: outfit.outer?.id,
      dressProductId: outfit.dress?.id,
      lookCode: lookCode(),
    });
    return { id, outfit, pose };
  }),
  list: protectedProcedure.query(async ({ ctx }) => listGenerationsForUser(ctx.user.id)),
  byId: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => getGenerationForUser(input.id, ctx.user.id)),
  generate: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async () => {
    throw new Error("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
  }),
  save: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await saveGeneration(input.id, ctx.user.id);
    return { success: true };
  }),
});
