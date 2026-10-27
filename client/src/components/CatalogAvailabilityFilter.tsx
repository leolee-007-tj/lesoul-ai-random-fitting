import React from "react";
import type { CatalogAvailabilityView } from "@shared/productAvailability";
export default function CatalogAvailabilityFilter({ value, onChange, locale }: { value: CatalogAvailabilityView; onChange: (value: CatalogAvailabilityView) => void; locale: "ko" | "zh" | "en" }) {
  const labels = { ko: { label: "상품 재고별 보기", available: "판매 상품", sold_out: "품절 상품만 보기" }, zh: { label: "按库存浏览", available: "在售商品", sold_out: "仅看售罄商品" }, en: { label: "Browse by availability", available: "Available products", sold_out: "Sold-out products only" } }[locale];
  return <div role="group" aria-label={labels.label} className="mt-4 flex gap-2">{(["available", "sold_out"] as const).map(view => <button key={view} type="button" aria-pressed={value === view} onClick={() => onChange(view)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${value === view ? "bg-[#2b2520] text-white" : "bg-white text-[#635b52]"}`}>{labels[view]}</button>)}</div>;
}
