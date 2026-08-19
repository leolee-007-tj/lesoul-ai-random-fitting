import MobileScreen from "@/components/MobileScreen";
import StylistPanel, { type StylistProduct } from "@/components/StylistPanel";
import { usePurchaseList } from "@/contexts/PurchaseListContext";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const sizesFor = (product: { sizeOptions?: Array<{ label?: string }> | null }) => product.sizeOptions?.map((size) => size.label).filter((label): label is string => Boolean(label)) ?? ["FREE"];

export default function StyleMatch() {
  const { i18n } = useTranslation();
  const [, navigate] = useLocation();
  const { addItem } = usePurchaseList();
  const catalog = trpc.catalog.browseProducts.useQuery();
  const [notice, setNotice] = useState<string | null>(null);
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = { en: { eyebrow: "AI STYLE MATCH", title: "Build a complete LOOK from one product", body: "Choose one available LESOUL item. AI matches the remaining pieces from active inventory.", added: "The complete LOOK was added to your purchase list.", list: "VIEW PURCHASE LIST", error: "Please select another item and try again." }, ko: { eyebrow: "AI 스타일 매치", title: "상품 하나로 완성 코디 찾기", body: "판매 중인 LESOUL 상품 하나를 고르면 AI가 나머지 코디를 실제 재고에서 추천합니다.", added: "완성 코디를 구매목록에 담았습니다.", list: "구매목록 보기", error: "다른 상품을 선택해 다시 시도해 주세요." }, zh: { eyebrow: "AI 搭配推荐", title: "从一件商品开始完成整套搭配", body: "选择一件在售 LESOUL 商品，AI 会从实际库存中搭配其余单品。", added: "完整搭配已加入购买清单。", list: "查看购买清单", error: "请选择其他商品后重试。" } }[locale];
  const products = (catalog.data ?? []).filter((product) => product.status === "in_stock" && product.availabilityStatus === "AVAILABLE");
  const useLook = (selection: { products: StylistProduct[] }) => {
    for (const styled of selection.products) {
      const product = products.find((item) => item.id === styled.id);
      if (!product) continue;
      const sizes = sizesFor(product);
      addItem({ productId: product.id, productName: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, productImage: product.imageViews?.front?.original ?? product.imageUrl, catalogDisplay: product.catalogDisplay, selectedSize: sizes[0] ?? "FREE", availableSizes: sizes, quantity: 1, currentPrice: product.price, source: "catalog" });
    }
    setNotice(copy.added);
  };
  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-10 pt-4 sm:px-6"><p className="text-[10px] font-bold tracking-[.18em] text-[#746a60]">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-3xl text-[#2d2722]">{copy.title}</h1><p className="mt-2 text-sm leading-5 text-[#746d65]">{copy.body}</p>{notice && <section className="mt-4 rounded-xl border border-[#ded6cb] bg-[#f8f5ef] p-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#41372e]"><Check size={15} />{notice}</span><button onClick={() => navigate("/purchase-list")} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-bold text-white"><ShoppingBag size={14} />{copy.list}</button></section>}<StylistPanel products={products} requireAnchor onUseLook={useLook} onError={() => setNotice(copy.error)} /></main></MobileScreen>;
}
