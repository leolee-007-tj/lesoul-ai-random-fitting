import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import { isNewArrival } from "@shared/productAvailability";
import { Camera, LoaderCircle, LogOut, MonitorPlay } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"];

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 상품 정보만 크게 보여 줍니다.", camera: "카메라 켜기", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", all: "전체", newArrivals: "신상품", allProducts: "전체 상품", categoryLabel: "상품 종류" }
    : locale === "zh"
      ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，仅以大尺寸展示商品信息。", camera: "开启摄像头", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", all: "全部", newArrivals: "新品", allProducts: "全部商品", categoryLabel: "商品分类" }
      : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view with large product information.", camera: "TURN ON CAMERA", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", all: "All", newArrivals: "NEW ARRIVALS", allProducts: "ALL PRODUCTS", categoryLabel: "Product categories" };
  const categoryLabels = locale === "ko"
    ? { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" }
    : locale === "zh"
      ? { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" }
      : { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" };
  const catalog = trpc.catalog.storeDisplayProducts.useQuery();
  const alert = trpc.catalog.presenceAlertConfig.useQuery();
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const [category, setCategory] = useState<Category>("all");
  const activeProducts = catalog.data ?? [];
  const { filteredProducts, newArrivals, regularProducts } = useMemo(() => {
    const filtered = category === "all" ? activeProducts : activeProducts.filter((product) => product.category === category);
    const arrivals = filtered
      .filter((product) => isNewArrival(product))
      .sort((left, right) => Number(new Date(right.newArrivalAt ?? right.createdAt ?? 0)) - Number(new Date(left.newArrivalAt ?? left.createdAt ?? 0)));
    return { filteredProducts: filtered, newArrivals: arrivals, regularProducts: filtered.filter((product) => !isNewArrival(product)) };
  }, [activeProducts, category]);

  const renderProductCard = (product: (typeof activeProducts)[number]) => <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[#e0d9d0] bg-white shadow-[0_10px_26px_rgba(38,31,24,.06)]"><div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} pricingMode={undefined} excludeNewArrivalsFromSale={undefined} showAvailability={false} /></div><div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h2 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, i18n.language)}</h2><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} className="text-xl sm:text-2xl" /></div></div></article>;

  return (
    <main className="min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-7xl items-start justify-between gap-4 border-b border-[#ded8cf] pb-5">
        <div>
          <p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1>
          <p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => navigate("/camera-greeting")} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[11px] font-bold transition active:scale-[.98] ${alert.data?.enabled ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-[#d8d0c7] bg-white text-[#403830]"}`}><Camera size={15} />{copy.camera}</button>
          <button type="button" onClick={() => void logout()} className="grid size-10 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button>
        </div>
      </header>
      <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-b border-[#ded8cf] py-4" aria-label={copy.categoryLabel}>
        <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-[.98] ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>
        {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-[.98] ${category === item ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{categoryLabels[item]}</button>)}
      </nav>
      {catalog.isLoading
        ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></section>
        : filteredProducts.length
          ? <div className="mx-auto max-w-7xl space-y-8 pt-6">
              {newArrivals.length > 0 && <section aria-labelledby="display-new-arrivals-heading"><h2 id="display-new-arrivals-heading" className="mb-4 text-sm font-bold tracking-[.14em] text-[#2b2723]">{copy.newArrivals}</h2><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{newArrivals.map(renderProductCard)}</div></section>}
              {regularProducts.length > 0 && <section aria-labelledby="display-all-products-heading">{newArrivals.length > 0 && <h2 id="display-all-products-heading" className="mb-4 text-sm font-bold tracking-[.14em] text-[#2b2723]">{copy.allProducts}</h2>}<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{regularProducts.map(renderProductCard)}</div></section>}
            </div>
          : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}
    </main>
  );
}
