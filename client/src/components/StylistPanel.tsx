import { LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { StylePresetKey } from "@shared/stylist";
import { localizedProductName } from "@shared/productCommerce";
import { useTranslation } from "react-i18next";
import { readBodyMeasurements } from "@/lib/bodyMeasurements";

export type StylistProduct = {
  id: number;
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  imageUrl: string;
  category: string;
  status: string;
};

export type StylistRecommendation = {
  lookId: string;
  productIds: number[];
  score: number;
  reason: string;
  scoreBreakdown: {
    style: number;
    color: number;
    silhouette: number;
    season: number;
    material: number;
    formality: number;
    fit: number;
  };
};

function getVisitorId() {
  const key = "lesoul-stylist-visitor";
  const saved = localStorage.getItem(key);
  if (saved) return saved;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export default function StylistPanel({ products, onUseLook, onError }: {
  products: StylistProduct[];
  onUseLook: (selection: { products: StylistProduct[]; styleName: string; selectedLookId: string; recommendations: StylistRecommendation[] }) => void;
  onError: (message: string) => void;
}) {
  const { i18n } = useTranslation();
  const [styleKey, setStyleKey] = useState<StylePresetKey>("quiet_luxury");
  const [anchorProductId, setAnchorProductId] = useState<number | null>(null);
  const [chosenLookId, setChosenLookId] = useState<string | null>(null);
  const [fitBody] = useState(() => { const measurements = readBodyMeasurements(); return { bustCm: measurements.chest, waistCm: measurements.waist, hipCm: measurements.hip, shoulderCm: measurements.shoulderWidth }; });
  const presets = trpc.stylist.presets.useQuery();
  const recommendations = trpc.stylist.recommend.useQuery({ styleKey, anchorProductId, body: fitBody });
  const feedback = trpc.stylist.feedback.useMutation();
  const activeProducts = products.filter((product) => product.status === "in_stock");
  const activePreset = presets.data?.find((preset) => preset.key === styleKey);

  function useRecommendation(recommendation: StylistRecommendation) {
    const selected = recommendation.productIds
      .map((id) => activeProducts.find((product) => product.id === id))
      .filter(Boolean) as StylistProduct[];
    if (!selected.length) return onError("The recommended products are no longer active. Please refresh your recommendations.");
    setChosenLookId(recommendation.lookId);
    onUseLook({ products: selected, styleName: activePreset?.name ?? styleKey.toUpperCase(), selectedLookId: recommendation.lookId, recommendations: (recommendations.data ?? []) as StylistRecommendation[] });
  }

  async function submitFeedback(recommendation: StylistRecommendation, value: "good" | "bad") {
    try {
      await feedback.mutateAsync({
        visitorId: getVisitorId(), styleKey, anchorProductId,
        productIds: recommendation.productIds, score: recommendation.score, feedback: value,
      });
    } catch {
      onError("Unable to save feedback. Please try again.");
    }
  }

  return <section className="mt-4">
    <div className="rounded-[1.2rem] border border-[#e2ddd5] bg-[#fbfaf8] p-3">
      <div className="flex items-start gap-2">
        <Sparkles size={16} className="mt-0.5" />
        <div>
          <p className="text-[10px] font-bold tracking-[.14em] text-[#6e655c]">AI STYLIST · ACTIVE CATALOG ONLY</p>
          <p className="mt-1 text-[11px] leading-4 text-[#777]">Style, color, silhouette, season, material, and formality are evaluated across real in-stock products only.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {presets.data?.map((preset) => <button key={preset.key} onClick={() => { setStyleKey(preset.key as StylePresetKey); setAnchorProductId(null); setChosenLookId(null); }} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold ${styleKey === preset.key ? "bg-black text-white" : "border border-[#ded8cf] bg-white text-[#666]"}`}>{preset.name}</button>)}
      </div>
    </div>

    <div className="mt-3 rounded-xl border border-[#e1ddd6] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-[.12em]">STYLE THIS ITEM</p>
          <p className="mt-1 text-[10px] text-[#777]">Pin one item; it remains in all three recommendations.</p>
        </div>
        {anchorProductId && <button onClick={() => { setAnchorProductId(null); setChosenLookId(null); }} className="rounded-full bg-[#efeae2] px-2.5 py-1.5 text-[10px] font-semibold">Clear</button>}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {activeProducts.map((product) => <button key={product.id} onClick={() => { setAnchorProductId(product.id); setChosenLookId(null); }} className={`w-20 shrink-0 overflow-hidden rounded-lg border text-left ${anchorProductId === product.id ? "border-black ring-1 ring-black" : "border-[#dedbd4]"}`}>
          <img src={product.imageUrl} alt={localizedProductName(product, i18n.language)} className="aspect-square w-full object-cover" />
          <span className="line-clamp-2 block p-1 text-[9px] font-semibold">{localizedProductName(product, i18n.language)}</span>
        </button>)}
      </div>
    </div>

    <div className="mt-4 grid gap-3">
      {recommendations.isLoading && <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-[#d8d1c7]"><LoaderCircle className="animate-spin" size={20} /></div>}
      {(recommendations.data as StylistRecommendation[] | undefined)?.map((recommendation) => {
        const lookProducts = recommendation.productIds.map((id) => activeProducts.find((product) => product.id === id)).filter(Boolean) as StylistProduct[];
        return <article key={recommendation.lookId} className={`rounded-[1.2rem] border p-3 ${chosenLookId === recommendation.lookId ? "border-black ring-1 ring-black" : "border-[#dedbd4] bg-white"}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold tracking-[.14em]">{recommendation.lookId} · AI MATCH {recommendation.score}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#666]">{recommendation.reason}</p>
            </div>
            <button onClick={() => useRecommendation(recommendation)} className="shrink-0 rounded-full bg-black px-3 py-2 text-[10px] font-bold text-white">USE THIS LOOK</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {lookProducts.map((product) => <div key={product.id} className="w-16 shrink-0"><img src={product.imageUrl} alt={localizedProductName(product, i18n.language)} className="aspect-square w-full rounded-lg object-cover" /><p className="mt-1 line-clamp-2 text-[9px] font-semibold">{localizedProductName(product, i18n.language)}</p></div>)}
          </div>
          <p className="mt-3 text-[9px] leading-4 text-[#777]">Style {recommendation.scoreBreakdown.style} · Color {recommendation.scoreBreakdown.color} · Silhouette {recommendation.scoreBreakdown.silhouette} · Season {recommendation.scoreBreakdown.season} · Material {recommendation.scoreBreakdown.material} · Balance {recommendation.scoreBreakdown.formality}</p>
          <div className="mt-3 flex gap-2">
            <button disabled={feedback.isPending} onClick={() => submitFeedback(recommendation, "good")} className="rounded-full border border-[#d8d2c9] px-2.5 py-1.5 text-[10px] font-semibold disabled:opacity-50">👍 GOOD MATCH</button>
            <button disabled={feedback.isPending} onClick={() => submitFeedback(recommendation, "bad")} className="rounded-full border border-[#d8d2c9] px-2.5 py-1.5 text-[10px] font-semibold disabled:opacity-50">👎 BAD MATCH</button>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
