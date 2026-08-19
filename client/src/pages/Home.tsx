import MobileScreen from "@/components/MobileScreen";
import ProductDetailScreen from "@/components/ProductDetailScreen";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { trpc } from "@/lib/trpc";
import { getVisitorId } from "@/lib/visitor";
import { useAuth } from "@/_core/hooks/useAuth";
import { localizedProductName } from "@shared/productCommerce";
import { isNewArrival } from "@shared/productAvailability";
import { formatKeyMeasurement } from "@shared/catalogDisplay";
import { Camera, Shirt, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [anonymousVisitorId] = useState(() => getVisitorId());
  const visitorId = user?.openId ? `account:${user.openId}` : anonymousVisitorId;
  const access = trpc.access.status.useQuery({ visitorId });
  const [detailId, setDetailId] = useState<number | null>(null);
  const catalog = trpc.catalog.browseProducts.useQuery();
  const language = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "PERSONAL AI FASHION STUDIO", aiLook: "AI LOOK", fitting: "AI FITTING", fittingBody: "Admin AI fitting and test models", liying: "LIYING AI", liyingBody: "VIP fitting with the fixed 李瀛 reference identity", match: "AI STYLE MATCH", matchBody: "Find complete looks from real available LESOUL products", quick: "QUICK AI", quickBody: "Admin-only product editorial generation", browse: "BROWSE PRODUCTS", browseBody: "Explore all active pieces by category", newArrivals: "NEW ARRIVALS", seeAll: "SEE ALL", promise: "Style your LOOK with real LESOUL pieces." },
    ko: { eyebrow: "퍼스널 AI 패션 스튜디오", aiLook: "AI 룩", fitting: "AI 피팅", fittingBody: "관리자 AI 피팅 및 테스트 모델", liying: "李瀛 AI", liyingBody: "고정 李瀛 레퍼런스 아이덴티티로 보는 VIP 피팅", match: "AI 스타일 매치", matchBody: "실제 판매 중 LESOUL 상품으로 완성 코디 추천", quick: "퀵 AI", quickBody: "관리자 전용 상품 에디토리얼 생성", browse: "상품 둘러보기", browseBody: "상의·하의 등 종류별 모든 상품 보기", newArrivals: "신상품", seeAll: "전체 보기", promise: "실제 LESOUL 상품으로 나만의 LOOK을 완성하세요." },
    zh: { eyebrow: "个人 AI 时尚工作室", aiLook: "AI 造型", fitting: "AI 试穿", fittingBody: "管理员 AI 试穿与测试模特", liying: "李瀛 AI", liyingBody: "使用固定 李瀛 参考身份的 VIP 试穿", match: "AI 搭配推荐", matchBody: "从真实在售 LESOUL 商品中推荐完整搭配", quick: "快速 AI", quickBody: "管理员专用商品视觉生成", browse: "浏览商品", browseBody: "按品类查看全部在售商品", newArrivals: "新品上架", seeAll: "查看全部", promise: "用真实 LESOUL 商品完成你的 LOOK。" },
  }[language];
  const capabilities = access.data?.capabilities;
  const primary = capabilities?.aiFitting ? { label: copy.fitting, body: copy.fittingBody, action: () => navigate("/body-model") } : capabilities?.liyingAI ? { label: copy.liying, body: copy.liyingBody, action: () => navigate("/body-model") } : { label: copy.match, body: copy.matchBody, action: () => navigate("/style-match") };
  const newArrivals = useMemo(() => (catalog.data ?? []).filter((product) => isNewArrival(product)).sort((left, right) => new Date(right.newArrivalAt ?? 0).getTime() - new Date(left.newArrivalAt ?? 0).getTime()).slice(0, 8), [catalog.data]);
  useEffect(() => { if (newArrivals[0]?.newArrivalAt) localStorage.setItem("lesoulNewArrivalsSeenAt", new Date(newArrivals[0].newArrivalAt).toISOString()); }, [newArrivals]);

  return <MobileScreen><main className="lesoul-mobile-frame lesoul-home flex min-h-[calc(100dvh-var(--mobile-nav-height)-var(--safe-area-bottom))] flex-col px-6 pb-5 pt-[max(2rem,var(--safe-area-top))] text-center"><div className="flex flex-1 flex-col items-center justify-center pb-12"><span className="text-[9px] font-bold tracking-[.26em] text-[#8b8378]">{copy.eyebrow}</span><h1 className="mt-3 font-serif text-4xl tracking-[.18em] text-[#171717]">LESOUL</h1><p className="mt-1 text-sm font-light tracking-[.26em] text-[#272727]">{copy.aiLook}</p><p className="mt-3 max-w-60 text-sm leading-5 text-[#777]">{t("home.headline")}</p></div><div className="grid gap-3 py-6 text-left"><button onClick={primary.action} className="rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_25%,#e7dace,#a88769)] p-4 text-white shadow-[0_14px_28px_rgba(111,82,59,.22)]"><span className="flex items-center gap-3"><Camera size={23} /><span><b className="block text-xs tracking-[.12em]">{primary.label}</b><small className="mt-1 block text-[10px] text-white/80">{primary.body}</small></span><span className="ml-auto text-lg">→</span></span></button>{capabilities?.quickAI && <button onClick={() => navigate("/quick-fit")} className="rounded-[1.4rem] border border-[#d9d2c8] bg-white p-4"><span className="flex items-center gap-3"><Shirt size={23} /><span><b className="block text-xs tracking-[.12em]">{copy.quick}</b><small className="mt-1 block text-[10px] text-[#777]">{copy.quickBody}</small></span><span className="ml-auto text-lg">→</span></span></button>}<button onClick={() => navigate("/catalog")} className="rounded-2xl border border-dashed border-[#cfc4b8] bg-[#f8f5ef] px-4 py-3"><span className="flex items-center gap-3"><ShoppingBag size={18} /><span><b className="block text-[10px] tracking-[.12em] text-[#40372e]">{copy.browse}</b><small className="mt-1 block text-[10px] text-[#777]">{copy.browseBody}</small></span><span className="ml-auto text-base text-[#544a40]">→</span></span></button></div>{newArrivals.length > 0 && <section className="border-t border-[#ddd5ca] pt-5 text-left"><div className="flex items-center justify-between"><h2 className="text-[10px] font-bold tracking-[.16em] text-[#5f5143]">{copy.newArrivals}</h2><button onClick={() => navigate("/catalog")} className="text-[10px] font-bold tracking-[.08em] text-[#665546]">{copy.seeAll}</button></div><div className="mt-3 flex gap-3 overflow-x-auto pb-2"><style>{`.new-arrival-strip::-webkit-scrollbar{display:none}`}</style>{newArrivals.map((product) => <button key={product.id} onClick={() => setDetailId(product.id)} className="new-arrival-strip relative w-28 shrink-0 text-left"><div className="relative"><NormalizedProductImage src={product.imageViews?.front?.original ?? product.imageUrl} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-[4/5] overflow-hidden rounded-xl" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} newArrivalAt={product.newArrivalAt} /></div><p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-[#332a23]">{localizedProductName(product, i18n.language)}</p>{formatKeyMeasurement(product, language) && <p className="mt-1 text-[9px] text-[#786c60]">{formatKeyMeasurement(product, language)}</p>}</button>)}</div></section>}<p className="pb-2 pt-5 text-[10px] leading-4 text-[#8a837a]">{copy.promise}</p></main>{detailId && <ProductDetailScreen productId={detailId} browseAll onClose={() => setDetailId(null)} />}</MobileScreen>;
}
