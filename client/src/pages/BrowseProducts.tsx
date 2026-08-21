import MobileScreen from "@/components/MobileScreen";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import PurchaseListAddButton from "@/components/PurchaseListAddButton";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { trpc } from "@/lib/trpc";
import { getVisitorId } from "@/lib/visitor";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import { formatKeyMeasurement } from "@shared/catalogDisplay";
import { localizedCategoryName } from "@shared/productCategories";
import { ChevronLeft, LoaderCircle, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"];

export default function BrowseProducts() {
  const [location, navigate] = useLocation();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "LESOUL COLLECTION", title: "BROWSE PRODUCTS", body: "Explore every active LESOUL piece, organised by category. Product browsing remains available even when image generation is unavailable.", back: "Home", all: "All", empty: "No products in this category yet.", loading: "Loading products…", measurements: "VIEW MEASUREMENTS", categories: { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" } },
    ko: { eyebrow: "LESOUL 컬렉션", title: "상품 둘러보기", body: "활성 LESOUL 상품을 종류별로 둘러보세요. 이미지 생성 횟수를 모두 사용한 뒤에도 상품 조회는 계속 이용할 수 있습니다.", back: "홈", all: "전체", empty: "이 종류에는 아직 등록된 상품이 없습니다.", loading: "상품을 불러오는 중…", measurements: "실측 사이즈 보기", categories: { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } },
    zh: { eyebrow: "LESOUL 系列", title: "浏览商品", body: "按品类浏览全部在售 LESOUL 商品。即使图像生成次数用完，仍可继续浏览商品。", back: "首页", all: "全部", empty: "该分类暂未上架商品。", loading: "正在加载商品…", measurements: "查看实测尺寸", categories: { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } },
  }[locale];
  const catalog = trpc.catalog.browseProducts.useQuery();
  const [category, setCategory] = useState<Category>("all");
  const [detailId, setDetailId] = useState<number | null>(null);
  const trackShareVisit = trpc.catalog.trackWeChatShareVisit.useMutation();
  const products = catalog.data ?? [];
  const visible = useMemo(() => category === "all" ? products : products.filter((product) => product.category === category), [category, products]);
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] ?? "");
    const sharedProductId = Number(params.get("product"));
    if (sharedProductId && products.some((product) => product.id === sharedProductId)) {
      setDetailId(sharedProductId);
      if (params.get("source") === "wechat_share") {
        const key = `lesoul.wechat-share.${sharedProductId}.${getVisitorId()}`;
        if (!window.sessionStorage.getItem(key)) {
          window.sessionStorage.setItem(key, "1");
          trackShareVisit.mutate({ productId: sharedProductId, visitorId: getVisitorId() });
        }
      }
    }
  }, [location, products]);

  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-7 pt-4 sm:px-6">
    <header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-md text-sm leading-5 text-[#71685f]">{copy.body}</p></div><button onClick={() => navigate("/")} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#ddd6cc] bg-white px-3 text-[10px] font-bold"><ChevronLeft size={14} />{copy.back}</button></header>
    <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={copy.title}><button onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === item ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.categories[item]}</button>)}</nav>
    {catalog.isLoading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></div> : visible.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{visible.map((product) => <article key={product.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#ded8cf] bg-white shadow-[0_8px_20px_rgba(38,31,24,.05)]"><button onClick={() => setDetailId(product.id)} className="flex min-h-0 flex-1 flex-col text-left transition active:scale-[.98]"><div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, language)} catalogDisplay={product.catalogDisplay} className="aspect-[3/4] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} /></div><div className="flex flex-1 flex-col p-3 pb-2"><p className="h-3 truncate text-[9px] font-bold tracking-[.13em] text-[#8b7b6b]">{product.brand ?? "\u00a0"}</p><p className="mt-1 truncate text-xs font-semibold leading-4 text-[#29231d]">{localizedProductName(product, language)}</p><div className="mt-2 min-h-4"><ProductPrice product={product} className="text-xs font-bold" /></div><p className="mt-1 min-h-3 truncate text-[10px] text-[#756b61]">{localizedCategoryName(product.displayCategory, language)}{formatKeyMeasurement(product, language) ? ` · ${formatKeyMeasurement(product, language)}` : ""}</p><p className="mt-1 min-h-3 truncate text-[9px] font-bold tracking-[.07em] text-[#8a7968]">{copy.measurements} →</p></div></button><div className="mt-auto px-3 pb-3"><PurchaseListAddButton product={{ id: product.id, name: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, imageUrl: customerProductImage(product.imageViews?.front, product.imageUrl), price: product.price, priceOriginal: product.priceOriginal, discountRate: product.discountRate, priceSale: product.priceSale, saleEnabled: product.saleEnabled, sizeOptions: product.sizeOptions, availabilityStatus: product.availabilityStatus, status: product.status }} source="catalog" className="w-full" /></div></article>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-[#d9d1c7] bg-white p-8 text-center"><ShoppingBag className="mx-auto text-[#86796d]" size={26} /><p className="mt-3 text-sm text-[#71675e]">{copy.empty}</p></div>}
    {detailId && <ProductDetailScreen productId={detailId} browseAll onClose={() => setDetailId(null)} />}
  </main></MobileScreen>;
}
