import { usePurchaseList } from "@/contexts/PurchaseListContext";
import { trpc } from "@/lib/trpc";
import { Check, ClipboardPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ProductInput = { id: number; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; imageUrl: string; price: number; sizeOptions?: Array<{ label: string; available?: boolean }> | null; recommendedSize?: string | null };

export default function PurchaseListAddButton({ product, source = "detail", className = "" }: { product: ProductInput; source?: "ai_fitting" | "quick_fit" | "catalog" | "detail"; className?: string }) {
  const config = trpc.purchase.config.useQuery(); const { addItem, items } = usePurchaseList(); const { i18n } = useTranslation(); const [added, setAdded] = useState(false);
  const copy = i18n.language.startsWith("ko") ? { add: "구매목록 담기", added: "목록에 담김", limit: "목록 가득 참" } : i18n.language.startsWith("zh") ? { add: "加入购买清单", added: "已加入清单", limit: "清单已满" } : { add: "ADD TO LIST", added: "ADDED TO LIST", limit: "LIST FULL" };
  if ((config.data?.mode ?? "PURCHASE_LIST") !== "PURCHASE_LIST") return null;
  const sizes = product.sizeOptions?.filter((size) => size.available !== false && size.label.trim()).map((size) => size.label.trim()) ?? [];
  const selectedSize = sizes.length ? (product.recommendedSize && sizes.includes(product.recommendedSize) ? product.recommendedSize : sizes[0]) : "FREE";
  const alreadyListed = items.some((item) => item.productId === product.id && item.selectedSize === selectedSize);
  const limitReached = !alreadyListed && items.length >= (config.data?.maxItems ?? 10);
  return <button disabled={limitReached} onClick={(event) => { event.stopPropagation(); addItem({ productId: product.id, productName: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, productImage: product.imageUrl, selectedSize, availableSizes: sizes, recommendedSize: product.recommendedSize, currentPrice: product.price, source }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }} className={`inline-flex items-center justify-center gap-1 rounded-xl bg-black px-3 py-2 text-[10px] font-bold text-white transition active:scale-[.97] disabled:opacity-40 ${className}`}>{added ? <Check size={13} /> : <ClipboardPlus size={13} />}{limitReached ? copy.limit : added ? copy.added : copy.add}</button>;
}
