import NormalizedProductImage from "@/components/NormalizedProductImage";
import ProductPrice from "@/components/ProductPrice";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import HorizontalRowArrows from "@/components/HorizontalRowArrows";
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
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { useTranslation } from "react-i18next";

type ShowcaseSlide = { product: DisplayProduct; imageUrl: string; isAi: boolean; sceneDescription?: string; compositionLabel?: string | null; compositionProductIds?: number[] | null; lookbookTitle?: string | null; recommendationName?: string | null };
type ShowcaseViewMode = "mixed" | "product" | "model";
const displaySceneCopy = { ko: { studio_front: "스튜디오 정면 전신", studio_side: "스튜디오 측면 패션 샷", studio_full: "스튜디오 전신 에디토리얼", store_work: "매장에서 옷을 정리하는 장면", store_customer: "매장에서 손님을 응대하는 장면", store_walk: "매장 안을 걷는 장면" }, zh: { studio_front: "工作室正面全身", studio_side: "工作室侧面时装照", studio_full: "工作室全身大片", store_work: "在店内整理衣架", store_customer: "在店内接待顾客", store_walk: "在店内走动" }, en: { studio_front: "Studio front full-body", studio_side: "Studio side fashion shot", studio_full: "Studio full-body editorial", store_work: "Organizing clothes in store", store_customer: "Helping a customer in store", store_walk: "Walking through the store" } } as const;
function localizedLookbookComposition(image: { compositionLabel?: string | null; compositionProductIds?: number[] | null }, products: DisplayProduct[], language: string) {
  if (Array.isArray(image.compositionProductIds) && image.compositionProductIds.length) return image.compositionProductIds.map((id) => localizedProductName(products.find((product) => product.id === id) ?? { name: "#" + id } as any, language)).join(" + ");
  return image.compositionLabel ?? (language.startsWith("ko") ? "등록 상품" : language.startsWith("zh") ? "已登记商品" : "Registered product");
}
type ApprovedLookbookImage = { id: number; productId: number; imageUrl: string; sceneDescription: string; sceneType?: string | null; compositionLabel?: string | null; compositionProductIds?: number[] | null; lookbookTitle?: string | null; recommendationName?: string | null };
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

function DisplayAiLookbookRow({ images, heading, compositionLabel, position, language, products }: { images: ApprovedLookbookImage[]; heading: string; compositionLabel: string; position: string; language: string; products: DisplayProduct[] }) {
  if (!images.length) return null;
  const rowRef = useRef<HTMLDivElement>(null);
  const previousLabel = language.startsWith("ko") ? "이전 룩북" : language.startsWith("zh") ? "上一个 Lookbook" : "Previous lookbook";
  const nextLabel = language.startsWith("ko") ? "다음 룩북" : language.startsWith("zh") ? "下一个 Lookbook" : "Next lookbook";
  return <section className="mx-auto max-w-7xl pt-6" aria-label={heading}>
    <div className="mb-3 flex items-end justify-between gap-3"><h2 className="text-sm font-bold tracking-[.12em] text-[#5e554c]">{heading} <span className="text-[10px] font-normal tracking-normal text-[#8a7d70]">· {images.length}</span></h2><span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#8a7d70]">{position}</span></div>
    <div className="relative">
      <HorizontalRowArrows rowRef={rowRef} previousLabel={previousLabel} nextLabel={nextLabel} />
      <div ref={rowRef} className="lesoul-display-row gap-4" aria-label={heading}>
      {images.map((image, index) => <article key={image.id} className="w-[72vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-[#d8c6b4] bg-[#fffaf4] shadow-[0_10px_26px_rgba(38,31,24,.07)]">
        <div className="aspect-[4/5] bg-[#eee9e1]"><img src={image.imageUrl} alt={image.compositionLabel || heading} className="h-full w-full object-contain" loading="lazy" /></div>
        <div className="border-t border-[#eadfd2] px-3 py-2.5"><p className="text-[9px] font-bold tracking-[.12em] text-[#8b7d6f]">AI LOOKBOOK · {index + 1}</p>{image.compositionLabel && <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 text-[#433a32]">{compositionLabel}: {localizedLookbookComposition(image, products, language)}</p>}{(image.lookbookTitle || image.recommendationName) && <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-[#765f51]">{image.lookbookTitle || ""}{image.lookbookTitle && image.recommendationName ? " · " : ""}{image.recommendationName || ""}</p>}<p className="mt-1 line-clamp-1 text-[10px] text-[#8a7d70]">{displaySceneCopy[language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en"][image.sceneType as keyof typeof displaySceneCopy.en] || (language.startsWith("ko") ? "매장 장면" : language.startsWith("zh") ? "门店场景" : "Store scene")}</p></div>
      </article>)}
      </div>
    </div>
  </section>;
}

function DisplayProductRow({ items, heading, copy, language, showInventoryQuantity }: { items: DisplayProduct[]; heading: string; copy: { swipe: string; position: string; tapToReveal: string; tapBeforeReveal: string; inventory: string }; language: string; showInventoryQuantity: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, dragged: false, axis: null as "x" | "y" | null, startX: 0, startY: 0, lastX: 0, velocity: 0 });
  const inertiaRef = useRef<number | null>(null);

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

  const stopInertia = () => { if (inertiaRef.current !== null) { window.cancelAnimationFrame(inertiaRef.current); inertiaRef.current = null; } };
  const runInertia = () => {
    const row = rowRef.current;
    if (!row || Math.abs(dragRef.current.velocity) < 0.5) { inertiaRef.current = null; return; }
    row.scrollLeft += dragRef.current.velocity;
    dragRef.current.velocity *= 0.92;
    inertiaRef.current = window.requestAnimationFrame(runInertia);
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stopInertia();
    dragRef.current = { active: true, dragged: false, axis: null, startX: event.clientX, startY: event.clientY, lastX: event.clientX, velocity: 0 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const row = rowRef.current;
    if (!drag.active || !row) return;
    const delta = event.clientX - drag.lastX;
    const totalX = event.clientX - drag.startX;
    const totalY = event.clientY - drag.startY;
    if (!drag.axis && Math.hypot(totalX, totalY) > 7) drag.axis = Math.abs(totalX) > Math.abs(totalY) * 1.12 ? "x" : "y";
    if (drag.axis === "y") {
      drag.active = false;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      return;
    }
    if (drag.axis === "x" && Math.abs(delta) > 0.5) {
      drag.dragged = true;
      const movement = -delta * 1.8;
      row.scrollLeft += movement;
      drag.velocity = drag.velocity * 0.55 + movement * 0.45;
      drag.velocity = Math.max(-42, Math.min(42, drag.velocity));
      drag.lastX = event.clientX;
      event.preventDefault();
    }
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    drag.active = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (drag.dragged && drag.axis === "x") inertiaRef.current = window.requestAnimationFrame(runInertia);
  };
  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!amount) return;
    event.preventDefault();
    event.stopPropagation();
    row.scrollLeft += amount * 1.8;
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
  const previousLabel = language.startsWith("ko") ? `이전 ${heading}` : language.startsWith("zh") ? `上一个${heading}` : `Previous ${heading}`;
  const nextLabel = language.startsWith("ko") ? `다음 ${heading}` : language.startsWith("zh") ? `下一个${heading}` : `Next ${heading}`;
  return <section className="mx-auto max-w-7xl pt-6" aria-label={heading}>
    <div className="mb-3 flex items-end justify-between gap-3"><h2 className="text-sm font-bold tracking-[.12em] text-[#5e554c]">{heading} <span className="text-[10px] font-normal tracking-normal text-[#8a7d70]">· {items.length}</span></h2><span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#8a7d70]" aria-live="polite">{copy.position.replace("{current}", String(activeIndex + 1)).replace("{total}", String(items.length))}</span></div>
    <div className="relative">
      <HorizontalRowArrows rowRef={rowRef} previousLabel={previousLabel} nextLabel={nextLabel} />
      <div ref={rowRef} className="lesoul-display-row gap-4" onScroll={handleScroll} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
      {items.map((product, index) => <article key={product.id} data-active={index === activeIndex ? "true" : "false"} data-selected={selectedIndex === index ? "true" : "false"} aria-current={index === activeIndex ? "true" : undefined} aria-expanded={selectedIndex === index} role="button" tabIndex={0} className={`lesoul-display-card w-[78vw] max-w-[430px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[#e0d9d0] bg-white shadow-[0_10px_26px_rgba(38,31,24,.06)] transition-[transform,box-shadow,border-color] duration-200 motion-reduce:transition-none ${selectedIndex === index ? "scale-[1.025] border-[#b79a7e] shadow-[0_16px_34px_rgba(38,31,24,.14)]" : ""}`} onClick={() => { if (dragRef.current.dragged) { dragRef.current.dragged = false; return; } setActiveIndex(index); setSelectedIndex((current) => current === index ? null : index); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveIndex(index); setSelectedIndex((current) => current === index ? null : index); } }}>
        <div className="relative"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} pricingMode={undefined} excludeNewArrivalsFromSale={undefined} showAvailability={false} /></div>
        <div className="p-4 sm:p-5"><p className="text-[10px] font-bold tracking-[.14em] text-[#8b7d6f]">{product.brand || "LESOUL"}</p><h3 className="mt-1 text-lg font-semibold leading-6 sm:text-xl">{localizedProductName(product, language)}</h3><div className="mt-3 text-xl tabular-nums sm:text-2xl"><ProductPrice product={product} revealPrice={selectedIndex === index} className="text-xl sm:text-2xl" /></div>{showInventoryQuantity && selectedIndex === index && <p className="mt-2 text-xs font-semibold text-[#685a4d]" aria-live="polite">{copy.inventory}: {Math.max(0, product.inventoryQuantity ?? 0)}</p>}<p aria-live="polite" className={`mt-3 text-[10px] font-bold tracking-[.12em] text-[#86796d] transition-opacity duration-300 ${selectedIndex === index ? "opacity-80" : "motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]"}`}>{selectedIndex === index ? copy.tapToReveal : copy.tapBeforeReveal}</p></div>
      </article>)}
      </div>
    </div>
    <div className="mt-3 flex items-center gap-3" aria-label={copy.position.replace("{current}", String(activeIndex + 1)).replace("{total}", String(items.length))}><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4ddd4]"><div className="h-full rounded-full bg-[#2b2520] transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div><span className="text-[10px] tabular-nums text-[#8a7d70]">{Math.round(progress)}%</span></div>
  </section>;
}

export default function StoreDisplayCatalog() {
  const { i18n } = useTranslation();
  const locale: "ko" | "zh" | "en" = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { eyebrow: "STORE DISPLAY", title: "상품 둘러보기", body: "매장 디스플레이 전용 화면입니다. 신상과 현물은 분리되어 표시되며 각 그룹 안에서 좌우로 넘겨 확인하세요.", logout: "디스플레이 로그아웃", loading: "상품을 불러오는 중입니다.", empty: "표시할 상품이 없습니다.", all: "전체", categoryLabel: "상품 종류", brand: "브랜드 검색", brandPlaceholder: "브랜드명을 입력하세요", allBrands: "모든 브랜드", newArrivals: "신상", aiLookbook: "AI 코디 모델 사진", aiComposition: "코디 상품", currentProducts: "현물 상품", swipe: "좌우로 넘겨 보기", tapBeforeReveal: "터치하여 가격 확인", tapToReveal: "선택됨 · 가격 표시", inventory: "현재 수량", position: "{current}/{total}", showcase: "자동 전시 시작", showcaseModeLabel: "전시 모드", mixedMode: "상품 + 모델", productMode: "상품만", modelMode: "모델만", exitShowcase: "일반 화면으로 돌아가기", fullscreen: "브라우저 전체 화면", musicUnavailable: "음악은 관리자에게 등록된 음원만 재생할 수 있습니다.", soundOn: "음악 켜기", soundOff: "음악 끄기", camera: "손님 촬영·추천", switchCamera: "전·후면 카메라 전환", rearCamera: "후면 카메라", frontCamera: "전면 카메라", cameraTitle: "오늘의 LESOUL 추천", profileTitle: "고객 맞춤 입력 (선택)", height: "키 (cm)", weight: "몸무게 (kg)", shoulder: "어깨너비 (cm)", chest: "가슴둘레 (cm)", waist: "허리둘레 (cm)", hip: "엉덩이둘레 (cm)", usualSize: "평소 사이즈", bodyType: "체형", bodySlim: "아담·슬림", bodyBalanced: "균형형", bodyCurvy: "곡선형", bodyPlus: "볼륨형", intent: "원하는 느낌·장소·목적", detailRequirements: "세부 요구사항·참고사항", detailPlaceholder: "예: 팔뚝은 가리고 싶어요, 검정은 피하고 싶어요, 오래 걸어도 편한 소재", intentPlaceholder: "예: 출근할 때 단정하고 편한 옷, 저녁 데이트라 우아하고 따뜻하게, 외투도 필요해요", runRecommendation: "맞춤 추천 보기", interpreting: "요청을 해석해 상품을 찾는 중…", matched: "맞춤 추천 결과", sizeHint: "추천 사이즈", cameraBody: "사진은 저장하지 않습니다. 맞춤 추천을 요청할 때만 임시로 피부톤 색상 힌트를 분석하고 즉시 폐기합니다.", capture: "사진 촬영", retake: "다시 촬영", closeCamera: "추천 닫기", recommendations: "관리자 추천 코디", noRecommendations: "등록된 추천 코디가 아직 없습니다.", cameraUnsupported: "이 브라우저에서는 카메라를 사용할 수 없습니다.", cameraPermission: "카메라 권한을 허용한 뒤 다시 시도해 주세요." }
    : locale === "zh"
      ? { eyebrow: "STORE DISPLAY", title: "浏览商品", body: "店铺展示专用页面，新品与现货分开显示，请在各组内左右滑动查看。", logout: "退出展示模式", loading: "正在加载商品…", empty: "暂无可展示的商品。", all: "全部", categoryLabel: "商品分类", brand: "品牌搜索", brandPlaceholder: "输入品牌名称", allBrands: "全部品牌", newArrivals: "新品", aiLookbook: "AI 搭配模特图", aiComposition: "搭配商品", currentProducts: "现货商品", swipe: "左右滑动查看", tapBeforeReveal: "点击查看价格", tapToReveal: "已选择 · 显示价格", inventory: "当前数量", position: "{current}/{total}", showcase: "开始自动展示", showcaseModeLabel: "展示模式", mixedMode: "商品 + 模特", productMode: "仅商品", modelMode: "仅模特", exitShowcase: "返回普通页面", fullscreen: "浏览器全屏", musicUnavailable: "仅可播放管理员登记的音乐。", soundOn: "打开音乐", soundOff: "关闭音乐", camera: "拍摄顾客·推荐", switchCamera: "切换前后摄像头", rearCamera: "后置摄像头", frontCamera: "前置摄像头", cameraTitle: "LESOUL 今日推荐", profileTitle: "顾客信息（可选）", height: "身高（cm）", weight: "体重（kg）", shoulder: "肩宽（cm）", chest: "胸围（cm）", waist: "腰围（cm）", hip: "臀围（cm）", usualSize: "平时尺码", bodyType: "体型", bodySlim: "纤细型", bodyBalanced: "均衡型", bodyCurvy: "曲线型", bodyPlus: "丰满型", intent: "想要的感觉·场合·目的", detailRequirements: "详细要求·参考", detailPlaceholder: "例如：想遮住手臂，避免黑色，适合长时间穿着", intentPlaceholder: "例如：上班要端庄舒适，约会要优雅保暖，还需要外套", runRecommendation: "查看专属推荐", interpreting: "正在理解需求并寻找商品…", matched: "专属推荐结果", sizeHint: "推荐尺码", cameraBody: "照片不会保存。请求专属推荐时，仅临时分析肤色调色提示，随后立即丢弃。", capture: "拍摄照片", retake: "重新拍摄", closeCamera: "关闭推荐", recommendations: "管理员推荐搭配", noRecommendations: "还没有已发布的推荐搭配。", cameraUnsupported: "此浏览器不支持摄像头。", cameraPermission: "请允许摄像头权限后重试。" }
      : { eyebrow: "STORE DISPLAY", title: "Browse products", body: "A store-display-only view. New arrivals and current products stay in separate groups; swipe within each group.", logout: "Exit display", loading: "Loading products…", empty: "There are no products to display.", all: "All", categoryLabel: "Product categories", brand: "SEARCH BY BRAND", brandPlaceholder: "Enter a brand", allBrands: "ALL BRANDS", newArrivals: "NEW ARRIVALS", aiLookbook: "AI OUTFIT MODEL PHOTOS", aiComposition: "OUTFIT PIECES", currentProducts: "CURRENT PRODUCTS", swipe: "SWIPE LEFT OR RIGHT", tapBeforeReveal: "TAP TO VIEW PRICE", tapToReveal: "SELECTED · PRICE SHOWN", inventory: "CURRENT QUANTITY", position: "{current}/{total}", showcase: "START SHOWROOM", showcaseModeLabel: "SHOWROOM MODE", mixedMode: "PRODUCT + MODEL", productMode: "PRODUCTS ONLY", modelMode: "MODEL PHOTOS ONLY", exitShowcase: "RETURN TO CATALOG", fullscreen: "BROWSER FULLSCREEN", musicUnavailable: "Only administrator-provided audio can be played.", soundOn: "TURN SOUND ON", soundOff: "TURN SOUND OFF", camera: "CAPTURE GUEST · RECOMMEND", switchCamera: "SWITCH CAMERA", rearCamera: "REAR CAMERA", frontCamera: "FRONT CAMERA", cameraTitle: "LESOUL RECOMMENDS", profileTitle: "CUSTOMER DETAILS (OPTIONAL)", height: "HEIGHT (CM)", weight: "WEIGHT (KG)", shoulder: "SHOULDER (CM)", chest: "BUST (CM)", waist: "WAIST (CM)", hip: "HIP (CM)", usualSize: "USUAL SIZE", bodyType: "BODY SHAPE", bodySlim: "SLIM", bodyBalanced: "BALANCED", bodyCurvy: "CURVY", bodyPlus: "PLUS", intent: "PREFERRED FEELING · OCCASION · PURPOSE", detailRequirements: "DETAILS · SPECIAL REQUESTS", detailPlaceholder: "Example: cover my upper arms, avoid black, comfortable for long wear", intentPlaceholder: "Example: polished and comfortable for work, elegant and warm for a date, I also need an outer layer", runRecommendation: "SHOW PERSONALIZED PICKS", interpreting: "Understanding the request and finding pieces…", matched: "PERSONALIZED PICKS", sizeHint: "RECOMMENDED SIZE", cameraBody: "The photo is not stored. When personalized picks are requested, it is temporarily analyzed only for a coarse color hint and then discarded.", capture: "CAPTURE PHOTO", retake: "RETAKE", closeCamera: "CLOSE RECOMMENDATIONS", recommendations: "ADMIN-CURATED LOOKS", noRecommendations: "No published curated looks yet.", cameraUnsupported: "This browser cannot access a camera.", cameraPermission: "Allow camera access, then try again." };
  // Store iPads usually stay open for hours, so do not wait for a manual reload
  // after an admin changes inventory, sale policy, or product visibility.
  const liveDisplayQueryOptions = { refetchInterval: 10_000, refetchIntervalInBackground: true, refetchOnWindowFocus: true, refetchOnReconnect: true } as const;
  const catalog = trpc.catalog.storeDisplayProducts.useQuery(undefined, liveDisplayQueryOptions);
  const managedCategories = trpc.catalog.productCategories.useQuery(undefined, { refetchInterval: 5000, refetchIntervalInBackground: true, refetchOnWindowFocus: true, refetchOnReconnect: true });
  const purchaseConfig = trpc.purchase.config.useQuery(undefined, liveDisplayQueryOptions);
  const presenceAudio = trpc.catalog.presenceAlertConfig.useQuery(undefined, { retry: false });
  const approvedLookbook = trpc.displayLookbook.approvedAll.useQuery(undefined, { retry: 1, refetchInterval: 15_000, refetchIntervalInBackground: true, refetchOnWindowFocus: true, refetchOnReconnect: true });
  const { logout } = useAuth();
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("");
  const orderedProducts = useMemo(() => shuffleWithinNewArrivalGroups(catalog.data ?? []) as DisplayProduct[], [catalog.data]);
  const brands = useMemo(() => Array.from(new Set(orderedProducts.map((product) => product.brand?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)), [orderedProducts]);
  const products = useMemo(() => orderedProducts.filter((product) => (category === "all" || String(product.displayCategory?.id ?? product.category) === category) && (!brand || product.brand === brand || product.brand?.toLowerCase().includes(brand.toLowerCase()))), [orderedProducts, category, brand]);
  const newArrivalProducts = useMemo(() => products.filter((product) => isNewArrival(product)), [products]);
  const currentProducts = useMemo(() => products.filter((product) => !isNewArrival(product)), [products]);
  const lookbookByProduct = useMemo(() => {
    const grouped = new Map<number, Array<{ imageUrl: string; sceneDescription: string; compositionLabel?: string | null; compositionProductIds?: number[] | null; lookbookTitle?: string | null; recommendationName?: string | null }>>();
    for (const image of (approvedLookbook.data ?? []) as Array<{ productId: number; imageUrl: string; sceneDescription: string; compositionLabel?: string | null; compositionProductIds?: number[] | null; lookbookTitle?: string | null; recommendationName?: string | null }>) {
      const images = grouped.get(image.productId) ?? [];
      images.push({ imageUrl: image.imageUrl, sceneDescription: image.sceneDescription, compositionLabel: image.compositionLabel, compositionProductIds: image.compositionProductIds, lookbookTitle: image.lookbookTitle, recommendationName: image.recommendationName });
      grouped.set(image.productId, images);
    }
    return grouped;
  }, [approvedLookbook.data]);
  const visibleProductIds = useMemo(() => new Set(products.map((product) => product.id)), [products]);
  const visibleAiLookbook = useMemo(() => (approvedLookbook.data ?? []).filter((image: any) => visibleProductIds.has(image.productId) || (Array.isArray(image.compositionProductIds) && image.compositionProductIds.some((id: number) => visibleProductIds.has(id)))) as ApprovedLookbookImage[], [approvedLookbook.data, visibleProductIds]);
  const [showcaseViewMode, setShowcaseViewMode] = useState<ShowcaseViewMode>("mixed");
  const showcaseSlidesFor = (items: DisplayProduct[]): ShowcaseSlide[] => items.flatMap((product) => {
    const productSlide = { product, imageUrl: customerProductImage(product.imageViews?.front, product.imageUrl), isAi: false };
    const modelSlides = (lookbookByProduct.get(product.id) ?? []).map((image) => ({ product, imageUrl: image.imageUrl, isAi: true, sceneDescription: image.sceneDescription, compositionLabel: image.compositionLabel, compositionProductIds: image.compositionProductIds, lookbookTitle: image.lookbookTitle, recommendationName: image.recommendationName }));
    return showcaseViewMode === "product" ? [productSlide] : showcaseViewMode === "model" ? modelSlides : [...modelSlides, productSlide];
  });
  const [showcaseMode, setShowcaseMode] = useState(false);
  const showcaseModeRef = useRef(false);
  const manualShowcaseRef = useRef(false);
  const updateShowcaseMode = (value: boolean) => { showcaseModeRef.current = value; setShowcaseMode(value); };
  const [showcaseGroup, setShowcaseGroup] = useState<"new" | "current">("new");
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseCompositionVisible, setShowcaseCompositionVisible] = useState(false);
  const idleRef = useRef<number | null>(null);
  const showcaseTimerRef = useRef<number | null>(null);
  const showcaseAudioRef = useRef<HTMLAudioElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundMessage, setSoundMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const cameraFacingMode = "environment" as const;
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const curatedRecommendations = trpc.stylist.published.useQuery({ locale });
  const [customerProfile, setCustomerProfile] = useState({ height: "", weight: "", shoulderWidth: "", chest: "", waist: "", hip: "", usualSize: "", bodyType: "unknown" as "slim" | "balanced" | "curvy" | "plus" | "unknown", intentText: "", detailText: "" });
  const displayRecommendationInput = { visitorId: "display-session", locale, intentText: customerProfile.intentText, detailText: customerProfile.detailText, height: customerProfile.height ? Number(customerProfile.height) : null, weight: customerProfile.weight ? Number(customerProfile.weight) : null, shoulderWidth: customerProfile.shoulderWidth ? Number(customerProfile.shoulderWidth) : null, chest: customerProfile.chest ? Number(customerProfile.chest) : null, waist: customerProfile.waist ? Number(customerProfile.waist) : null, hip: customerProfile.hip ? Number(customerProfile.hip) : null, bodyType: customerProfile.bodyType, usualSize: customerProfile.usualSize, photoDataUrl: capturedPhoto };
  const personalizedRecommendations = trpc.stylist.displayRecommend.useQuery(displayRecommendationInput, { enabled: false });
  const runPersonalizedRecommendation = () => { void personalizedRecommendations.refetch(); };
  const stopCamera = () => { cameraStreamRef.current?.getTracks().forEach((track) => track.stop()); cameraStreamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; };
  const closeCamera = () => { stopCamera(); setCameraOpen(false); setCameraError(""); };
  const openCamera = async () => {
    setCameraOpen(true); setCameraError(""); setCapturedPhoto(null); stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError(copy.cameraUnsupported); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: cameraFacingMode }, width: { ideal: 720 }, height: { ideal: 1280 }, aspectRatio: { ideal: 9 / 16 } }, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    } catch { setCameraError(copy.cameraPermission); }
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const sourceWidth = video.videoWidth || 720;
    const sourceHeight = video.videoHeight || 1280;
    const targetAspect = 9 / 16;
    const sourceAspect = sourceWidth / sourceHeight;
    const cropWidth = sourceAspect > targetAspect ? sourceHeight * targetAspect : sourceWidth;
    const cropHeight = sourceAspect > targetAspect ? sourceHeight : sourceWidth / targetAspect;
    const cropX = (sourceWidth - cropWidth) / 2;
    const cropY = (sourceHeight - cropHeight) / 2;
    const canvas = document.createElement("canvas"); canvas.width = 720; canvas.height = 1280;
    const context = canvas.getContext("2d"); if (!context) return;
    context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height); setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.92)); stopCamera();
  };
  useEffect(() => () => stopCamera(), []);
  const showcaseItems = showcaseGroup === "new" ? showcaseSlidesFor(newArrivalProducts) : showcaseSlidesFor(currentProducts);
  const showcaseSlide = showcaseItems[showcaseIndex];
  const showcaseProduct = showcaseSlide?.product;
  const resetIdleTimer = () => {
    if (idleRef.current !== null) window.clearTimeout(idleRef.current);
    if (manualShowcaseRef.current) return;
    if (showcaseModeRef.current) {
      updateShowcaseMode(false);
      setShowcaseIndex(0);
      setShowcaseGroup("new");
    }
    idleRef.current = window.setTimeout(() => {
      const firstGroup = newArrivalProducts.length ? "new" : currentProducts.length ? "current" : null;
      if (firstGroup) { manualShowcaseRef.current = false; setShowcaseGroup(firstGroup); setShowcaseIndex(0); setShowcaseCompositionVisible(false); updateShowcaseMode(true); }
    }, 60_000);
  };
  const startShowcase = () => { if (idleRef.current !== null) window.clearTimeout(idleRef.current); manualShowcaseRef.current = true; setShowcaseGroup(newArrivalProducts.length ? "new" : "current"); setShowcaseIndex(0); setShowcaseCompositionVisible(false); updateShowcaseMode(true); };
  const exitShowcase = () => { manualShowcaseRef.current = false; showcaseAudioRef.current?.pause(); setSoundEnabled(false); updateShowcaseMode(false); setShowcaseIndex(0); setShowcaseCompositionVisible(false); setShowcaseGroup("new"); resetIdleTimer(); };
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
      if (showcaseIndex + 1 < showcaseItems.length) { setShowcaseIndex((index) => index + 1); setShowcaseCompositionVisible(false); }
      else if (showcaseGroup === "new" && currentProducts.length) { setShowcaseGroup("current"); setShowcaseIndex(0); setShowcaseCompositionVisible(false); }
      else { setShowcaseIndex(0); setShowcaseCompositionVisible(false); }
    }, 8_000);
    return () => { if (showcaseTimerRef.current !== null) window.clearTimeout(showcaseTimerRef.current); };
  }, [showcaseMode, showcaseGroup, showcaseIndex, showcaseItems.length, currentProducts.length, approvedLookbook.data]);
  const requestBrowserFullscreen = async () => { try { await document.documentElement.requestFullscreen?.(); } catch { /* browser gesture or policy may reject this */ } }; const handleShowcaseBackdropPointerDown = () => { if (!manualShowcaseRef.current) exitShowcase(); };
  const handlePageWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    window.scrollBy({ top: event.deltaY * 1.8, behavior: "auto" });
  };
  return <><main onWheel={handlePageWheel} className="lesoul-display-page min-h-svh bg-[#f7f5f1] px-4 pb-10 pt-5 text-[#1d1a17] sm:px-8 lg:px-12"><header className="mx-auto max-w-7xl border-b border-[#ded8cf] pb-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[.22em] text-[#7a7065]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">LESOUL LOOK</h1><p className="mt-2 max-w-xl text-sm leading-5 text-[#746a60]">{copy.body}</p></div><div className="flex shrink-0 items-center gap-2"><LanguageSwitcher /><button type="button" onClick={() => void openCamera()} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-[#d8d0c7] bg-white px-3 text-[10px] font-bold" aria-label={copy.camera}><Camera size={15} />{copy.camera}</button><button type="button" onClick={startShowcase} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.showcase} title={copy.showcase}><MonitorPlay size={16} /></button><button type="button" onClick={() => void logout()} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#d8d0c7] bg-white" aria-label={copy.logout}><LogOut size={16} /></button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d8d0c7] bg-white px-3"><Search size={16} className="text-[#83786c]" /><span className="sr-only">{copy.brand}</span><input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder={copy.brandPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select value={brand} onChange={(event) => setBrand(event.target.value)} aria-label={copy.brand} className="min-h-11 rounded-xl border border-[#d8d0c7] bg-white px-3 text-sm"><option value="">{copy.allBrands}</option>{brands.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></header><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-b border-[#ded8cf] py-4" aria-label={copy.categoryLabel}><button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === "all" ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{copy.all}</button>{(managedCategories.data ?? []).map((item) => <button key={item.id} type="button" onClick={() => setCategory(String(item.id))} aria-pressed={category === String(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === String(item.id) ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#635b52]"}`}>{localizedCategoryName(item, i18n.language)}</button>)}</nav>{catalog.isLoading ? <section className="grid min-h-[65svh] place-items-center"><LoaderCircle className="animate-spin" aria-label={copy.loading} /></section> : products.length ? <><DisplayAiLookbookRow images={visibleAiLookbook} heading={copy.aiLookbook} compositionLabel={copy.aiComposition} language={i18n.language} products={products} position={copy.position.replace("{current}", visibleAiLookbook.length ? "1" : "0").replace("{total}", String(visibleAiLookbook.length))} /><DisplayProductRow items={newArrivalProducts} heading={copy.newArrivals} copy={copy} language={i18n.language} showInventoryQuantity={Boolean(purchaseConfig.data?.showInventoryQuantity)} /><DisplayProductRow items={currentProducts} heading={copy.currentProducts} copy={copy} language={i18n.language} showInventoryQuantity={Boolean(purchaseConfig.data?.showInventoryQuantity)} /></> : <section className="grid min-h-[65svh] place-items-center text-center"><div><MonitorPlay className="mx-auto text-[#8a7b6d]" size={34} /><p className="mt-4 text-sm text-[#746a60]">{copy.empty}</p></div></section>}</main>{cameraOpen && <div className="fixed inset-0 z-[90] grid min-h-svh place-items-center bg-[#1d1a17]/70 p-4 text-[#1d1a17]" role="dialog" aria-modal="true" aria-label={copy.cameraTitle}><div className="relative flex max-h-[calc(100svh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-[#f7f5f1] p-3 shadow-2xl sm:p-6"><div className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-3 bg-[#f7f5f1] pb-3 pr-12"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#84776b]">STORE DISPLAY</p><h2 className="mt-1 text-2xl font-semibold">{copy.cameraTitle}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#746a60]">{copy.cameraBody}</p></div><button type="button" onClick={closeCamera} className="absolute right-3 top-3 z-30 grid size-10 shrink-0 place-items-center rounded-full border border-[#d8d0c7] bg-white shadow-sm" aria-label={copy.closeCamera} title={copy.closeCamera}><X size={18} /></button></div><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]"><div className="mx-auto flex h-[min(52svh,32rem)] aspect-[9/16] w-auto max-w-full flex-col overflow-hidden rounded-2xl border border-[#e0d9d0] bg-black p-2"><div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-[#2b2520]">{capturedPhoto ? <img src={capturedPhoto} alt={copy.cameraTitle} className="h-full w-full object-cover" /> : <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />}{cameraError && <div className="absolute inset-0 grid place-items-center p-6 text-center text-xs font-semibold text-white">{cameraError}</div>}</div><div className="mt-3 flex shrink-0 flex-wrap items-center justify-center gap-2">{capturedPhoto ? <button type="button" onClick={() => void openCamera()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2b2520]"><RotateCcw size={14} />{copy.retake}</button> : <button type="button" onClick={capturePhoto} disabled={Boolean(cameraError)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-[#2b2520] disabled:opacity-40"><Camera size={14} />{copy.capture}</button>}</div></div><section className="rounded-2xl border border-[#e0d9d0] bg-white p-4"><h3 className="text-sm font-bold">{copy.profileTitle}</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><input inputMode="decimal" value={customerProfile.height} onChange={(event) => setCustomerProfile((current) => ({ ...current, height: event.target.value }))} placeholder={copy.height} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /><input inputMode="decimal" value={customerProfile.weight} onChange={(event) => setCustomerProfile((current) => ({ ...current, weight: event.target.value }))} placeholder={copy.weight} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /><input inputMode="decimal" value={customerProfile.shoulderWidth} onChange={(event) => setCustomerProfile((current) => ({ ...current, shoulderWidth: event.target.value }))} placeholder={copy.shoulder} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /><input inputMode="decimal" value={customerProfile.chest} onChange={(event) => setCustomerProfile((current) => ({ ...current, chest: event.target.value }))} placeholder={copy.chest} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /><input inputMode="decimal" value={customerProfile.waist} onChange={(event) => setCustomerProfile((current) => ({ ...current, waist: event.target.value }))} placeholder={copy.waist} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /><input inputMode="decimal" value={customerProfile.hip} onChange={(event) => setCustomerProfile((current) => ({ ...current, hip: event.target.value }))} placeholder={copy.hip} className="h-10 rounded-lg border border-[#dedbd4] px-2 text-xs" /></div><input value={customerProfile.usualSize} onChange={(event) => setCustomerProfile((current) => ({ ...current, usualSize: event.target.value }))} placeholder={copy.usualSize} className="mt-2 h-10 w-full rounded-lg border border-[#dedbd4] px-2 text-xs" /><select value={customerProfile.bodyType} onChange={(event) => setCustomerProfile((current) => ({ ...current, bodyType: event.target.value as typeof current.bodyType }))} className="mt-2 h-10 w-full rounded-lg border border-[#dedbd4] px-2 text-xs"><option value="unknown">{copy.bodyType}</option><option value="slim">{copy.bodySlim}</option><option value="balanced">{copy.bodyBalanced}</option><option value="curvy">{copy.bodyCurvy}</option><option value="plus">{copy.bodyPlus}</option></select><textarea value={customerProfile.intentText} onChange={(event) => setCustomerProfile((current) => ({ ...current, intentText: event.target.value }))} placeholder={copy.intentPlaceholder} aria-label={copy.intent} className="mt-2 min-h-20 w-full resize-y rounded-lg border border-[#dedbd4] p-2 text-xs" /><label className="mt-2 block text-[11px] font-semibold text-[#746a60]">{copy.detailRequirements}</label><textarea value={customerProfile.detailText} onChange={(event) => setCustomerProfile((current) => ({ ...current, detailText: event.target.value }))} placeholder={copy.detailPlaceholder} aria-label={copy.detailRequirements} className="mt-1 min-h-20 w-full resize-y rounded-lg border border-[#dedbd4] p-2 text-xs" /><button type="button" onClick={runPersonalizedRecommendation} disabled={personalizedRecommendations.isFetching} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2b2520] px-3 text-xs font-bold text-white disabled:opacity-60"><Sparkles size={14} />{personalizedRecommendations.isFetching ? copy.interpreting : copy.runRecommendation}</button></section><section><div className="mb-2 flex items-center gap-2"><Sparkles size={16} /><h3 className="text-sm font-bold tracking-[.08em]">{copy.recommendations}</h3></div>{personalizedRecommendations.data?.products?.length ? <div className="grid gap-3">{personalizedRecommendations.data.products.map((product) => <article key={product.id} className="rounded-2xl border border-[#d8c6b4] bg-[#fffaf4] p-3"><div className="flex gap-3"><NormalizedProductImage src={customerProductImage(product.imageViews?.front, product.imageUrl)} alt={localizedProductName(product, i18n.language)} className="size-20 shrink-0 rounded-xl" /><div className="min-w-0"><h4 className="font-semibold">{localizedProductName(product, i18n.language)}</h4><p className="mt-1 text-[11px] text-[#746a60]">{product.recommendedSize ? `${copy.sizeHint}: ${product.recommendedSize.size}` : personalizedRecommendations.data.usualSize ? `${copy.sizeHint}: ${personalizedRecommendations.data.usualSize}` : copy.cameraBody}</p></div></div></article>)}</div> : curatedRecommendations.isLoading ? <div className="grid place-items-center rounded-2xl border border-[#e0d9d0] bg-white p-8"><LoaderCircle className="animate-spin" size={18} /></div> : curatedRecommendations.data?.outfits?.length ? <div className="grid gap-3">{curatedRecommendations.data.outfits.map((outfit) => { const first = outfit.products[0]; return <article key={outfit.lookId} className="rounded-2xl border border-[#e0d9d0] bg-white p-3"><div className="flex gap-3">{first && <NormalizedProductImage src={customerProductImage(first.imageViews?.front, first.imageUrl)} alt={outfit.name} className="size-20 shrink-0 rounded-xl" />}<div className="min-w-0"><h4 className="font-semibold">{outfit.name}</h4>{outfit.reason && <p className="mt-1 text-[11px] leading-4 text-[#746a60]">{outfit.reason}</p>}<p className="mt-2 text-[10px] font-semibold text-[#8b7d6f]">{outfit.products.map((product) => localizedProductName(product as Parameters<typeof localizedProductName>[0], i18n.language)).join(" · ")}</p></div></div></article>; })}</div> : <p className="rounded-2xl border border-[#e0d9d0] bg-white p-5 text-xs text-[#746a60]">{copy.noRecommendations}</p>}</section></div></div></div></div>}{showcaseMode && showcaseProduct && <div className="fixed inset-0 z-[80] grid min-h-svh place-items-center bg-[#f7f5f1] p-5 text-[#1d1a17]" role="dialog" aria-modal="true" aria-label={copy.showcase} onPointerDown={handleShowcaseBackdropPointerDown}><audio ref={showcaseAudioRef} preload="none" aria-hidden="true" /><div className="flex max-h-[calc(100svh-2.5rem)] w-full max-w-4xl flex-col overflow-auto rounded-[2rem] border border-[#e0d9d0] bg-white p-4 shadow-[0_24px_80px_rgba(38,31,24,.18)] sm:p-6" onPointerDown={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-bold tracking-[.18em] text-[#84776b]">{copy.showcase}{showcaseSlide?.isAi && <span className="ml-2 rounded-full bg-[#efe4d4] px-2 py-1 text-[9px] tracking-normal text-[#806b55]">AI LOOKBOOK</span>}</p><div className="flex gap-2"><div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f3ed] p-2"><span className="text-[10px] font-bold text-[#6f6256]">{copy.showcaseModeLabel}</span>{(["mixed", "product", "model"] as ShowcaseViewMode[]).map((mode) => <button key={mode} type="button" onClick={() => { setShowcaseViewMode(mode); setShowcaseIndex(0); }} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${showcaseViewMode === mode ? "bg-[#2b2520] text-white" : "bg-white text-[#6f6256]"}`}>{mode === "mixed" ? copy.mixedMode : mode === "product" ? copy.productMode : copy.modelMode}</button>)}</div><button type="button" onClick={() => void toggleSound()} className="inline-flex items-center gap-1 rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold" aria-label={soundEnabled ? copy.soundOff : copy.soundOn}>{soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}{soundEnabled ? copy.soundOff : copy.soundOn}</button><button type="button" onClick={() => void requestBrowserFullscreen()} className="rounded-full border border-[#d8d0c7] px-3 py-2 text-[10px] font-bold">{copy.fullscreen}</button><button type="button" onClick={exitShowcase} className="rounded-full bg-[#2b2520] px-3 py-2 text-[10px] font-bold text-white">{copy.exitShowcase}</button></div></div>{soundMessage && <p role="status" className="mb-2 text-center text-[10px] text-[#8a7d70]">{soundMessage}</p>}<div className="min-h-0 flex flex-1 items-center justify-center overflow-hidden"><div className="h-[min(68svh,42rem)] w-full max-w-4xl min-w-0">{showcaseSlide?.isAi ? <button type="button" className="h-full w-full cursor-pointer" onClick={() => setShowcaseCompositionVisible((visible) => !visible)} aria-label={copy.aiComposition}><img src={showcaseSlide.imageUrl} alt={showcaseSlide.sceneDescription || localizedProductName(showcaseProduct, i18n.language)} className="h-full w-full object-contain p-2 sm:p-4" loading="eager" /></button> : <NormalizedProductImage src={showcaseSlide?.imageUrl || customerProductImage(showcaseProduct.imageViews?.front, showcaseProduct.imageUrl)} alt={localizedProductName(showcaseProduct, i18n.language)} catalogDisplay={showcaseProduct.catalogDisplay} className="h-full w-full object-contain p-2 sm:p-4" /> }</div></div><div className="mt-2 min-h-5 text-center text-[11px] font-semibold text-[#75685c]">{showcaseSlide?.isAi && showcaseCompositionVisible ? `${copy.aiComposition}: ${localizedLookbookComposition(showcaseSlide, products, i18n.language)}${showcaseSlide.lookbookTitle || showcaseSlide.recommendationName ? ` · ${showcaseSlide.lookbookTitle || ""}${showcaseSlide.lookbookTitle && showcaseSlide.recommendationName ? " · " : ""}${showcaseSlide.recommendationName || ""}` : ""}` : showcaseSlide?.isAi ? (locale === "ko" ? "모델 사진을 터치하면 코디 상품을 확인할 수 있습니다" : locale === "zh" ? "点击模特图片查看搭配商品" : "Tap the model photo to see the outfit pieces") : ""}</div><div className="mt-4 flex items-end justify-between gap-4 border-t border-[#eee9e3] pt-4"><div><p className="text-xs font-bold tracking-[.14em] text-[#8b7d6f]">{showcaseProduct.brand || "LESOUL"}</p><h2 className="mt-1 text-xl font-semibold sm:text-3xl">{localizedProductName(showcaseProduct, i18n.language)}</h2></div><div className="text-right"><ProductPrice product={showcaseProduct} className="text-xl sm:text-3xl" /><p className="mt-1 text-[10px] tabular-nums text-[#8a7d70]">{copy.position.replace("{current}", String(showcaseIndex + 1)).replace("{total}", String(showcaseItems.length))}</p></div></div></div></div>}</>;
}
