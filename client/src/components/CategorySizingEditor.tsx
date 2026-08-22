import type { GarmentMeasurements, GarmentSizeOption } from "@shared/fitEngine";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type Category = "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";

type Props = {
  category: Category;
  price: number | "";
  priceError?: string;
  measurements: GarmentMeasurements;
  sizeOptions: GarmentSizeOption[];
  onCategoryChange: (category: Category) => void;
  onPriceChange: (price: number | "") => void;
  onMeasurementsChange: (measurements: GarmentMeasurements) => void;
  onSizeOptionsChange: (options: GarmentSizeOption[]) => void;
  showCategorySelector?: boolean;
  showMeasurements?: boolean;
  priceReadOnly?: boolean;
  priceLabel?: string;
  priceHelp?: string;
};

type MeasurementKey = keyof GarmentMeasurements;

const fieldsByCategory: Record<Category, MeasurementKey[]> = {
  top: ["shoulderCm", "bustCm", "sleeveCm", "totalLengthCm"],
  bottom: ["waistCm", "hipCm", "riseCm", "thighCm", "inseamCm", "totalLengthCm"],
  outer: ["shoulderCm", "bustCm", "sleeveCm", "totalLengthCm"],
  dress: ["shoulderCm", "bustCm", "waistCm", "hipCm", "sleeveCm", "totalLengthCm"],
  shoes: ["totalLengthCm"],
  bag: ["totalLengthCm"],
};

const defaultSizes: Record<Category, string[]> = {
  top: ["F", "S", "M", "L"], bottom: ["F", "S", "M", "L"], outer: ["F", "S", "M", "L"], dress: ["F", "S", "M", "L"], shoes: ["F", "35", "36", "37", "38"], bag: ["F", "ONE SIZE"],
};

export default function CategorySizingEditor({ category, price, priceError, measurements, sizeOptions, onCategoryChange, onPriceChange, onMeasurementsChange, onSizeOptionsChange, showCategorySelector = true, showMeasurements = true, priceReadOnly = false, priceLabel, priceHelp }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { category: "GARMENT CATEGORY", price: "PRICE (CNY)", priceHelp: "Enter the whole CNY amount when you are ready to save.", measurements: "REAL GARMENT MEASUREMENTS", sizes: "AVAILABLE SIZES", add: "Add size", free: "Add F (Free Size)", none: "No sizes added yet", unit: "cm", shoeLength: "Inner length", bagLength: "Bag height / length", fields: { shoulderCm: "Shoulder", bustCm: "Bust", waistCm: "Waist", hipCm: "Hip", sleeveCm: "Sleeve", totalLengthCm: "Total length", riseCm: "Rise", thighCm: "Thigh", inseamCm: "Inseam" } },
    ko: { category: "의류 종류", price: "가격 (CNY)", priceHelp: "저장할 때 원하는 정수 CNY 가격을 입력하세요.", measurements: "실제 의류 실측", sizes: "판매 사이즈", add: "사이즈 추가", free: "F (Free Size) 추가", none: "아직 등록한 사이즈가 없습니다", unit: "cm", shoeLength: "내부 길이", bagLength: "가방 높이 / 길이", fields: { shoulderCm: "어깨", bustCm: "가슴", waistCm: "허리", hipCm: "힙", sleeveCm: "소매", totalLengthCm: "총장", riseCm: "밑위", thighCm: "허벅지", inseamCm: "인심" } },
    zh: { category: "服装类别", price: "价格 (CNY)", priceHelp: "保存时请输入整数 CNY 价格。", measurements: "实际服装尺寸", sizes: "可售尺码", add: "添加尺码", free: "添加 F（均码）", none: "尚未添加尺码", unit: "cm", shoeLength: "内长", bagLength: "包高 / 包长", fields: { shoulderCm: "肩宽", bustCm: "胸围", waistCm: "腰围", hipCm: "臀围", sleeveCm: "袖长", totalLengthCm: "衣长", riseCm: "前裆", thighCm: "大腿围", inseamCm: "内腿长" } },
  }[locale];
  const categoryName = (value: Category) => ({ en: { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" }, ko: { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" }, zh: { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } }[locale][value]);
  const changeCategory = (next: Category) => {
    onCategoryChange(next);
    if (!sizeOptions.length) onSizeOptionsChange(defaultSizes[next].map((label) => ({ label, available: true })));
  };
  const fieldLabel = (key: MeasurementKey) => key === "totalLengthCm" && category === "shoes" ? copy.shoeLength : key === "totalLengthCm" && category === "bag" ? copy.bagLength : copy.fields[key];
  return <section className="mt-5 rounded-2xl border border-[#dedbd4] bg-[#fbfaf8] p-4">
    <div className={`grid gap-3 ${showCategorySelector ? "sm:grid-cols-2" : ""}`}>
      {showCategorySelector && <label><span className="text-xs font-semibold text-[#666]">{copy.category}</span><select value={category} onChange={(event) => changeCategory(event.target.value as Category)} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3 text-sm">{(["top", "bottom", "outer", "dress", "shoes", "bag"] as Category[]).map((item) => <option key={item} value={item}>{categoryName(item)}</option>)}</select></label>}
      <label><span className="text-xs font-semibold text-[#666]">{priceLabel ?? copy.price}</span><input type="number" min="0" step="1" value={price} onChange={(event) => onPriceChange(event.target.value === "" ? "" : Math.max(0, Number(event.target.value)))} readOnly={priceReadOnly} className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm ${priceReadOnly ? "cursor-not-allowed bg-[#f1ede7] text-[#665d54]" : ""} ${priceError ? "border-red-400" : "border-[#dedbd4]"}`} aria-invalid={Boolean(priceError)} /><span className="mt-1 block text-[10px] leading-4 text-[#777]">{priceError || priceHelp || copy.priceHelp}</span></label>
    </div>
    {showMeasurements && <div className="mt-4 border-t border-[#e4dfd7] pt-4"><p className="text-xs font-semibold">{copy.measurements}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{fieldsByCategory[category].map((key) => <label key={key}><span className="text-[10px] font-semibold text-[#666]">{fieldLabel(key)} ({copy.unit})</span><input type="number" min="0" value={measurements[key] ?? ""} onChange={(event) => onMeasurementsChange({ ...measurements, [key]: event.target.value === "" ? undefined : Math.max(0, Number(event.target.value)) })} className="mt-1 h-10 w-full rounded-lg border border-[#dedbd4] bg-white px-3 text-sm" /></label>)}</div></div>}
    <div className="mt-4 border-t border-[#e4dfd7] pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold">{copy.sizes}</p><div className="flex gap-2"><button type="button" disabled={sizeOptions.some((option) => option.label.trim().toUpperCase() === "F")} onClick={() => onSizeOptionsChange([...sizeOptions, { label: "F", available: true }])} className="rounded-full border border-[#171717] bg-[#171717] px-3 py-1.5 text-[10px] font-semibold text-white disabled:cursor-default disabled:opacity-40">{copy.free}</button><button type="button" onClick={() => onSizeOptionsChange([...sizeOptions, { label: "", available: true }])} className="inline-flex items-center gap-1 rounded-full border border-[#d6d0c7] bg-white px-3 py-1.5 text-[10px] font-semibold"><Plus size={12} aria-hidden="true" />{copy.add}</button></div></div>{sizeOptions.length ? <div className="mt-3 grid gap-2 sm:grid-cols-3">{sizeOptions.map((option, index) => <div key={`${option.label}-${index}`} className="flex items-center gap-2"><input value={option.label} placeholder="F / S / M / L" onChange={(event) => onSizeOptionsChange(sizeOptions.map((current, currentIndex) => currentIndex === index ? { ...current, label: event.target.value } : current))} className="h-10 min-w-0 flex-1 rounded-lg border border-[#dedbd4] bg-white px-3 text-sm" /><button type="button" aria-label={`${copy.sizes} ${index + 1} remove`} onClick={() => onSizeOptionsChange(sizeOptions.filter((_, currentIndex) => currentIndex !== index))} className="grid size-9 place-items-center rounded-lg border border-[#dedbd4] bg-white"><X size={13} aria-hidden="true" /></button></div>)}</div> : <p className="mt-2 text-[11px] text-[#777]">{copy.none}</p>}</div>
  </section>;
}
