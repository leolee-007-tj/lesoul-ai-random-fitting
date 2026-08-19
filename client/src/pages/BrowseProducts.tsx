import MobileScreen from "@/components/MobileScreen";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import { formatPrice } from "@/lib/localeFormat";
import { getVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { ChevronLeft, LoaderCircle, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"];

export default function BrowseProducts() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "LESOUL COLLECTION", title: "BROWSE PRODUCTS", body: "Explore every active LESOUL piece, organised by category. Product browsing remains available even when image generation is unavailable.", back: "Home", all: "All", empty: "No products in this category yet.", loading: "Loading products…", categories: { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" } },
    ko: { eyebrow: "LESOUL 컬렉션", title: "상품 둘러보기", body: "활성 LESOUL 상품을 종류별로 둘러보세요. 이미지 생성 횟수를 모두 사용한 뒤에도 상품 조회는 계속 이용할 수 있습니다.", back: "홈", all: "전체", empty: "이 종류에는 아직 등록된 상품이 없습니다.", loading: "상품을 불러오는 중…", categories: { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } },
    zh: { eyebrow: "LESOUL 系列", title: "浏览商品", body: "按品类浏览全部在售 LESOUL 商品。即使图像生成次数用完，仍可继续浏览商品。", back: "首页", all: "全部", empty: "该分类暂未上架商品。", loading: "正在加载商品…", categories: { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } },
  }[locale];
  const catalog = trpc.catalog.browseProducts.useQuery();
  const [category, setCategory] = useState<Category>("all");
  const [detailId, setDetailId] = useState<number | null>(null);
  const products = catalog.data ?? [];
  const visible = useMemo(() => category === "all" ? products : products.filter((product) => product.category === category), [category, products]);
  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-7 pt-4 sm:px-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-md text-sm leading-5 text-[#71685f]">{copy.body}</p></div><button onClick={() => navigate("/")} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#ddd6cc] bg-white px-3 text-[10px] font-bold"><ChevronLeft size={14} />{copy.back}</button></header><nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={copy.title}><button onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === item ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.categories[item]}</button>)}</nav>{catalog.isLoading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></div> : visible.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{visible.map((product) => <button key={product.id} onClick={() => setDetailId(product.id)} className="overflow-hidden rounded-[1.25rem] border border-[#ded8cf] bg-white text-left shadow-[0_8px_20px_rgba(38,31,24,.05)] transition active:scale-[.98]"><img src={product.imageViews?.front?.original ?? product.imageUrl} alt={localizedProductName(product, language)} className="aspect-[3/4] w-full bg-[#e9e2d9] object-cover" /><div className="p-3">{product.brand && <p className="text-[9px] font-bold tracking-[.13em] text-[#8b7b6b]">{product.brand}</p>}<p className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-[#29231d]">{localizedProductName(product, language)}</p><p className="mt-2 text-xs font-bold text-[#4c4035]">{formatPrice(product.price, language)}</p><p className="mt-1 text-[10px] text-[#756b61]">{copy.categories[product.category as Exclude<Category, "all">] ?? product.category}</p></div></button>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-[#d9d1c7] bg-white p-8 text-center"><ShoppingBag className="mx-auto text-[#86796d]" size={26} /><p className="mt-3 text-sm text-[#71675e]">{copy.empty}</p></div>}{detailId && <ProductDetailScreen productId={detailId} browseAll onClose={() => setDetailId(null)} />}</main></MobileScreen>;
}
