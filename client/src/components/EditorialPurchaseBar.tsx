import PurchaseScreen from "@/components/PurchaseScreen";
import { formatPrice } from "@/lib/localeFormat";
import { localizedProductName } from "@shared/productCommerce";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type PurchaseProduct = { id: number; imageUrl: string; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; description?: string; descriptionEn?: string | null; descriptionKo?: string | null; descriptionZh?: string | null; price: number; purchaseQrUrl?: string | null };

export default function EditorialPurchaseBar({ products }: { products: PurchaseProduct[] }) {
  const { i18n } = useTranslation(); const [productId, setProductId] = useState<number | null>(null);
  return <section className="mt-5 rounded-[1.5rem] bg-[#ece8e0] p-4"><p className="text-[10px] font-bold tracking-[.16em] text-[#554c43]">EDITORIAL PRODUCTS</p><div className="mt-3 grid gap-2">{products.map((product) => <article key={product.id} className="flex items-center gap-3 rounded-xl bg-white p-2"><img src={product.imageUrl} alt={localizedProductName(product, i18n.language)} className="size-14 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{localizedProductName(product, i18n.language)}</p><p className="mt-0.5 text-[11px] text-[#777]">{formatPrice(product.price, i18n.language)}</p></div><button onClick={() => setProductId(product.id)} className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold ${product.purchaseQrUrl ? "bg-black text-white" : "border border-[#d8d2ca] text-[#675c51]"}`}><QrCode size={12} />{product.purchaseQrUrl ? "BUY" : "咨询购买"}</button></article>)}</div>{productId && <PurchaseScreen productId={productId} onClose={() => setProductId(null)} />}</section>;
}
