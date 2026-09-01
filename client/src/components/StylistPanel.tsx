import { trpc } from "@/lib/trpc";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import ProductPrice from "@/components/ProductPrice";
import { Check, LoaderCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type StylistProduct = {
  id: number;
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  imageUrl: string;
  category: string;
  status: string;
  price: number;
  priceOriginal?: number | null;
  discountRate?: number | null;
  priceSale?: number | null;
  saleEnabled?: number | boolean | null;
  availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "PRE_ORDER" | "SOLD_OUT" | null;
  isActive?: number | boolean | null;
  isNew?: number | boolean | null;
  garmentMeasurements?: import("@shared/fitEngine").GarmentMeasurements | null;
  sizeOptions?: Array<{ label?: string }> | null;
  catalogDisplay?: import("@shared/catalogDisplay").CatalogDisplaySettings & { effectiveScale?: number | null };
};

export type StylistRecommendation = {
  lookId: string;
  productIds: number[];
  score: number;
  reason: string;
  scoreBreakdown: { style: number; color: number; silhouette: number; season: number; material: number; formality: number; fit: number };
};

export function stylistErrorMessage(_message: string | undefined, locale: "en" | "ko" | "zh") {
  return locale === "ko" ? "관리자 추천 코디를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : locale === "zh" ? "暂时无法加载店主精选搭配，请稍后重试。" : "We could not load administrator-curated looks. Please try again shortly.";
}

export function shouldRetryStylistRecommendation(failureCount: number) {
  return failureCount < 1;
}

export function shouldShowStylistStatusBadge(surface: "picker" | "recommendation") {
  return surface === "recommendation";
}

type PublishedLook = {
  lookId: string;
  name: string | null;
  reason: string | null;
  stylePresetKey: string;
  products: StylistProduct[];
};

type StylistPanelProps = {
  onUseLook: (selection: { products: StylistProduct[]; styleName: string; styleKey: string; selectedLookId: string; recommendations: StylistRecommendation[] }) => void;
  onError: (message: string) => void;
};

export default function StylistPanel({ onUseLook, onError }: StylistPanelProps) {
  const { i18n } = useTranslation();
  const [selectedLookId, setSelectedLookId] = useState<string | null>(null);
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: {
      title: "ADMINISTRATOR-CURATED LOOKS",
      intro: "Only looks saved and published by the LESOUL administrator appear here.",
      empty: "No administrator-curated looks are published yet.",
      loading: "Loading administrator-curated looks…",
      retry: "TRY AGAIN",
      choose: "ADD THIS LOOK TO PURCHASE LIST",
      selected: "ADDED TO PURCHASE LIST",
      defaultReason: "A complete look selected by the LESOUL administrator.",
      productCount: "products",
      selectedTitle: "SELECTED CURATED LOOK",
      selectedPhoto: "Selected look photo",
    },
    ko: {
      title: "관리자 추천 코디",
      intro: "이곳에는 LESOUL 관리자가 저장하고 공개한 코디만 표시됩니다.",
      empty: "아직 공개된 관리자 추천 코디가 없습니다.",
      loading: "관리자 추천 코디를 불러오는 중…",
      retry: "다시 시도",
      choose: "이 코디를 구매목록에 담기",
      selected: "구매목록에 담김",
      defaultReason: "LESOUL 관리자가 선택한 완성 코디입니다.",
      productCount: "개 상품",
      selectedTitle: "선택한 관리자 추천 코디",
      selectedPhoto: "선택한 추천 코디 사진",
    },
    zh: {
      title: "店主精选搭配",
      intro: "这里只显示 LESOUL 店主保存并公开的搭配。",
      empty: "暂时没有已公开的店主精选搭配。",
      loading: "正在加载店主精选搭配…",
      retry: "重试",
      choose: "将此搭配加入购买清单",
      selected: "已加入购买清单",
      defaultReason: "这是由 LESOUL 店主精选的完整搭配。",
      productCount: "件商品",
      selectedTitle: "已选择的店主精选搭配",
      selectedPhoto: "已选择的精选搭配图片",
    },
  }[locale];

  const published = trpc.stylist.published.useQuery(
    { locale },
    { retry: shouldRetryStylistRecommendation },
  );
  const looks = (published.data ?? []) as PublishedLook[];
  const selectedLook = looks.find((look) => look.lookId === selectedLookId) ?? null;

  const useLook = (look: PublishedLook) => {
    const products = look.products.filter(Boolean);
    if (products.length < 2) {
      onError(stylistErrorMessage("incomplete", locale));
      return;
    }
    setSelectedLookId(look.lookId);
    onUseLook({
      products,
      styleName: look.name ?? copy.title,
      styleKey: look.stylePresetKey,
      selectedLookId: look.lookId,
      recommendations: [],
    });
  };

  return (
    <section className="mt-5" aria-labelledby="curated-look-title">
      <div className="rounded-[1.2rem] border border-[#e2ddd5] bg-[#fbfaf8] p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={15} aria-hidden="true" />
          <p id="curated-look-title" className="text-[10px] font-bold tracking-[.14em] text-[#6e655c]">{copy.title}</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#71685f]">{copy.intro}</p>
      </div>

      {published.isLoading && (
        <div className="mt-4 grid min-h-32 place-items-center rounded-xl border border-dashed border-[#d8d1c7] bg-white">
          <LoaderCircle className="animate-spin" size={20} aria-label={copy.loading} />
          <span className="sr-only">{copy.loading}</span>
        </div>
      )}

      {published.isError && (
        <div className="mt-4 rounded-xl border border-[#d8d1c7] bg-[#fbfaf8] p-4 text-center" role="alert">
          <p className="text-[11px] leading-5 text-[#70675e]">{stylistErrorMessage(published.error.message, locale)}</p>
          <button onClick={() => void published.refetch()} className="mt-3 rounded-full border border-[#cfc6ba] bg-white px-3 py-2 text-[10px] font-bold">{copy.retry}</button>
        </div>
      )}

      {!published.isLoading && !published.isError && looks.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[#d8d1c7] bg-white p-6 text-center text-xs leading-5 text-[#70675e]">{copy.empty}</div>
      )}

      <div className="mt-4 grid gap-4">
        {looks.map((look) => {
          const isSelected = selectedLookId === look.lookId;
          return (
            <article key={look.lookId} className={`rounded-[1.2rem] border-2 bg-white p-3 transition ${isSelected ? "border-black ring-2 ring-black/20 shadow-[0_10px_24px_rgba(31,26,21,.12)]" : "border-[#dedbd4]"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#302a25]">{look.name || copy.title}</p>
                  <p className="mt-1 text-[10px] font-bold tracking-[.12em] text-[#83786d]">{look.products.length}{copy.productCount}</p>
                </div>
                {isSelected && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-2 py-1 text-[9px] font-bold text-white"><Check size={10} aria-hidden="true" />{copy.selected}</span>}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {look.products.map((product) => (
                  <div key={product.id} className="min-w-0">
                    <div className="relative overflow-hidden rounded-lg">
                      <NormalizedProductImage src={product.imageUrl} alt={product.name} catalogDisplay={product.catalogDisplay} className="aspect-square w-full" />
                      {shouldShowStylistStatusBadge("recommendation") && <ProductStatusBadges availabilityStatus={product.availabilityStatus} legacyStatus={product.status} isNew={product.isNew} showAvailability={false} className="inset-x-1 top-1" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] font-semibold text-[#413a34]">{product.name}</p>
                    <ProductPrice product={product} className="mt-1 text-[10px]" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[#71685f]">{look.reason || copy.defaultReason}</p>
              <button onClick={() => useLook(look)} aria-pressed={isSelected} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-white ${isSelected ? "bg-[#29231e]" : "bg-black"}`}>
                <ShoppingBag size={14} aria-hidden="true" />
                {isSelected ? copy.selected : copy.choose}
              </button>
            </article>
          );
        })}
      </div>

      {selectedLook && (
        <section className="mt-5 rounded-[1.2rem] border border-[#ded8cf] bg-white p-3 shadow-[0_12px_28px_rgba(31,26,21,.08)]" aria-labelledby="selected-curated-look-title">
          <div className="flex items-center justify-between gap-3">
            <p id="selected-curated-look-title" className="text-[10px] font-bold tracking-[.14em] text-[#6e655c]">{copy.selectedTitle}</p>
            <span className="rounded-full bg-[#f1ede7] px-2 py-1 text-[9px] font-bold text-[#665c52]">{selectedLook.products.length}{copy.productCount}</span>
          </div>
          {selectedLook.products[0] && <NormalizedProductImage src={selectedLook.products[0].imageUrl} alt={copy.selectedPhoto} catalogDisplay={selectedLook.products[0].catalogDisplay} className="mt-3 aspect-[4/5] w-full rounded-xl" />}
          <h2 className="mt-4 font-serif text-2xl text-[#2d2722]">{selectedLook.name || copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#71685f]">{selectedLook.reason || copy.defaultReason}</p>
          {selectedLook.products.length > 1 && <div className="mt-4 grid grid-cols-4 gap-2">{selectedLook.products.slice(1).map((product) => <NormalizedProductImage key={product.id} src={product.imageUrl} alt={product.name} catalogDisplay={product.catalogDisplay} className="aspect-square w-full rounded-lg" />)}</div>}
        </section>
      )}
    </section>
  );
}
