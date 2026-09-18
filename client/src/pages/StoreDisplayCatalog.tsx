import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";
import type { ProductImageAsset } from "@shared/bodyMeasurements";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";
import type { AvailabilityStatus } from "@shared/productAvailability";
import { isNewArrival } from "@shared/productAvailability";
import { shuffleWithinNewArrivalGroups } from "@shared/catalogOrder";
import { Search, LogOut, MonitorPlay, LoaderCircle, Volume2, VolumeX } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
const categories: Exclude<Category, "all">[] = ["top", "bottom", "outer", "dress", "shoes", "bag"];

type DisplayProduct = {
  id: number;
  brand?: string | null;
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  imageUrl: string;
  imageViews?: { front?: ProductImageAsset | null } | null;
  catalogDisplay?: CatalogDisplaySettings | null;
  availabilityStatus?: AvailabilityStatus | null;
  status?: string | null;
  isNew?: number | boolean | null;
  newArrivalAt?: string | Date | null;
  category?: string | null;
  price: number;
  normalDiscountPercent?: number | null;
  vipDiscountPercent?: number | null;
};

function DisplayProductRow({ items, heading, copy, language }: { items: DisplayProduct[]; heading: string; copy: { swipe: string; position: string; tapToReveal: string }; language: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateActiveIndex = () => {
    const row = rowRef.current;
    if (!row || !items.length) return;
    const cards = Array.from(row.children) as HTMLElement[];
    const center = row.getBoundingClientRect().left + row.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2;
      const nextDistance = Math.abs(cardCenter - center);
      if (nextDistance < distance) { distance = nextDistance; nearest = index; }
    });
    setActiveIndex((current) => current === nearest ? current : nearest);
  };

  const handleScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateActiveIndex();
    });
  };

  useEffect(() => {
    updateActiveIndex();
    const row = rowRef.current;
    const observer = typeof ResizeObserver === "undefined" || !row ? null : new ResizeObserver(updateActiveIndex);
    if (row && observer) observer.observe(row);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      observer?.disconnect();
    };
  }, [items.length]);

  if (!items.length) return null;
  const progress = Math.max(0, Math.min(100, ((activeIndex + 1) / items.length) * 100));
  return <section className="mx-auto max-w-7xl pt-6" aria-label={heading}>
    <div className="mb-3 flex items-end justify-between gap-3"><h2 className="text-sm font-bold tracking-[.12em] text-[#5e554c]">{heading} <span className="text-[10px] font-normal tracking-normal text-[#8a7d70]">· {items.length}</span></h2><span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#8a7d70]" aria-live="polite">{copy.position.replace("{current}", String(activeIndex + 1)).replace("{total}", String(items.length))}</span></div>
    <div ref={rowRef} className="lesoul-display-row gap-5" onScroll={handleScroll} onPointerUp={handleScroll}>
      {items.map((product, index) => <article key={product.id} data-active={index === activeIndex ? "true" : "false"} data-selected={selectedIndex === index ? "true" : "false"} aria-current={index === activeIndex ? "true" : undefined} aria-expanded={selectedIndex === index} role="button" tabIndex={0} className={`lesoul-display-card w-[78vw] max-w-[430px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[#e0d9d0] bg-white shadow-[0_10px_26px_rgba(38,31,24,.06)] transition-[transform,box-shadow,border-color] duration-200 motion-reduce:transition-none ${selectedIndex === index ? "scale-[1.025] border-[#b79a7e] shadow-[0_16px_34px_rgba(38,31,24,.14)]" : ""}`} onPointerDown={() => { setActiveIndex(index); setSelectedIndex((current) => current === index ? null : index); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveIndex(index); setSelectedIndex((current) => current === index ? null : index); } }}>
        <div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} pricingMode={undefined} excludeNewArrivalsFromSale={undefined} showAvailability={false} /></div>
        <div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h3 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, language)}</h3><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} revealPrice={selectedIndex === index} className="text-xl sm:text-2xl" /></div><p className="mt-3 text-[10px] font-bold tracking-[.12em] text-[#86796d]">{selectedIndex === index ? copy.tapToReveal : copy.swipe}</p></div>
      </article>)}
    </div>
    <div className="mt-3 flex items-center gap-3" aria-label={copy.position.replace("{current}", String(activeIndex + 1)).replace("{total}", String(items.length))}><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4ddd4]"><div className="h-full rounded-full bg-[#2b2520] transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div><span className="text-[10px] tabular-nums text-[#8a7d70]">{Math.round(progress)}%</span></div>
  </section>;
}

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 신상과 현물은 분리되어 표시되며 각 그룹 안에서 좌우로 넘겨 확인하세요.", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", all: "전체", categoryLabel: "상품 종류", brand: "브랜드 검색", brandPlaceholder: "브랜드명을 입력하세요", allBrands: "모든 브랜드", newArrivals: "신상", currentProducts: "현물 상품", swipe: "좌우로 넘겨 보기", tapToReveal: "선택됨 · 가격 표시", position: "{current}/{total}", showcase: "자동 전시 시작", exitShowcase: "일반 화면으로 돌아가기", fullscreen: "브라우저 전체 화면", musicUnavailable: "음악은 관리자에게 등록된 음원만 재생할 수 있습니다.", soundOn: "음악 켜기", soundOff: "음악 끄기" }
    : locale === "zh"
      ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，新品与现货分开显示，请在各组内左右滑动查看。", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", all: "全部", categoryLabel: "商品分类", brand: "品牌搜索", brandPlaceholder: "输入品牌名称", allBrands: "全部品牌", newArrivals: "新品", currentProducts: "现货商品", swipe: "左右滑动查看", tapToReveal: "已选择 · 显示价格", position: "{current}/{total}", showcase: "开始自动展示", exitShowcase: "返回普通页面", fullscreen: "浏览器全屏", musicUnavailable: "仅可播放管理员登记的音乐。", soundOn: "打开音乐", soundOff: "关闭音乐" }
      : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view. New arrivals and current products stay in separate groups; swipe within each group.", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", all: "All", categoryLabel: "Product categories", brand: "SEARCH BY BRAND", brandPlaceholder: "Enter a brand", allBrands: "ALL BRANDS", newArrivals: "NEW ARRIVALS", currentProducts: "CURRENT PRODUCTS", swipe: "SWIPE LEFT OR RIGHT", tapToReveal: "SELECTED · PRICE SHOWN", position: "{current}/{total}", showcase: "START SHOWROOM", exitShowcase: "RETURN TO CATALOG", fullscreen: "BROWSER FULLSCREEN", musicUnavailable: "Only administrator-provided audio can be played.", soundOn: "TURN SOUND ON", soundOff: "TURN SOUND OFF" };
  const categoryLabels = locale === "ko" ? { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } : locale === "zh" ? { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } : { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" };
  const catalog = trpc.catalog.storeDisplayProducts.useQuery();
  const presenceAudio = trpc.catalog.presenceAlertConfig.useQuery(undefined, { retry: false });
  const { logout } = useAuth();
  const [category, setCategory] = useState<Category>("all");
  const [brand, setBrand] = useState("");
  const orderedProducts = useMemo(() => shuffleWithinNewArrivalGroups(catalog.data ?? []) as DisplayProduct[], [catalog.data]);
  const brands = useMemo(() => Array.from(new Set(orderedProducts.map((product) => product.brand?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)), [orderedProducts]);
  const products = useMemo(() => orderedProducts.filter((product) => (category === "all" || product.category === category) && (!brand || product.brand === brand || product.brand?.toLowerCase().includes(brand.toLowerCase()))), [orderedProducts, category, brand]);
  const newArrivalProducts = useMemo(() => products.filter((product) => isNewArrival(product)), [products]);
  const currentProducts = useMemo(() => products.filter((product) => !isNewArrival(product)), [products]);
  const [showcaseMode, setShowcaseMode] = useState(false);
  const showcaseModeRef = useRef(false);
  const updateShowcaseMode = (value: boolean) => { showcaseModeRef.current = value; setShowcaseMode(value); };
  const [showcaseGroup, setShowcaseGroup] = useState<"new" | "current">("new");
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const idleRef = useRef<number | null>(null);
  const showcaseTimerRef = useRef<number | null>(null);
  const showcaseAudioRef = useRef<HTMLAudioElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundMessage, setSoundMessage] = useState("");
  const showcaseItems = showcaseGroup === "new" ? newArrivalProducts : currentProducts;
  const showcaseProduct = showcaseItems[showcaseIndex];
  const resetIdleTimer = () => {
    if (idleRef.current !== null) window.clearTimeout(idleRef.current);
    if (showcaseModeRef.current) {
      updateShowcaseMode(false);
      setShowcaseIndex(0);
      setShowcaseGroup("new");
    }
    idleRef.current = window.setTimeout(() => {
      const firstGroup = newArrivalProducts.length ? "new" : currentProducts.length ? "current" : null;
      if (firstGroup) { setShowcaseGroup(firstGroup); setShowcaseIndex(0); updateShowcaseMode(true); }
    }, 60_000);
  };
  const startShowcase = () => { resetIdleTimer(); setShowcaseGroup(newArrivalProducts.length ? "new" : "current"); setShowcaseIndex(0); updateShowcaseMode(true); };
  const exitShowcase = () => { showcaseAudioRef.current?.pause(); setSoundEnabled(false); updateShowcaseMode(false); setShowcaseIndex(0); setShowcaseGroup("new"); resetIdleTimer(); };
  const toggleSound = async () => {
    const audio = showcaseAudioRef.current;
    const source = presenceAudio.data?.soundUrl;
    if (!audio || !source) { setSoundMessage(copy.musicUnavailable); return; }
    if (soundEnabled) { audio.pause(); setSoundEnabled(false); return; }
    audio.src = source;
    audio.loop = true;
    try { await audio.play(); setSoundEnabled(true); setSoundMessage(""); }
    catch { setSoundMessage(copy.musicUnavailable); }
  };
  useEffect(() => {
    resetIdleTimer();
    const events: Array<keyof WindowEventMap> = ["pointerdown", "pointermove", "touchstart", "keydown", "wheel", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdleTimer, { passive: true }));
    return () => { if (idleRef.current !== null) window.clearTimeout(idleRef.current); events.forEach((eventName) => window.removeEventListener(eventName, resetIdleTimer)); };
  }, [newArrivalProducts.length, currentProducts.length]);
  useEffect(() => {
    if (!showcaseMode || !showcaseItems.length) return;
    if (showcaseTimerRef.current !== null) window.clearTimeout(showcaseTimerRef.current);
    showcaseTimerRef.current = window.setTimeout(() => {
      if (showcaseIndex + 1 < showcaseItems.length) setShowcaseIndex((index) => index + 1);
      else if (showcaseGroup === "new" && currentProducts.length) { setShowcaseGroup("current"); setShowcaseIndex(0); }
      else setShowcaseIndex(0);
    }, 8_000);
    return () => { if (showcaseTimerRef.current !== null) window.clearTimeout(showcaseTimerRef.current); };
  }, [showcaseMode, showcaseGroup, showcaseIndex, showcaseItems.length, currentProducts.length]);
  const requestBrowserFullscreen = async () => { try { await document.documentElement.requestFullscreen?.(); } catch { /* browser gesture or policy may reject this */ } };
  return <><main className="lesoul-display-page min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12"><header className="mx-auto max-w-7xl border-b border-[#ded8cf] pb-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p></div><div className="flex shrink-0 items-center gap-2"><LanguageSwitcher /><button type="button" onClick={startShowcase} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.showcase} title={copy.showcase}><MonitorPlay size={16} /></button><button type="button" onClick={() => void logout()} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d8d0c7] bg-white px-3"><Search size={16} className="text-[#83786c]" /><span className="sr-only">{copy.brand}</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder={copy.brandPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label={copy.brand} className="min-h-11 rounded-xl border border-[#d8d0c7] bg-white px-3 text-sm"><option value="">{copy.allBrands}</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></header><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-b border-[#ded8cf] py-4" aria-label={copy.categoryLabel}><button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{categoryLabels[item]}</button>)}</nav>{catalog.isLoading ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /></section> : products.length ? <><DisplayProductRow items={newArrivalProducts} heading={copy.newArrivals} copy={copy} language={i18n.language} /><DisplayProductRow items={currentProducts} heading={copy.currentProducts} copy={copy} language={i18n.language} /></> : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}</main>{showcaseMode && showcaseProduct && <div className="fixed inset-0 z-[80] grid min-h-svh place-items-center bg-[#f7f5f1] p-5 text-[#1d1a17]" role="dialog" aria-modal="true" aria-label={copy.showcase} onPointerDown={exitShowcase}><audio ref={showcaseAudioRef} preload="none" aria-hidden="true" /><div className="flex max-h-[calc(100svh-2.5rem)] w-full max-w-4xl flex-col overflow-auto rounded-[2rem] border border-[#e0d9d0] bg-white p-4 shadow-[0_24px_80px_rgba(38,31,24,.18)] sm:p-6" onPointerDown={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-bold tracking-[.18em] text-[#84776b]">{copy.showcase}</p><div className="flex gap-2"><button type="button" onClick={() => void toggleSound()} className="inline-flex items-center gap-1 rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold" aria-label={soundEnabled ? copy.soundOff : copy.soundOn}>{soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}{soundEnabled ? copy.soundOff : copy.soundOn}</button><button type="button" onClick={() => void requestBrowserFullscreen()} className="rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold">{copy.fullscreen}</button><button type="button" onClick={exitShowcase} className="rounded-full bg-[#2b2520] px-3 py-2 text-[10px] font-bold text-white">{copy.exitShowcase}</button></div></div>{soundMessage && <p role="status" className="mb-2 text-center text-[10px] text-[#8a7d70]">{soundMessage}</p>}<div className="min-h-0 flex flex-1 items-center justify-center overflow-hidden"><div className="h-[min(68svh,42rem)] w-full max-w-4xl min-w-0"><NormalizedProductImage src={customerProductImage(showcaseProduct.imageViews?.front, showcaseProduct.imageUrl)} alt={localizedProductName(showcaseProduct, i18n.language)} catalogDisplay={showcaseProduct.catalogDisplay} className="h-full w-full object-contain p-2 sm:p-4" /></div></div><div className="mt-4 flex items-end justify-between gap-4 border-t border-[#eee9e3] pt-4"><div><p className="text-xs font-bold tracking-[.14em] text-[#8b7d6f]">{showcaseProduct.brand || "LESOUL"}</p><h2 className="mt-1 text-xl font-semibold sm:text-3xl">{localizedProductName(showcaseProduct, i18n.language)}</h2></div><div className="text-right"><ProductPrice product={showcaseProduct} className="text-xl sm:text-3xl" /><p className="mt-1 text-[10px] tabular-nums text-[#8a7d70]">{copy.position.replace("{current}", String(showcaseIndex + 1)).replace("{total}", String(showcaseItems.length))}</p></div></div></div></div>}</>;
}
