import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import { Camera, LoaderCircle, LogOut, MonitorPlay } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko" ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 상품 정보만 크게 보여 줍니다.", camera: "방문 알림", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", currency: "¥" } : locale === "zh" ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，仅以大尺寸展示商品信息。", camera: "到店提醒", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", currency: "¥" } : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view with large product information.", camera: "Visitor alert", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", currency: "¥" };
  const catalog = trpc.catalog.storeDisplayProducts.useQuery();
  const alert = trpc.catalog.presenceAlertConfig.useQuery();
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const activeProducts = catalog.data ?? [];

  return <main className="min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12"><header className="mx-auto flex max-w-7xl items-start justify-between gap-4 border-b border-[#ded8cf] pb-5"><div><p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p></div><div className="flex shrink-0 items-center gap-2">{alert.data?.enabled && <button type="button" onClick={() => navigate("/camera-greeting")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8d0c7] bg-white px-3 text-[11px] font-bold"><Camera size={15} />{copy.camera}</button>}<button type="button" onClick={() => void logout()} className="grid size-10 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button></div></header>{catalog.isLoading ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></section> : activeProducts.length ? <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">{activeProducts.map((product) => <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-[#e0d9d0] bg-white shadow-[0_10px_26px_rgba(38,31,24,.06)]"><div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} pricingMode={undefined} excludeNewArrivalsFromSale={undefined} showAvailability={false} /></div><div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h2 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, i18n.language)}</h2><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} className="text-xl sm:text-2xl" /></div></div></article>)}</section> : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}</main>;
}
