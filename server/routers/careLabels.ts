import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, ownerProcedure, router } from "../_core/trpc";
import { getCareLabelAdminData, getCareLabelProduct, getCareLabelPublicSettings, listCareLabelProducts, setCareLabelProductSymbols, updateCareLabelPrivatePrice, updateCareLabelProduct, updateCareLabelSettings, updateCareLabelSymbol } from "../careLabelsDb";
import { normalizeCareLabelData } from "../../shared/careLabels";

const productId = z.string().regex(/^LS-\d{4}$/);
const careData = z.record(z.string(), z.unknown()).superRefine((value, ctx) => {
  try { normalizeCareLabelData(value); } catch (error) { ctx.addIssue({ code: "custom", message: error instanceof Error ? error.message : "CARE_LABEL_DATA_INVALID" }); }
});
const imageUrl = z.string().max(2_000_000).refine((value) => value === "" || /^https?:\/\//.test(value) || /^\/manus-storage\//.test(value), "CARE_LABEL_IMAGE_URL_INVALID");

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : "CARE_LABEL_ERROR";
  const code = message.includes("CONFLICT") ? "CONFLICT" : message.includes("INVALID") ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR";
  throw new TRPCError({ code, message });
}

export const careLabelsRouter = router({
  catalog: publicProcedure.query(async () => {
    try { const [products, settings] = await Promise.all([listCareLabelProducts(), getCareLabelPublicSettings()]); return { products, settings }; } catch (error) { return mapError(error); }
  }),
  product: publicProcedure.input(z.object({ id: productId })).query(async ({ input }) => {
    try { return getCareLabelProduct(input.id); } catch (error) { return mapError(error); }
  }),
  admin: ownerProcedure.query(async () => {
    try { return getCareLabelAdminData(); } catch (error) { return mapError(error); }
  }),
  updateProduct: ownerProcedure.input(z.object({ id: productId, revision: z.number().int().min(0), data: careData })).mutation(async ({ input }) => {
    try { return updateCareLabelProduct({ id: input.id, revision: input.revision, data: normalizeCareLabelData(input.data) }); } catch (error) { return mapError(error); }
  }),
  updateSettings: ownerProcedure.input(z.object({ revision: z.number().int().min(0), wechatQrUrl: imageUrl.nullable() })).mutation(async ({ input }) => {
    try { return updateCareLabelSettings(input); } catch (error) { return mapError(error); }
  }),
  updatePrivatePrice: ownerProcedure.input(z.object({ id: productId, revision: z.number().int().min(0), amount: z.string().regex(/^$|^\d{1,9}(\.\d{1,2})?$/), currency: z.enum(["CNY", "KRW"]) })).mutation(async ({ input }) => {
    try { return updateCareLabelPrivatePrice(input); } catch (error) { return mapError(error); }
  }),
  updateSymbol: ownerProcedure.input(z.object({ id: z.number().int().positive().optional(), key: z.string().trim().min(1).max(64), nameZh: z.string().trim().min(1).max(160), descriptionZh: z.string().trim().max(2000), imageUrl: imageUrl.nullable().optional(), sortOrder: z.number().int().min(0).max(9999), isActive: z.number().int().min(0).max(1) })).mutation(async ({ input }) => {
    try { return updateCareLabelSymbol(input); } catch (error) { return mapError(error); }
  }),
  setProductSymbols: ownerProcedure.input(z.object({ productId, symbolIds: z.array(z.number().int().positive()).max(12) })).mutation(async ({ input }) => {
    try { return setCareLabelProductSymbols(input); } catch (error) { return mapError(error); }
  }),
});
