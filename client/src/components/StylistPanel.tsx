import { useState } from "react";
import { trpc } from "@/lib/trpc";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import ProductPrice from "@/components/ProductPrice";
import type { StylePresetKey } from "@shared/stylist";
import { localizedProductName } from "@shared/productCommerce";
import { useTranslation } from "react-i18next";
import { readBodyMeasurements } from "@/lib/bodyMeasurements";
import { getVisitorId } from "@/lib/visitor";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, LoaderCircle, Sparkles } from "lucide-react";

export type StylistProduct = { id: number; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; imageUrl: string; category: string; status: string; price: number; priceOriginal?: number | null; discountRate?: number | null; priceSale?: number | null; saleEnabled?: number | boolean | null; availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "PRE_ORDER" | "SOLD_OUT" | null; isNew?: number | boolean | null; garmentMeasurements?: import("@shared/fitEngine").GarmentMeasurements | null; catalogDisplay?: import("@shared/catalogDisplay").CatalogDisplaySettings & { effectiveScale?: number | null } };
export type StylistRecommendation = { lookId: string; productIds: number[]; score: number; reason: string; scoreBreakdown: { style: number; color: number; silhouette: number; season: number; material: number; formality: number; fit: number } };

export function stylistErrorMessage(message: string | undefined, locale: "en" | "ko" | "zh") {
  const quotaReached = message?.includes("GENERATION_ACCESS_DENIED:style_match_quota");
  if (quotaReached) return locale === "ko" ? "AI 스타일 매치 사용 횟수를 모두 사용했습니다. 상품 둘러보기는 계속 이용할 수 있습니다." : locale === "zh" ? "AI 搭配推荐次数已用完，仍可继续浏览商品。" : "Your AI Style Match limit has been reached. You can still browse products.";
  return locale === "ko" ? "추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : locale === "zh" ? "暂时无法加载推荐，请稍后重试。" : "We could not load recommendations. Please try again shortly.";
}

export function shouldRetryStylistRecommendation(failureCount: number, error: { message: string }) {
  if (error.message.includes("GENERATION_ACCESS_DENIED:style_match_quota")) return false;
  return failureCount < 1;
}

export default function StylistPanel({ products, onUseLook, onError, requireAnchor = false }: { products: StylistProduct[]; onUseLook: (selection: { products: StylistProduct[]; styleName: string; styleKey: string; selectedLookId: string; recommendations: StylistRecommendation[] }) => void; onError: (message: string) => void; requireAnchor?: boolean }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [anonymousVisitorId] = useState(() => getVisitorId());
  const visitorId = user?.openId ? `account:${user.openId}` : anonymousVisitorId;
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { title: "AI STYLIST", pin: "STYLE THIS ITEM", pinBody: "Keep one item in every recommendation.", selectFirst: "Choose one product to start your match.", clear: "Clear", use: "CHOOSE THIS LOOK", selected: "SELECTED", unavailable: "The recommended products are no longer available. Please refresh your recommendations.", loading: "Finding your LOOKs…", retry: "TRY AGAIN" },
    ko: { title: "AI 스타일리스트", pin: "이 상품으로 코디", pinBody: "고정한 상품은 모든 추천에 유지됩니다.", selectFirst: "상품 하나를 선택해 코디를 시작하세요.", clear: "해제", use: "이 코디 선택", selected: "선택됨", unavailable: "추천 상품이 더 이상 판매 중이 아닙니다. 추천을 새로고침해 주세요.", loading: "LOOK을 찾는 중…", retry: "다시 시도" },
    zh: { title: "AI 造型师", pin: "以此商品搭配", pinBody: "固定商品会保留在全部推荐中。", selectFirst: "请选择一件商品开始搭配。", clear: "清除", use: "选择这套搭配", selected: "已选择", unavailable: "推荐商品已不再在售，请刷新推荐。", loading: "正在寻找你的 LOOK…", retry: "重试" },
  }[locale];
  const [styleKey, setStyleKey] = useState<StylePresetKey>("quiet_luxury");
  const [anchorProductId, setAnchorProductId] = useState<number | null>(null);
  const [selectedLookId, setSelectedLookId] = useState<string | null>(null);
  const [fitBody] = useState(() => { const measurements = readBodyMeasurements(); return { bustCm: measurements.chest, waistCm: measurements.waist, hipCm: measurements.hip, shoulderCm: measurements.shoulderWidth }; });
  const presets = trpc.stylist.presets.useQuery();
  const recommendations = trpc.stylist.recommend.useQuery({ visitorId, styleKey, anchorProductId, locale, body: fitBody }, { enabled: !requireAnchor || Boolean(anchorProductId), retry: shouldRetryStylistRecommendation });
  const activeProducts = products.filter((product) => product.status === "in_stock");
  const activePreset = presets.data?.find((preset) => preset.key === styleKey);
  const presetLabel = (key: string) => ({ en: { quiet_luxury: "QUIET LUXURY", elegant: "ELEGANT", minimal: "MINIMAL", chic: "CHIC", casual: "CASUAL", office: "OFFICE", date: "DATE", street: "STREET", ai_choice: "AI CHOICE" }, ko: { quiet_luxury: "콰이어트 럭셔리", elegant: "엘레강트", minimal: "미니멀", chic: "시크", casual: "캐주얼", office: "오피스", date: "데이트", street: "스트리트", ai_choice: "AI 추천" }, zh: { quiet_luxury: "静奢风", elegant: "优雅", minimal: "极简", chic: "摩登", casual: "休闲", office: "通勤", date: "约会", street: "街头", ai_choice: "AI 推荐" } }[locale] as Record<string, string>)[key] ?? key.toUpperCase();
  const useRecommendation = (recommendation: StylistRecommendation) => {
    const selected = recommendation.productIds.map((id) => activeProducts.find((product) => product.id === id)).filter(Boolean) as StylistProduct[];
    if (!selected.length) return onError(copy.unavailable);
    setSelectedLookId(recommendation.lookId);
    onUseLook({ products: selected, styleName: presetLabel(activePreset?.key ?? styleKey), styleKey: activePreset?.key ?? styleKey, selectedLookId: recommendation.lookId, recommendations: (recommendations.data ?? []) as StylistRecommendation[] });
  };
  return <section className="mt-4"><div className="rounded-[1.2rem] border border-[#e2ddd5] bg-[#fbfaf8] p-3"><div className="flex items-center gap-2"><Sparkles size={15} /><p className="text-[10px] font-bold tracking-[.14em] text-[#6e655c]">{copy.title}</p></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{presets.data?.map((preset) => <button key={preset.key} onClick={() => { setStyleKey(preset.key as StylePresetKey); setAnchorProductId(null); setSelectedLookId(null); }} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold ${styleKey === preset.key ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#666]"}`}>{presetLabel(preset.key)}</button>)}</div></div><div className="mt-3 rounded-xl border border-[#e1ddd6] bg-white p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold tracking-[.12em]">{copy.pin}</p><p className="mt-1 text-[10px] text-[#777]">{copy.pinBody}</p></div>{anchorProductId && <button onClick={() => { setAnchorProductId(null); setSelectedLookId(null); }} className="rounded-full bg-[#efeae2] px-2.5 py-1.5 text-[10px] font-semibold">{copy.clear}</button>}</div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{activeProducts.map((product) => <button key={product.id} onClick={() => { setAnchorProductId(product.id); setSelectedLookId(null); }} className={`w-16 shrink-0 overflow-hidden rounded-lg border text-left ${anchorProductId === product.id ? "border-black ring-1 ring-black" : "border-[#dedbd4]"}`}><div className="relative"><NormalizedProductImage src={product.imageUrl} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-square w-full" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} className="inset-x-1 top-1" /></div><span className="line-clamp-2 block p-1 text-[8px] font-semibold">{localizedProductName(product, i18n.language)}</span></button>)}</div></div><div className="mt-4 grid gap-3">{requireAnchor && !anchorProductId && <p className="rounded-xl border border-dashed border-[#d8d1c7] bg-[#fbfaf8] p-4 text-center text-[11px] text-[#70675e]">{copy.selectFirst}</p>}{recommendations.isLoading && <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-[#d8d1c7]"><LoaderCircle className="animate-spin" size={20} aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></div>}{recommendations.isError && <div role="alert" className="rounded-xl border border-[#d8d1c7] bg-[#fbfaf8] p-4 text-center"><p className="text-[11px] leading-5 text-[#70675e]">{stylistErrorMessage(recommendations.error.message, locale)}</p><button onClick={() => void recommendations.refetch()} className="mt-3 rounded-full border border-[#cfc6ba] bg-white px-3 py-2 text-[10px] font-bold text-[#332d28]">{copy.retry}</button></div>}{(recommendations.data as StylistRecommendation[] | undefined)?.map((recommendation) => { const lookProducts = recommendation.productIds.map((id) => activeProducts.find((product) => product.id === id)).filter(Boolean) as StylistProduct[]; const isSelected = selectedLookId === recommendation.lookId; return <article key={recommendation.lookId} aria-live={isSelected ? "polite" : undefined} className={`relative rounded-[1.2rem] border-2 bg-white p-3 transition ${isSelected ? "border-black ring-2 ring-black/20 shadow-[0_10px_24px_rgba(31,26,21,.12)]" : "border-[#dedbd4]"}`}><div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold tracking-[.14em] text-[#4a433c]">{recommendation.lookId.replace("_", " ")}</p>{isSelected && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-2 py-1 text-[9px] font-bold text-white"><Check size={10} />{copy.selected}</span>}</div><div className="mt-3 flex gap-2 overflow-x-auto">{lookProducts.map((product) => <div key={product.id} className="w-20 shrink-0"><div className="relative"><NormalizedProductImage src={product.imageUrl} alt={localizedProductName(product, i18n.language)} catalogDisplay={product.catalogDisplay} className="aspect-square w-full rounded-lg" /><ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} showAvailability={false} className="inset-x-1 top-1" /></div><p className="mt-1 line-clamp-2 text-[9px] font-semibold">{localizedProductName(product, i18n.language)}</p>{typeof product.price === "number" && <ProductPrice product={product} className="mt-1 text-[10px]" />}</div>)}</div><p className="mt-3 text-[11px] leading-4 text-[#71685f]">{recommendation.reason}</p><button onClick={() => useRecommendation(recommendation)} aria-pressed={isSelected} className={`mt-3 w-full rounded-xl py-2.5 text-[11px] font-bold text-white ${isSelected ? "bg-[#29231e]" : "bg-black"}`}>{isSelected ? copy.selected : copy.use}</button></article>; })}</div></section>;
}
