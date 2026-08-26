import AppHeader from "@/components/AppHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { trpc } from "@/lib/trpc";
import type { GarmentMeasurements, StretchLevel } from "@shared/fitEngine";
import { localizedProductName } from "@shared/productCommerce";
import { localizedCategoryName } from "@shared/productCategories";
import { categoryMeasurementFields } from "@shared/categoryMeasurementFields";
import {
  isSetProduct,
  localizedSetComponentCategory,
  representativeSetCategory,
  type SetComponentCategory,
  type SetProductComponent,
} from "@shared/setProducts";
import { ArrowLeft, Check, Plus, Ruler, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const CORE_CATEGORIES = ["top", "bottom", "outer", "dress", "shoes", "bag"] as const;
const MAX_SET_COMPONENTS = 6;

type CoreCategory = (typeof CORE_CATEGORIES)[number];
type ProductFitRow = {
  id: number;
  category: string;
  createdAt?: Date | string | null;
  newArrivalAt?: Date | string | null;
  productType?: "SINGLE" | "SET" | null;
  setComponents?: SetProductComponent[] | null;
  displayCategory?: { nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; baseCategory: "TOP" | "PANTS" | "JACKET" | "DRESS" | "SHOES" | "BAG"; measurementFields?: string[] | null } | null;
  garmentMeasurements?: GarmentMeasurements | null;
  stretchLevel?: StretchLevel | null;
};

const fallbackBaseCategory = (category: CoreCategory) =>
  ({ top: "TOP", bottom: "PANTS", outer: "JACKET", dress: "DRESS", shoes: "SHOES", bag: "BAG" } as const)[category];

const toCoreCategory = (category: string): CoreCategory =>
  CORE_CATEGORIES.includes(category as CoreCategory) ? (category as CoreCategory) : "top";

const normalizeComponents = (components: SetProductComponent[] | null | undefined) =>
  [...(components ?? [])]
    .sort((left, right) => left.sortOrder - right.sortOrder || left.componentId.localeCompare(right.componentId))
    .map((component, index) => ({
      ...component,
      sortOrder: index + 1,
      garmentMeasurements: component.garmentMeasurements ?? {},
      stretchLevel: component.stretchLevel ?? "low",
    } satisfies SetProductComponent));

const createComponent = (index: number, language: string): SetProductComponent => ({
  componentId: globalThis.crypto?.randomUUID?.() ?? `set-component-${Date.now()}-${index}`,
  sortOrder: index + 1,
  category: index === 0 ? "top" : index === 1 ? "bottom" : CORE_CATEGORIES[index % CORE_CATEGORIES.length],
  name: language === "ko" ? "새 구성품" : language === "zh" ? "新组成商品" : "New component",
  price: 1,
  garmentMeasurements: {},
  stretchLevel: "low",
});

const isCoreCategory = (value: string): value is CoreCategory => CORE_CATEGORIES.includes(value as CoreCategory);

const representativeCategory = (product: ProductFitRow) =>
  isSetProduct(product)
    ? representativeSetCategory(product.setComponents, toCoreCategory(product.category))
    : toCoreCategory(product.category);

const productListCategoryLabel = (product: ProductFitRow, language: string) =>
  isSetProduct(product)
    ? localizedSetComponentCategory(representativeCategory(product), language)
    : localizedCategoryName(product.displayCategory, language);

const singleMeasurementFields = (product: ProductFitRow) =>
  categoryMeasurementFields(
    isSetProduct(product)
      ? { baseCategory: fallbackBaseCategory(representativeCategory(product)) }
      : product.displayCategory ?? { baseCategory: fallbackBaseCategory(representativeCategory(product)) },
  );

export default function ProductFitManager() {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy =
    language === "ko"
      ? {
          back: "상품 관리로 돌아가기",
          eyebrow: "상품 핏 편집",
          title: "실제 의류 실측",
          body: "단품은 상품 전체 실측을, 세트는 각 구성품의 실측을 입력하세요. 이 값은 핏 엔진 추천에 사용됩니다.",
          loading: "상품 목록을 불러오는 중…",
          unknown: "비어 있는 값은 알 수 없음으로 유지됩니다.",
          stretch: "신축성",
          aid: "핏 상태는 시각적 참고용이며 실제 착용감 또는 구매 핏을 보장하지 않습니다.",
          save: "핏 데이터 저장",
          saving: "저장 중…",
          saved: "저장되었습니다.",
          all: "전체 상품",
          single: "단품",
          set: "세트",
          setPieces: "구성품",
          fields: { shoulderCm: "어깨", bustCm: "가슴", waistCm: "허리", hipCm: "힙", sleeveCm: "소매", totalLengthCm: "총장", riseCm: "밑위", thighCm: "허벅지", inseamCm: "인심" },
          stretchLabels: { none: "없음", low: "낮음", medium: "보통", high: "높음" },
        }
      : language === "zh"
        ? {
            back: "返回商品管理",
            eyebrow: "商品版型编辑",
            title: "实际服装尺寸",
            body: "单件商品填写整体尺寸，套装可分别填写每个组成商品的尺寸。这些数据用于版型推荐。",
            loading: "正在加载商品…",
            unknown: "留空字段将保持为未知。",
            stretch: "弹性等级",
            aid: "版型状态仅供视觉参考，不保证实际舒适度或购买合身度。",
            save: "保存版型数据",
            saving: "保存中…",
            saved: "已保存。",
            all: "全部商品",
            single: "单件",
            set: "套装",
            setPieces: "组成商品",
            fields: { shoulderCm: "肩宽", bustCm: "胸围", waistCm: "腰围", hipCm: "臀围", sleeveCm: "袖长", totalLengthCm: "衣长", riseCm: "前裆", thighCm: "大腿围", inseamCm: "内腿长" },
            stretchLabels: { none: "无", low: "低", medium: "中", high: "高" },
          }
        : {
            back: "Back to Product Manager",
            eyebrow: "PRODUCT FIT EDITOR",
            title: "Actual garment measurements",
            body: "Enter full measurements for a single item, or measurements for each component of a set. These values inform fit recommendations.",
            loading: "Loading catalog…",
            unknown: "Empty fields remain unknown.",
            stretch: "Stretch level",
            aid: "Fit status is a visualization aid, not a guarantee of comfort or actual purchase fit.",
            save: "Save fit data",
            saving: "Saving…",
            saved: "Saved.",
            all: "All products",
            single: "Single",
            set: "Set",
            setPieces: "components",
            fields: { shoulderCm: "Shoulder", bustCm: "Bust", waistCm: "Waist", hipCm: "Hip", sleeveCm: "Sleeve", totalLengthCm: "Total length", riseCm: "Rise", thighCm: "Thigh", inseamCm: "Inseam" },
            stretchLabels: { none: "None", low: "Low", medium: "Medium", high: "High" },
          };
  const setCopy =
    language === "ko"
      ? { heading: "세트 구성품 실측", component: "구성품", add: "구성품 추가", remove: "구성품 제거", category: "의류 종류", name: "구성품 이름", price: "구성품 가격", count: "구성품 수", limit: "최대 6개", addHint: "+ 버튼으로 구성품을 계속 추가할 수 있습니다.", minimum: "세트는 최소 2개 구성품이 필요합니다." }
      : language === "zh"
        ? { heading: "套装组成商品尺寸", component: "组成商品", add: "添加组成商品", remove: "删除组成商品", category: "服装类别", name: "组成商品名称", price: "组成商品价格", count: "组成商品数量", limit: "最多 6 个", addHint: "点击 + 按钮可继续添加组成商品。", minimum: "套装至少需要 2 个组成商品。" }
        : { heading: "Set component measurements", component: "Component", add: "Add component", remove: "Remove component", category: "Garment type", name: "Component name", price: "Component price", count: "Components", limit: "Up to 6", addHint: "Use + to keep adding components.", minimum: "A set needs at least 2 components." };

  const catalog = trpc.admin.products.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const [productFilter, setProductFilter] = useState<"all" | "single" | "set">("all");
  const filteredCatalog = useMemo(() => {
    return [...(catalog.data ?? [])]
      .filter((product: ProductFitRow) => productFilter === "all" || (productFilter === "set" ? isSetProduct(product) : !isSetProduct(product)))
      .sort((left: ProductFitRow, right: ProductFitRow) => {
        const leftTime = new Date(left.newArrivalAt ?? left.createdAt ?? 0).getTime();
        const rightTime = new Date(right.newArrivalAt ?? right.createdAt ?? 0).getTime();
        return rightTime - leftTime || right.id - left.id;
      });
  }, [catalog.data, productFilter]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(() => filteredCatalog.find((product) => product.id === selectedId) ?? filteredCatalog[0], [filteredCatalog, selectedId]);
  const [draft, setDraft] = useState<GarmentMeasurements>({});
  const [stretch, setStretch] = useState<StretchLevel>("low");
  const [componentDrafts, setComponentDrafts] = useState<SetProductComponent[]>([]);

  useEffect(() => {
    if (!selected) {
      setDraft({});
      setStretch("low");
      setComponentDrafts([]);
      return;
    }
    setDraft(selected.garmentMeasurements ?? {});
    setStretch(selected.stretchLevel ?? "low");
    setComponentDrafts(isSetProduct(selected) ? normalizeComponents(selected.setComponents) : []);
  }, [selected?.id]);

  const selectProduct = (product: ProductFitRow) => {
    setSelectedId(product.id);
    setDraft(product.garmentMeasurements ?? {});
    setStretch(product.stretchLevel ?? "low");
    setComponentDrafts(isSetProduct(product) ? normalizeComponents(product.setComponents) : []);
  };

  const addComponent = () => {
    setComponentDrafts((current) => current.length >= MAX_SET_COMPONENTS ? current : [...current, createComponent(current.length, language)]);
  };

  const updateComponent = (index: number, updates: Partial<SetProductComponent>) => {
    setComponentDrafts((current) => current.map((component, componentIndex) => componentIndex === index ? { ...component, ...updates } : component));
  };

  const removeComponent = (index: number) => {
    setComponentDrafts((current) => current.length <= 2 ? current : current.filter((_, componentIndex) => componentIndex !== index).map((component, componentIndex) => ({ ...component, sortOrder: componentIndex + 1 })));
  };

  const save = async () => {
    if (!selected) return;
    if (isSetProduct(selected)) {
      if (componentDrafts.length < 2) return;
      await update.mutateAsync({
        id: selected.id,
        productType: "SET",
        setComponents: componentDrafts.map((component, index) => ({ ...component, sortOrder: index + 1, price: Math.max(1, Math.round(component.price)), name: component.name.trim() || `${setCopy.component} ${index + 1}` })),
      });
    } else {
      await update.mutateAsync({ id: selected.id, garmentMeasurements: draft, stretchLevel: stretch });
    }
  };

  const fieldsFor = (category: CoreCategory) => categoryMeasurementFields({ baseCategory: fallbackBaseCategory(category) });
  const renderFields = (measurements: GarmentMeasurements, category: CoreCategory, onChange: (key: keyof GarmentMeasurements, value: number | null) => void) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fieldsFor(category).map((key) => (
        <label key={key} className="text-xs font-semibold text-[#666]">
          {copy.fields[key]} (cm)
          <input
            type="number"
            min="0"
            value={measurements[key] ?? ""}
            onChange={(event) => onChange(key, event.target.value ? Number(event.target.value) : null)}
            className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] px-3 text-sm text-black"
            placeholder="—"
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#f8f7f4] text-[#171717]">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-7 sm:px-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d554c]"><ArrowLeft size={14} /> {copy.back}</Link>
        <p className="mt-5 text-[10px] font-bold tracking-[.18em] text-[#777]">{copy.eyebrow}</p>
        <h1 className="mt-1 font-serif text-4xl">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666]">{copy.body}</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <section aria-label={copy.title} className="max-h-[13.75rem] overflow-y-auto overscroll-contain rounded-2xl border border-[#dedbd4] bg-white p-3">
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[#f5f1eb] p-1">
              {(["all", "single", "set"] as const).map((filter) => (
                <button key={filter} type="button" onClick={() => setProductFilter(filter)} className={`rounded-lg px-2 py-2 text-[10px] font-semibold ${productFilter === filter ? "bg-black text-white" : "text-[#655c53]"}`}>
                  {copy[filter]}
                </button>
              ))}
            </div>
            {catalog.isLoading ? <p className="p-4 text-sm text-[#777]">{copy.loading}</p> : filteredCatalog.length ? filteredCatalog.map((product) => {
              const set = isSetProduct(product);
              const category = representativeCategory(product);
              return (
                <button key={product.id} type="button" onClick={() => selectProduct(product)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left ${selected?.id === product.id ? "bg-black text-white" : "hover:bg-[#f5f1eb]"}`}>
                  <img src={product.imageUrl} alt="" loading="lazy" decoding="async" className="size-12 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <b className="block truncate text-xs">{localizedProductName(product, i18n.language)}</b>
                    <small className="mt-1 block text-[10px] opacity-70">{set ? `${productListCategoryLabel(product, i18n.language)} · ${product.setComponents?.length ?? 0} ${copy.setPieces}` : productListCategoryLabel(product, i18n.language)} · {copy.stretchLabels[(product.stretchLevel ?? "low") as StretchLevel]}</small>
                  </span>
                </button>
              );
            }) : <p className="p-4 text-sm text-[#777]">{copy.unknown}</p>}
          </section>

          {selected && isSetProduct(selected) ? (
            <section className="rounded-2xl border border-[#dedbd4] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#eee9e1]"><Ruler size={18} /></span><div><p className="text-[10px] font-bold tracking-[.16em] text-[#777]">{setCopy.heading}</p><h2 className="mt-1 font-serif text-2xl">{localizedProductName(selected, i18n.language)}</h2><p className="mt-1 text-xs font-semibold text-[#665d54]">{productListCategoryLabel(selected, i18n.language)}</p></div></div>
                <span className="rounded-full bg-[#f5f1eb] px-3 py-1 text-[10px] font-semibold text-[#665d54]">{setCopy.count} {componentDrafts.length}/{MAX_SET_COMPONENTS}</span>
              </div>
              <div className="mt-5 space-y-4">
                {componentDrafts.map((component, index) => {
                  const category = isCoreCategory(component.category) ? component.category : "top";
                  const measurements = component.garmentMeasurements ?? {};
                  return (
                    <article key={component.componentId} className="rounded-2xl border border-[#e3ded6] bg-[#fcfbf9] p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{setCopy.component} {index + 1}</h3><button type="button" onClick={() => removeComponent(index)} disabled={componentDrafts.length <= 2} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7b6f64] disabled:opacity-35"><Trash2 size={13} />{setCopy.remove}</button></div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <label className="text-xs font-semibold text-[#666]">{setCopy.category}<select value={category} onChange={(event) => updateComponent(index, { category: event.target.value as SetComponentCategory })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3 text-sm text-black">{CORE_CATEGORIES.map((option) => <option key={option} value={option}>{localizedSetComponentCategory(option, i18n.language)}</option>)}</select></label>
                        <label className="text-xs font-semibold text-[#666] sm:col-span-2">{setCopy.name}<input value={component.name} onChange={(event) => updateComponent(index, { name: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3 text-sm text-black" /></label>
                        <label className="text-xs font-semibold text-[#666]">{setCopy.price}<input type="number" min="1" value={component.price} onChange={(event) => updateComponent(index, { price: Number(event.target.value) || 1 })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3 text-sm text-black" /></label>
                      </div>
                      <div className="mt-4">{renderFields(measurements, category, (key, value) => updateComponent(index, { garmentMeasurements: { ...measurements, [key]: value } }))}</div>
                      <p className="mt-4 text-xs font-semibold text-[#666]">{copy.stretch}</p>
                      <div className="mt-2 grid grid-cols-4 gap-2">{(["none", "low", "medium", "high"] as StretchLevel[]).map((level) => <button key={level} type="button" onClick={() => updateComponent(index, { stretchLevel: level })} className={`rounded-xl py-2 text-[11px] font-semibold ${component.stretchLevel === level ? "bg-black text-white" : "border border-[#dedbd4]"}`}>{copy.stretchLabels[level]}</button>)}</div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#f5f1eb] p-3"><p className="text-xs leading-5 text-[#665d54]">{setCopy.addHint} {setCopy.limit}</p><button type="button" onClick={addComponent} disabled={componentDrafts.length >= MAX_SET_COMPONENTS} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-40"><Plus size={14} />{setCopy.add}</button></div>
              <p className="mt-4 text-xs leading-5 text-[#665d54]">{copy.aid}</p>
              <button type="button" onClick={save} disabled={update.isPending || componentDrafts.length < 2} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white disabled:opacity-50">{update.isPending ? copy.saving : <><Save size={16} />{copy.save}</>}</button>
              {update.isSuccess && <p className="mt-3 flex items-center gap-1 text-xs text-emerald-700"><Check size={14} />{copy.saved}</p>}
            </section>
          ) : selected ? (
            <section className="rounded-2xl border border-[#dedbd4] bg-white p-5">
              <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#eee9e1]"><Ruler size={18} /></span><div><p className="text-[10px] font-bold tracking-[.16em] text-[#777]">{copy.title}</p><h2 className="mt-1 font-serif text-2xl">{localizedProductName(selected, i18n.language)}</h2><p className="mt-1 text-xs font-semibold text-[#665d54]">{productListCategoryLabel(selected, i18n.language)}</p><p className="mt-1 text-xs text-[#777]">{copy.unknown}</p></div></div>
              <div className="mt-5">{renderFields(draft, representativeCategory(selected), (key, value) => setDraft((current) => ({ ...current, [key]: value })))}</div>
              <p className="mt-5 text-xs font-semibold text-[#666]">{copy.stretch}</p>
              <div className="mt-2 grid grid-cols-4 gap-2">{(["none", "low", "medium", "high"] as StretchLevel[]).map((level) => <button key={level} type="button" onClick={() => setStretch(level)} className={`rounded-xl py-2 text-[11px] font-semibold ${stretch === level ? "bg-black text-white" : "border border-[#dedbd4]"}`}>{copy.stretchLabels[level]}</button>)}</div>
              <p className="mt-4 rounded-xl bg-[#f5f1eb] p-3 text-xs leading-5 text-[#665d54]">{copy.aid}</p>
              <button type="button" onClick={save} disabled={update.isPending} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white disabled:opacity-50">{update.isPending ? copy.saving : <><Save size={16} />{copy.save}</>}</button>
              {update.isSuccess && <p className="mt-3 flex items-center gap-1 text-xs text-emerald-700"><Check size={14} />{copy.saved}</p>}
            </section>
          ) : null}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
