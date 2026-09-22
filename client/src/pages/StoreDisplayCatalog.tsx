import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { localizedCategoryName } from "@shared/productCategories";
import { customerProductImage } from "@shared/productImages";
import type { ProductImageAsset } from "@shared/bodyMeasurements";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";
import type { AvailabilityStatus } from "@shared/productAvailability";
import { isNewArrival } from "@shared/productAvailability";
import { shuffleWithinNewArrivalGroups } from "@shared/catalogOrder";
import { Search, LogOut, MonitorPlay, LoaderCircle, Volume2, VolumeX, Camera, X, RotateCcw, Sparkles } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
  displayCategory?: { id: number; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; baseCategory?: "TOP" | "PANTS" | "JACKET" | "DRESS" | "SHOES" | "BAG" | null } | null;
  inventoryQuantity?: number | null;
  price: number;
  normalDiscountPercent?: number | null;
  vipDiscountPercent?: number | null;
};

function DisplayProductRow({ items, heading, copy, language, showInventoryQuantity }: { items: DisplayProduct[]; heading: string; copy: { swipe: string; position: string; tapToReveal: string; tapBeforeReveal: string; inventory: string }; language: string; showInventoryQuantity: boolean }) {
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
        <div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h3 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, language)}</h3><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} revealPrice={selectedIndex === index} className="text-xl sm:text-2xl" /></div>{showInventoryQuantity && selectedIndex === index && <p className="mt-2 text-xs font-semibold text-[#685a4d]" aria-live="polite">{copy.inventory}: {Math.max(0, product.inventoryQuantity ?? 0)}</p>}<p aria-live="polite" className={`mt-3 text-[10px] font-bold tracking-[.12em] text-[#86796d] transition-opacity duration-300 ${selectedIndex === index ? "opacity-80" : "motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]"}`}>{selectedIndex === index ? copy.tapToReveal : copy.tapBeforeReveal}</p></div>
      </article>)}
    </div>
    <div className="mt-3 flex items-center gap-3" aria-label={copy.position.replace("{current}", String(activeIndex + 1)).replace("{total}", String(items.length))}><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4ddd4]"><div className="h-full rounded-full bg-[#2b2520] transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div><span className="text-[10px] tabular-nums text-[#8a7d70]">{Math.round(progress)}%</span></div>
  </section>;
}

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 신상과 현물은 분리되어 표시되며 각 그룹 안에서 좌우로 넘겨 확인하세요.", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", all: "전체", categoryLabel: "상품 종류", brand: "브랜드 검색", brandPlaceholder: "브랜드명을 입력하세요", allBrands: "모든 브랜드", newArrivals: "신상", currentProducts: "현물 상품", swipe: "좌우로 넘겨 보기", tapBeforeReveal: "터치하여 가격 확인", tapToReveal: "선택됨 · 가격 표시", inventory: "현재 수량", position: "{current}/{total}", showcase: "자동 전시 시작", exitShowcase: "일반 화면으로 돌아가기", fullscreen: "브라우저 전체 화면", musicUnavailable: "음악은 관리자에게 등록된 음원만 재생할 수 있습니다.", soundOn: "음악 켜기", soundOff: "음악 끄기", camera: "손님 촬영·추천", cameraTitle: "오늘의 LESOUL 추천", cameraBody: "사진은 이 화면의 현재 세션에서만 사용하며 서버에 저장하지 않습니다.", capture: "사진 촬영", retake: "다시 촬영", closeCamera: "추천 닫기", recommendations: "관리자 추천 코디", noRecommendations: "등록된 추천 코디가 아직 없습니다.", cameraUnsupported: "이 브라우저에서는 카메라를 사용할 수 없습니다.", cameraPermission: "카메라 권한을 허용한 뒤 다시 시도해 주세요." }
    : locale === "zh"
      ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，新品与现货分开显示，请在各组内左右滑动查看。", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", all: "全部", categoryLabel: "商品分类", brand: "品牌搜索", brandPlaceholder: "输入品牌名称", allBrands: "全部品牌", newArrivals: "新品", currentProducts: "现货商品", swipe: "左右滑动查看", tapBeforeReveal: "点击查看价格", tapToReveal: "已选择 · 显示价格", inventory: "当前数量", position: "{current}/{total}", showcase: "开始自动展示", exitShowcase: "返回普通页面", fullscreen: "浏览器全屏", musicUnavailable: "仅可播放管理员登记的音乐。", soundOn: "打开音乐", soundOff: "关闭音乐", camera: "拍摄顾客·推荐", cameraTitle: "LESOUL 今日推荐", cameraBody: "照片仅在当前展示会话中使用，不会保存到服务器。", capture: "拍摄照片", retake: "重新拍摄", closeCamera: "关闭推荐", recommendations: "管理员推荐搭配", noRecommendations: "还没有已发布的推荐搭配。", cameraUnsupported: "此浏览器不支持摄像头。", cameraPermission: "请允许摄像头权限后重试。" }
      : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view. New arrivals and current products stay in separate groups; swipe within each group.", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", all: "All", categoryLabel: "Product categories", brand: "SEARCH BY BRAND", brandPlaceholder: "Enter a brand", allBrands: "ALL BRANDS", newArrivals: "NEW ARRIVALS", currentProducts: "CURRENT PRODUCTS", swipe: "SWIPE LEFT OR RIGHT", tapBeforeReveal: "TAP TO VIEW PRICE", tapToReveal: "SELECTED · PRICE SHOWN", inventory: "CURRENT QUANTITY", position: "{current}/{total}", showcase: "START SHOWROOM", exitShowcase: "RETURN TO CATALOG", fullscreen: "BROWSER FULLSCREEN", musicUnavailable: "Only administrator-provided audio can be played.", soundOn: "TURN SOUND ON", soundOff: "TURN SOUND OFF", camera: "CAPTURE GUEST · RECOMMEND", cameraTitle: "LESOUL RECOMMENDS", cameraBody: "The photo is used only in this display session and is not saved to the server.", capture: "CAPTURE PHOTO", retake: "RETAKE", closeCamera: "CLOSE RECOMMENDATIONS", recommendations: "ADMIN-CURATED LOOKS", noRecommendations: "No published curated looks yet.", cameraUnsupported: "This browser cannot access a camera.", cameraPermission: "Allow camera access, then try again." };
  const catalog = trpc.catalog.storeDisplayProducts.useQuery();
  const managedCategories = trpc.catalog.productCategories.useQuery(undefined, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const purchaseConfig = trpc.purchase.config.useQuery();
  const presenceAudio = trpc.catalog.presenceAlertConfig.useQuery(undefined, { retry: false });
  const { logout } = useAuth();
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("");
  const orderedProducts = useMemo(() => shuffleWithinNewArrivalGroups(catalog.data ?? []) as DisplayProduct[], [catalog.data]);
  const brands = useMemo(() => Array.from(new Set(orderedProducts.map((product) => product.brand?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)), [orderedProducts]);
  const products = useMemo(() => orderedProducts.filter((product) => (category === "all" || String(product.displayCategory?.id ?? product.category) === category) && (!brand || product.brand === brand || product.brand?.toLowerCase().includes(brand.toLowerCase()))), [orderedProducts, category, brand]);
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const curatedRecommendations = trpc.stylist.published.useQuery({ locale });
  const stopCamera = () => { cameraStreamRef.current?.getTracks().forEach((track) => track.stop()); cameraStreamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; };
  const closeCamera = () => { stopCamera(); setCameraOpen(false); setCameraError(""); };
  const openCamera = async () => {
    setCameraOpen(true); setCameraError(""); setCapturedPhoto(null);
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError(copy.cameraUnsupported); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    } catch { setCameraError(copy.cameraPermission); }
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas"); canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d"); if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height); setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.92)); stopCamera();
  };
  useEffect(() => () => stopCamera(), []);
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
  return <><main className="lesoul-display-page min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12"><header className="mx-auto max-w-7xl border-b border-[#ded8cf] pb-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p></div><div className="flex shrink-0 items-center gap-2"><LanguageSwitcher /><button type="button" onClick={() => void openCamera()} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-[#d8d0c7] bg-white px-3 text-[10px] font-bold" aria-label={copy.camera}><Camera size={15} />{copy.camera}</button><button type="button" onClick={startShowcase} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.showcase} title={copy.showcase}><MonitorPlay size={16} /></button><button type="button" onClick={() => void logout()} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d8d0c7] bg-white px-3"><Search size={16} className="text-[#83786c]" /><span className="sr-only">{copy.brand}</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder={copy.brandPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label={copy.brand} className="min-h-11 rounded-xl border border-[#d8d0c7] bg-white px-3 text-sm"><option value="">{copy.allBrands}</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></header><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-b border-[#ded8cf] py-4" aria-label={copy.categoryLabel}><button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{(managedCategories.data ?? []).map((item) => <button key={item.id} type="button" onClick={() => setCategory(String(item.id))} aria-pressed={category === String(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === String(item.id) ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{localizedCategoryName(item, i18n.language)}</button>)}</nav>{catalog.isLoading ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /></section> : products.length ? <><DisplayProductRow items={newArrivalProducts} heading={copy.newArrivals} copy={copy} language={i18n.language} showInventoryQuantity={Boolean(purchaseConfig.data?.showInventoryQuantity)} /><DisplayProductRow items={currentProducts} heading={copy.currentProducts} copy={copy} language={i18n.language} showInventoryQuantity={Boolean(purchaseConfig.data?.showInventoryQuantity)} /></> : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}</main>{cameraOpen && <div className="fixed inset-0 z-[90] grid min-h-svh place-items-center bg-[#1d1a17]/70 p-4 text-[#1d1a17]" role="dialog" aria-modal="true" aria-label={copy.cameraTitle}><div className="flex max-h-[calc(100svh-2rem)] w-full max-w-5xl flex-col overflow-auto rounded-[2rem] bg-[#f7f5f1] p-4 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#84776b]">STORE DISPLAY</p><h2 className="mt-1 text-2xl font-semibold">{copy.cameraTitle}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#746a60]">{copy.cameraBody}</p></div><button type="button" onClick={closeCamera} className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d8d0c7] bg-white" aria-label={copy.closeCamera}><X size={18} /></button></div><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]"><div className="rounded-2xl border border-[#e0d9d0] bg-black p-2"><div className="relative aspect-video overflow-hidden rounded-xl bg-[#2b2520]">{capturedPhoto ? <img src={capturedPhoto} alt={copy.cameraTitle} className="h-full w-full object-contain" /> : <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />}{cameraError && <div className="absolute inset-0 grid place-items-center p-6 text-center text-xs font-semibold text-white">{cameraError}</div>}</div><div className="mt-3 flex justify-center gap-2">{capturedPhoto ? <button type="button" onClick={() => void openCamera()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2b2520]"><RotateCcw size={14} />{copy.retake}</button> : <button type="button" onClick={capturePhoto} disabled={Boolean(cameraError)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-[#2b2520] disabled:opacity-40"><Camera size={14} />{copy.capture}</button>}</div></div><section><div className="mb-2 flex items-center gap-2"><Sparkles size={16} /><h3 className="text-sm font-bold tracking-[.08em]">{copy.recommendations}</h3></div>{curatedRecommendations.isLoading ? <div className="grid place-items-center rounded-2xl border border-[#e0d9d0] bg-white p-8"><LoaderCircle className="animate-spin" size={18} /></div> : curatedRecommendations.data?.length ? <div className="grid gap-3">{curatedRecommendations.data.map((outfit) => { const first = outfit.products[0]; return <article key={outfit.lookId} className="rounded-2xl border border-[#e0d9d0] bg-white p-3"><div className="flex gap-3">{first && <NormalizedProductImage src={customerProductImage(first.imageViews?.front, first.imageUrl)} alt={outfit.name} className="size-20 shrink-0 rounded-xl" />}<div className="min-w-0"><h4 className="font-semibold">{outfit.name}</h4>{outfit.reason && <p className="mt-1 text-[11px] leading-4 text-[#746a60]">{outfit.reason}</p>}<p className="mt-2 text-[10px] font-semibold text-[#8b7d6f]">{outfit.products.map((product) => localizedProductName(product as Parameters<typeof localizedProductName>[0], i18n.language)).join(" · ")}</p></div></div></article>; })}</div> : <p className="rounded-2xl border border-[#e0d9d0] bg-white p-5 text-xs text-[#746a60]">{copy.noRecommendations}</p>}</section></div></div></div>}{showcaseMode && showcaseProduct && <div className="fixed inset-0 z-[80] grid min-h-svh place-items-center bg-[#f7f5f1] p-5 text-[#1d1a17]" role="dialog" aria-modal="true" aria-label={copy.showcase} onPointerDown={exitShowcase}><audio ref={showcaseAudioRef} preload="none" aria-hidden="true" /><div className="flex max-h-[calc(100svh-2.5rem)] w-full max-w-4xl flex-col overflow-auto rounded-[2rem] border border-[#e0d9d0] bg-white p-4 shadow-[0_24px_80px_rgba(38,31,24,.18)] sm:p-6" onPointerDown={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-bold tracking-[.18em] text-[#84776b]">{copy.showcase}</p><div className="flex gap-2"><button type="button" onClick={() => void toggleSound()} className="inline-flex items-center gap-1 rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold" aria-label={soundEnabled ? copy.soundOff : copy.soundOn}>{soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}{soundEnabled ? copy.soundOff : copy.soundOn}</button><button type="button" onClick={() => void requestBrowserFullscreen()} className="rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold">{copy.fullscreen}</button><button type="button" onClick={exitShowcase} className="rounded-full bg-[#2b2520] px-3 py-2 text-[10px] font-bold text-white">{copy.exitShowcase}</button></div></div>{soundMessage && <p role="status" className="mb-2 text-center text-[10px] text-[#8a7d70]">{soundMessage}</p>}<div className="min-h-0 flex flex-1 items-center justify-center overflow-hidden"><div className="h-[min(68svh,42rem)] w-full max-w-4xl min-w-0"><NormalizedProductImage src={customerProductImage(showcaseProduct.imageViews?.front, showcaseProduct.imageUrl)} alt={localizedProductName(showcaseProduct, i18n.language)} catalogDisplay={showcaseProduct.catalogDisplay} className="h-full w-full object-contain p-2 sm:p-4" /></div></div><div className="mt-4 flex items-end justify-between gap-4 border-t border-[#eee9e3] pt-4"><div><p className="text-xs font-bold tracking-[.14em] text-[#8b7d6f]">{showcaseProduct.brand || "LESOUL"}</p><h2 className="mt-1 text-xl font-semibold sm:text-3xl">{localizedProductName(showcaseProduct, i18n.language)}</h2></div><div className="text-right"><ProductPrice product={showcaseProduct} className="text-xl sm:text-3xl" /><p className="mt-1 text-[10px] tabular-nums text-[#8a7d70]">{copy.position.replace("{current}", String(showcaseIndex + 1)).replace("{total}", String(showcaseItems.length))}</p></div></div></div></div>}</>;
}
