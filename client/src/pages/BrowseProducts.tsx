import MobileScreen from "@/components/MobileScreen";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import BlackColorVerificationNotice from "@/components/BlackColorVerificationNotice";
import { trpc } from "@/lib/trpc";
import { getVisitorId } from "@/lib/visitor";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import { formatKeyMeasurement } from "@shared/catalogDisplay";
import { localizedCategoryName } from "@shared/productCategories";
import { isNewArrival } from "@shared/productAvailability";
import { isSetProduct } from "@shared/setProducts";
import { ChevronLeft, LoaderCircle, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export const CUSTOMER_CATALOG_PAGE_SIZE = 6;

function chunkProducts<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
}

export default function BrowseProducts() {
  const [location, navigate] = useLocation();
  const { i18n } = useTranslation();
  const utils = trpc.useUtils();
  const language = i18n.language;
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "LESOUL COLLECTION", title: "BROWSE PRODUCTS", body: "Explore every active LESOUL piece, organised by category. Product browsing remains available even when image generation is unavailable.", back: "Home", all: "All", newArrivals: "NEW ARRIVALS", allProducts: "ALL PRODUCTS", empty: "No products in this category yet.", loading: "Loading products…", loadingMore: "Loading more products…", measurements: "VIEW MEASUREMENTS", categories: { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" } },
    ko: { eyebrow: "LESOUL 컬렉션", title: "상품 둘러보기", body: "활성 LESOUL 상품을 종류별로 둘러보세요. 이미지 생성 횟수를 모두 사용한 뒤에도 상품 조회는 계속 이용할 수 있습니다.", back: "홈", all: "전체", newArrivals: "신상품", allProducts: "전체 상품", empty: "이 종류에는 아직 등록된 상품이 없습니다.", loading: "상품을 불러오는 중…", loadingMore: "다음 상품을 불러오는 중…", measurements: "실측 사이즈 보기", categories: { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } },
    zh: { eyebrow: "LESOUL 系列", title: "浏览商品", body: "按品类浏览全部在售 LESOUL 商品。即使图像生成次数用完，仍可继续浏览商品。", back: "首页", all: "全部", newArrivals: "新品", allProducts: "全部商品", empty: "该分类暂未上架商品。", loading: "正在加载商品…", loadingMore: "正在加载更多商品…", measurements: "查看实测尺寸", categories: { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } },
  }[locale];
  const catalog = trpc.catalog.browseProducts.useQuery();
  const managedCategories = trpc.catalog.productCategories.useQuery(undefined, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const purchaseConfig = trpc.purchase.config.useQuery();
  const [category, setCategory] = useState("all");
  const [detailId, setDetailId] = useState<number | null>(null);
  const trackShareVisit = trpc.catalog.trackWeChatShareVisit.useMutation();
  const products = catalog.data ?? [];
  const categoryOptions = managedCategories.data ?? [];
  const detailInput = (productId: number) => ({ productId, visitorId: getVisitorId(), browseAll: true });
  const prefetchDetail = (productId: number) => void utils.catalog.productDetail.prefetch(detailInput(productId), { staleTime: 60_000 });
  const showNewArrivalRow = true;
  const { visible, newArrivals, regularProducts } = useMemo(() => {
    const filtered = category === "all" ? products : products.filter((product) => String(product.displayCategory?.id ?? product.category) === category);
    const arrivals = filtered.filter((product) => isNewArrival(product)).sort((left, right) => Number(new Date(right.newArrivalAt ?? right.createdAt ?? 0)) - Number(new Date(left.newArrivalAt ?? left.createdAt ?? 0)));
    return { visible: filtered, newArrivals: arrivals, regularProducts: showNewArrivalRow ? filtered.filter((product) => !isNewArrival(product)) : filtered };
  }, [category, products, showNewArrivalRow]);
  const newArrivalPages = useMemo(() => showNewArrivalRow ? chunkProducts(newArrivals, CUSTOMER_CATALOG_PAGE_SIZE) : [], [newArrivals, showNewArrivalRow]);
  const regularProductPages = useMemo(() => showNewArrivalRow ? chunkProducts(regularProducts, CUSTOMER_CATALOG_PAGE_SIZE) : [regularProducts], [regularProducts, showNewArrivalRow]);
  const [visibleArrivalPageCount, setVisibleArrivalPageCount] = useState(1);
  const [visibleRegularPageCount, setVisibleRegularPageCount] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMorePages = visibleArrivalPageCount < newArrivalPages.length || visibleRegularPageCount < regularProductPages.length;

  useEffect(() => {
    setVisibleArrivalPageCount(1);
    setVisibleRegularPageCount(1);
  }, [category, products.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMorePages) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisibleArrivalPageCount((count) => Math.min(count + 1, newArrivalPages.length));
      setVisibleRegularPageCount((count) => Math.min(count + 1, regularProductPages.length));
    }, { rootMargin: "480px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMorePages, newArrivalPages.length, regularProductPages.length]);

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

  const renderProductCard = (product: (typeof products)[number]) => {
    return <article key={product.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#ded8cf] bg-white shadow-[0_8px_20px_rgba(38,31,24,.05)]"><button onPointerEnter={() => prefetchDetail(product.id)} onFocus={() => prefetchDetail(product.id)} onPointerDown={() => prefetchDetail(product.id)} onClick={() => setDetailId(product.id)} className="flex min-h-0 flex-1 flex-col text-left transition active:scale-[.98]"><div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, language)} catalogDisplay={product.catalogDisplay} className="aspect-[3/4] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} pricingMode={purchaseConfig.data?.pricingMode} excludeNewArrivalsFromSale={purchaseConfig.data?.excludeNewArrivalsFromSale} />{isSetProduct(product) && <span className="absolute bottom-2 left-2 rounded-full bg-black/85 px-2 py-1 text-[9px] font-bold tracking-[.12em] text-white">{language.startsWith("ko") ? `세트 · ${product.setComponents?.length ?? 0}` : language.startsWith("zh") ? `套装 · ${product.setComponents?.length ?? 0}` : `SET · ${product.setComponents?.length ?? 0}`}</span>}</div><BlackColorVerificationNotice color={product.color} className="mx-3 mt-2" /><div className="flex flex-1 flex-col p-3 pb-2"><p className="h-3 truncate text-[9px] font-bold tracking-[.13em] text-[#8b7b6b]">{product.brand ?? "\u00a0"}</p><p className="mt-1 truncate text-xs font-semibold leading-4 text-[#29231d]">{localizedProductName(product, language)}</p><div className="mt-2 min-h-4"><ProductPrice product={product} className="text-xs font-bold" /></div><p className="mt-1 min-h-3 truncate text-[10px] text-[#756b61]">{localizedCategoryName(product.displayCategory, language)}{formatKeyMeasurement(product, language) ? ` · ${formatKeyMeasurement(product, language)}` : ""}</p><p className="mt-1 min-h-3 truncate text-[9px] font-bold tracking-[.07em] text-[#8a7968]">{copy.measurements} →</p></div></button></article>;
  };

  const initialDetailProduct = detailId ? products.find((product) => product.id === detailId) : undefined;
  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-7 pt-4 sm:px-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-md text-sm leading-5 text-[#71685f]">{copy.body}</p></div><button onClick={() => navigate("/")} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#ddd6cc] bg-white px-3 text-[10px] font-bold"><ChevronLeft size={14} />{copy.back}</button></header><nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={copy.title}><button onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{categoryOptions.map((item) => <button key={item.id} onClick={() => setCategory(String(item.id))} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${category === String(item.id) ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{localizedCategoryName(item, language)}</button>)}</nav>{catalog.isLoading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></div> : visible.length ? <div className="mt-5 space-y-7">{showNewArrivalRow && newArrivals.length > 0 && <section aria-labelledby="new-arrivals-heading"><div className="mb-3"><h2 id="new-arrivals-heading" className="text-sm font-bold tracking-[.14em] text-[#2b2723]">{copy.newArrivals}</h2></div><div className="space-y-4">{newArrivalPages.slice(0, visibleArrivalPageCount).map((page, index) => <div key={`new-arrivals-page-${index}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-catalog-page-size={CUSTOMER_CATALOG_PAGE_SIZE}>{page.map(renderProductCard)}</div>)}</div></section>}{regularProducts.length > 0 && <section aria-labelledby="all-products-heading">{showNewArrivalRow && newArrivals.length > 0 && <h2 id="all-products-heading" className="mb-3 text-sm font-bold tracking-[.14em] text-[#2b2723]">{copy.allProducts}</h2>}<div className="space-y-4">{regularProductPages.slice(0, visibleRegularPageCount).map((page, index) => <div key={`all-products-page-${index}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-catalog-page-size={CUSTOMER_CATALOG_PAGE_SIZE}>{page.map(renderProductCard)}</div>)}</div></section>}<div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-4" aria-live="polite">{hasMorePages && <><LoaderCircle size={16} className="animate-spin text-[#8b7d6f]" /><span className="ml-2 text-[10px] text-[#756b61]">{copy.loadingMore}</span></>}</div></div> : <div className="mt-10 rounded-2xl border border-dashed border-[#d9d1c7] bg-white p-8 text-center"><ShoppingBag className="mx-auto text-[#86796d]" size={26} /><p className="mt-3 text-sm text-[#71675e]">{copy.empty}</p></div>}{detailId && <ProductDetailScreen productId={detailId} initialProduct={initialDetailProduct} browseAll onClose={() => setDetailId(null)} />}</main></MobileScreen>;
}
