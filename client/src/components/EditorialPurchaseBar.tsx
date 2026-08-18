import PurchaseScreen from "@/components/PurchaseScreen";
import { formatPrice } from "@/lib/localeFormat";
import { localizedProductName } from "@shared/productCommerce";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type PurchaseProduct = { id: number; imageUrl: string; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; description?: string; descriptionEn?: string | null; descriptionKo?: string | null; descriptionZh?: string | null; price: number; purchaseQrUrl?: string | null };

export default function EditorialPurchaseBar({ products }: { products: PurchaseProduct[] }) {
  const { i18n } = useTranslation(); const [productId, setProductId] = useState<number | null>(null);
  const copy = i18n.language.startsWith("ko") ? { title: "에디토리얼 상품", buy: "구매하기", consult: "구매 문의" } : i18n.language.startsWith("zh") ? { title: "编辑精选商品", buy: "购买", consult: "咨询购买" } : { title: "EDITORIAL PRODUCTS", buy: "BUY", consult: "PURCHASE INQUIRY" };
  return <section className="mt-5 rounded-[1.5rem] bg-[#ece8e0] p-4"><p className="text-[10px] font-bold tracking-[.16em] text-[#554c43]">{copy.title}</p><div className="mt-3 flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">{products.map((product) => <article key={product.id} className="w-[62vw] max-w-52 shrink-0 snap-start overflow-hidden rounded-xl bg-white"><img src={product.imageUrl} alt={localizedProductName(product, i18n.language)} className="aspect-[4/5] w-full object-cover" /><div className="p-3"><p className="truncate text-xs font-semibold">{localizedProductName(product, i18n.language)}</p><p className="mt-1 text-[11px] text-[#777]">{formatPrice(product.price, i18n.language)}</p><button onClick={() => setProductId(product.id)} className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold ${product.purchaseQrUrl ? "bg-black text-white" : "border border-[#d8d2ca] text-[#675c51]"}`} aria-label={product.purchaseQrUrl ? copy.buy : copy.consult}><QrCode size={12} aria-hidden="true" />{product.purchaseQrUrl ? copy.buy : copy.consult}</button></div></article>)}</div>{productId && <PurchaseScreen productId={productId} onClose={() => setProductId(null)} />}</section>;
}
