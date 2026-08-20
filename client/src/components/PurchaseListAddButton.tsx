import { usePurchaseList } from "@/contexts/PurchaseListContext";
import { trpc } from "@/lib/trpc";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";
import { getEffectivePrice } from "@shared/productCommerce";
import { normaliseAvailabilityStatus } from "@shared/productAvailability";
import { Check, ClipboardPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ProductInput = { id: number; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; imageUrl: string; price: number; priceOriginal?: number | null; discountRate?: number | null; priceSale?: number | null; saleEnabled?: number | boolean | null; catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null; sizeOptions?: Array<{ label: string; available?: boolean }> | null; recommendedSize?: string | null; availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "SOLD_OUT" | "PRE_ORDER" | null; status?: string | null };

export default function PurchaseListAddButton({ product, source = "detail", className = "" }: { product: ProductInput; source?: "ai_fitting" | "quick_fit" | "catalog" | "detail"; className?: string }) {
  const config = trpc.purchase.config.useQuery(); const { addItem, items } = usePurchaseList(); const { t } = useTranslation(); const [added, setAdded] = useState(false);
  const copy = { add: t("product.addToPurchaseList"), added: t("product.addedToPurchaseList"), limit: t("product.listFull"), sold: t("product.soldOutNotice"), reserve: t("product.reserve") };
  if ((config.data?.mode ?? "PURCHASE_LIST") !== "PURCHASE_LIST") return null;
  const sizes = product.sizeOptions?.filter((size) => size.available !== false && size.label.trim()).map((size) => size.label.trim()) ?? [];
  const selectedSize = sizes.length ? (product.recommendedSize && sizes.includes(product.recommendedSize) ? product.recommendedSize : sizes[0]) : "FREE";
  const availability = normaliseAvailabilityStatus(product.availabilityStatus, product.status); const soldOut = availability === "SOLD_OUT"; const reservation = availability === "PRE_ORDER";
  const alreadyListed = items.some((item) => item.productId === product.id && item.selectedSize === selectedSize);
  const limitReached = !alreadyListed && items.length >= (config.data?.maxItems ?? 10);
  return <button disabled={limitReached || soldOut} onClick={(event) => { event.stopPropagation(); addItem({ productId: product.id, productName: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, productImage: product.imageUrl, catalogDisplay: product.catalogDisplay, selectedSize, availableSizes: sizes, recommendedSize: product.recommendedSize, currentPrice: getEffectivePrice(product), purchaseType: reservation ? "RESERVATION" : "NORMAL", source }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }} className={`inline-flex items-center justify-center gap-1 rounded-xl bg-black px-3 py-2 text-[10px] font-bold text-white transition active:scale-[.97] disabled:opacity-40 ${className}`}>{added ? <Check size={13} /> : <ClipboardPlus size={13} />}{soldOut ? copy.sold : limitReached ? copy.limit : added ? copy.added : reservation ? copy.reserve : copy.add}</button>;
}
