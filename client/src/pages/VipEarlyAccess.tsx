import MobileScreen from "@/components/MobileScreen";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import ProductPrice from "@/components/ProductPrice";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { Crown, LockKeyhole, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function VipEarlyAccess() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const { user, loading } = useAuth();
  const catalog = trpc.catalog.browseProducts.useQuery(undefined, { refetchOnMount: "always" });
  const [detailId, setDetailId] = useState<number | null>(null);
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "MEMBERS' FIRST VIEW", title: "VIP EARLY ACCESS", body: "A private first look at selected LESOUL pieces before the public catalog.", empty: "No VIP early-access pieces are available yet.", lockedTitle: "VIP MEMBERS ONLY", lockedBody: "This first-view collection is reserved for VIP accounts.", browse: "BROWSE PRODUCTS", back: "HOME" },
    ko: { eyebrow: "VIP 먼저보기", title: "VIP 선공개 상품", body: "일반 카탈로그 공개 전에 VIP에게 먼저 보여드리는 LESOUL 선정 상품입니다.", empty: "현재 VIP 선공개 상품이 없습니다.", lockedTitle: "VIP 전용 창", lockedBody: "VIP 선공개 컬렉션은 VIP 계정만 볼 수 있습니다.", browse: "상품 둘러보기", back: "홈" },
    zh: { eyebrow: "VIP 抢先看", title: "VIP 抢先看商品", body: "LESOUL 精选商品将在公开目录前优先展示给 VIP。", empty: "目前没有 VIP 抢先看商品。", lockedTitle: "VIP 专属窗口", lockedBody: "VIP 抢先看系列仅向 VIP 账户开放。", browse: "浏览商品", back: "首页" },
  }[locale];
  const canView = user?.role === "vip" || user?.role === "admin";
  const products = (catalog.data ?? []).filter((product) => product.vipEarlyAccess === 1);

  if (!loading && !canView) return <MobileScreen><section className="lesoul-mobile-frame grid min-h-[70dvh] place-items-center px-5 text-center"><div className="max-w-sm rounded-[1.5rem] border border-[#dccfbc] bg-[#fffaf4] p-7"><LockKeyhole className="mx-auto text-[#825f36]" size={27} /><p className="mt-4 text-[10px] font-bold tracking-[.18em] text-[#825f36]">VIP</p><h1 className="mt-2 font-serif text-3xl text-[#231b14]">{copy.lockedTitle}</h1><p className="mt-3 text-sm leading-6 text-[#76685b]">{copy.lockedBody}</p><button onClick={() => navigate("/catalog")} className="mt-5 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white">{copy.browse}</button></div></section></MobileScreen>;

  return <MobileScreen><section className="lesoul-mobile-frame px-4 pb-8 pt-4 sm:px-6"><header className="rounded-[1.6rem] bg-[#2a211a] p-5 text-[#fffaf2]"><div className="flex items-center gap-2 text-[#e8c89e]"><Crown size={16} /><span className="text-[10px] font-bold tracking-[.18em]">{copy.eyebrow}</span></div><h1 className="mt-3 font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-md text-sm leading-5 text-[#efe1d0]">{copy.body}</p><button onClick={() => navigate("/")} className="mt-4 rounded-full border border-white/25 px-3 py-2 text-[10px] font-bold">← {copy.back}</button></header>{catalog.isLoading ? <div className="grid min-h-64 place-items-center"><span className="size-5 animate-spin rounded-full border-2 border-[#b3916b] border-t-transparent" /></div> : products.length ? <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{products.map((product) => <button key={product.id} onClick={() => setDetailId(product.id)} className="overflow-hidden rounded-[1.25rem] border border-[#decfbf] bg-white text-left shadow-[0_8px_20px_rgba(55,39,24,.07)] transition active:scale-[.98]"><div className="relative"><NormalizedProductImage src={product.imageViews?.front?.original ?? product.imageUrl} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-[3/4] w-full" /><span className="absolute left-2 top-2 rounded-full bg-[#825f36] px-2 py-1 text-[8px] font-bold tracking-[.1em] text-white">VIP FIRST</span></div><div className="p-3"><p className="truncate text-xs font-semibold text-[#2d241d]">{localizedProductName(product, i18n.language)}</p><ProductPrice product={product} className="mt-2 text-xs font-bold text-[#2d241d]" /></div></button>)}</section> : <section className="mt-10 rounded-[1.5rem] border border-dashed border-[#d8c8b6] bg-[#fffaf4] p-8 text-center"><ShoppingBag className="mx-auto text-[#90745b]" size={28} /><p className="mt-3 text-sm text-[#6d5b4a]">{copy.empty}</p></section>}{detailId !== null && <ProductDetailScreen productId={detailId} initialProduct={products.find((product) => product.id === detailId)} browseAll onClose={() => setDetailId(null)} />}</section></MobileScreen>;
}
