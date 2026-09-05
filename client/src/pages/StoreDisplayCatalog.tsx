import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import { isNewArrival } from "@shared/productAvailability";
import { shuffleWithinNewArrivalGroups } from "@shared/catalogOrder";
import { Search, LogOut, MonitorPlay, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) { const swap = Math.floor(Math.random() * (index + 1)); [copy[index], copy[swap]] = [copy[swap], copy[index]]; }
  return copy;
}

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 신상과 현물은 분리되어 표시되며 각 그룹 안에서 좌우로 넘겨 확인하세요.", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", all: "전체", categoryLabel: "상품 종류", brand: "브랜드 검색", brandPlaceholder: "브랜드명을 입력하세요", allBrands: "모든 브랜드", newArrivals: "신상", currentProducts: "현물 상품", swipe: "좌우로 넘겨 보기" }
    : locale === "zh"
      ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，新品与现货分开显示，请在各组内左右滑动查看。", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", all: "全部", categoryLabel: "商品分类", brand: "品牌搜索", brandPlaceholder: "输入品牌名称", allBrands: "全部品牌", newArrivals: "新品", currentProducts: "现货商品", swipe: "左右滑动查看" }
      : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view. New arrivals and current products stay in separate groups; swipe within each group.", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", all: "All", categoryLabel: "Product categories", brand: "SEARCH BY BRAND", brandPlaceholder: "Enter a brand", allBrands: "ALL BRANDS", newArrivals: "NEW ARRIVALS", currentProducts: "CURRENT PRODUCTS", swipe: "SWIPE LEFT OR RIGHT" };
  const categoryLabels = locale === "ko" ? { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } : locale === "zh" ? { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } : { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" };
  const catalog = trpc.catalog.storeDisplayProducts.useQuery();
  const { logout } = useAuth();
  const [category, setCategory] = useState<Category>("all");
  const [brand, setBrand] = useState("");
  const orderedProducts = useMemo(() => shuffleWithinNewArrivalGroups(catalog.data ?? []), [catalog.data]);
  const brands = useMemo(() => Array.from(new Set(orderedProducts.map((product) => product.brand?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)), [orderedProducts]);
  const products = useMemo(() => orderedProducts.filter((product) => (category === "all" || product.category === category) && (!brand || product.brand === brand || product.brand?.toLowerCase().includes(brand.toLowerCase()))), [orderedProducts, category, brand]);
  const newArrivalProducts = useMemo(() => products.filter((product) => isNewArrival(product)), [products]);
  const currentProducts = useMemo(() => products.filter((product) => !isNewArrival(product)), [products]);
  const renderProductCard = (product: (typeof products)[number]) => <article key={product.id} className="w-[78vw] max-w-[430px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[#e0d9d0] bg-white shadow-[0_10px_26px_rgba(38,31,24,.06)]"><div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} pricingMode={undefined} excludeNewArrivalsFromSale={undefined} showAvailability={false} /></div><div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h2 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, i18n.language)}</h2><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} className="text-xl sm:text-2xl" /></div><p className="mt-3 text-[10px] font-bold tracking-[.12em] text-[#86796d]">{copy.swipe}</p></div></article>;
  const renderProductRow = (items: (typeof products)[number][], heading: string) => items.length ? <section className="mx-auto max-w-7xl pt-6"><h2 className="mb-3 text-sm font-bold tracking-[.12em] text-[#5e554c]">{heading} <span className="text-[10px] font-normal tracking-normal text-[#8a7d70]">· {items.length}</span></h2><div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5">{items.map(renderProductCard)}</div></section> : null;
  return <main className="min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12"><header className="mx-auto max-w-7xl border-b border-[#ded8cf] pb-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p></div><button type="button" onClick={() => void logout()} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button></div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d8d0c7] bg-white px-3"><Search size={16} className="text-[#83786c]" /><span className="sr-only">{copy.brand}</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder={copy.brandPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label={copy.brand} className="min-h-11 rounded-xl border border-[#d8d0c7] bg-white px-3 text-sm"><option value="">{copy.allBrands}</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></header><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-b border-[#ded8cf] py-4" aria-label={copy.categoryLabel}><button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{categoryLabels[item]}</button>)}</nav>{catalog.isLoading ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /></section> : products.length ? <>{renderProductRow(newArrivalProducts, copy.newArrivals)}{renderProductRow(currentProducts, copy.currentProducts)}</> : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}</main>;
}
