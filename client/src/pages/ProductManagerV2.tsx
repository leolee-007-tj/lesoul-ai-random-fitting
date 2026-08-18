import { useAuth } from "@/_core/hooks/useAuth";
import CategorySizingEditor from "@/components/CategorySizingEditor";
import AppHeader from "@/components/AppHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import type { ProductImageViews } from "@shared/bodyMeasurements";
import type { GarmentMeasurements, GarmentSizeOption, StretchLevel } from "@shared/fitEngine";
import { localizedProductName } from "@shared/productCommerce";
import { CheckCircle2, ImagePlus, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Category = "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
type SourceLanguage = "en" | "ko" | "zh";
type FieldKey = "name" | "price";
type ProductDraft = {
  name: string;
  category: Category;
  price: number | "";
  season: string;
  color: string;
  style: string;
  description: string;
  status: "in_stock" | "sold_out";
  frontUrl: string;
  backUrl: string;
  detailUrls: string[];
  qrUrl: string;
  garmentMeasurements: GarmentMeasurements;
  sizeOptions: GarmentSizeOption[];
  stretchLevel: StretchLevel;
};

const placeholder = "/manus-storage/editorial-cafe_f970ce23.jpg";
const asset = (url: string) => ({ original: url, studioCut: url, thumbnail: url });
const initialDraft = (): ProductDraft => ({ name: "", category: "top", price: "", season: "", color: "", style: "", description: "", status: "in_stock", frontUrl: placeholder, backUrl: "", detailUrls: [], qrUrl: "", garmentMeasurements: {}, sizeOptions: [], stretchLevel: "low" });

const copyByLocale = {
  en: { eyebrow: "LESOUL CATALOG", title: "Products", intro: "Choose the category first. Only product name and CNY price are required; other details are optional.", add: "Add product", edit: "Edit", category: "Category", status: "Status", active: "In stock", sold: "Sold out", name: "Product name", nameRequired: "Enter a product name with at least 2 characters.", priceRequired: "Enter a CNY price.", season: "Season (optional)", color: "Color (optional)", style: "Style (optional)", description: "Description (optional)", sourceLanguage: "Writing language", stretch: "Stretch", none: "None", low: "Low", medium: "Medium", high: "High", images: "Product images", front: "Front", back: "Back", details: "Important details", qr: "Payment QR", upload: "Upload", replace: "Replace", remove: "Remove", cancel: "Cancel", save: "Save product", saving: "Saving…", saved: "Product saved.", saveFail: "Unable to save the product. Check the marked item and try again.", translationFail: "Translation could not be completed. Check the source name and description, then try again.", noProducts: "No products yet. Add your first LESOUL item.", categoryNames: { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" } },
  ko: { eyebrow: "LESOUL 카탈로그", title: "상품", intro: "먼저 의류 종류를 고르세요. 상품명과 CNY 가격만 필수이며 나머지 정보는 선택 사항입니다.", add: "상품 추가", edit: "수정", category: "종류", status: "상태", active: "판매 중", sold: "품절", name: "상품명", nameRequired: "두 글자 이상 상품명을 입력하세요.", priceRequired: "CNY 가격을 입력하세요.", season: "시즌 (선택)", color: "색상 (선택)", style: "스타일 (선택)", description: "설명 (선택)", sourceLanguage: "작성 언어", stretch: "신축성", none: "없음", low: "낮음", medium: "보통", high: "높음", images: "상품 이미지", front: "앞면", back: "뒷면", details: "중요 디테일", qr: "결제 QR", upload: "업로드", replace: "교체", remove: "삭제", cancel: "취소", save: "상품 저장", saving: "저장 중…", saved: "상품을 저장했습니다.", saveFail: "상품을 저장하지 못했습니다. 표시된 항목을 확인한 뒤 다시 시도하세요.", translationFail: "자동 번역을 완료하지 못했습니다. 상품명과 설명을 확인한 뒤 다시 시도하세요.", noProducts: "아직 상품이 없습니다. 첫 LESOUL 상품을 추가하세요.", categoryNames: { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" } },
  zh: { eyebrow: "LESOUL 商品目录", title: "商品", intro: "请先选择服装类别。仅商品名称和 CNY 价格必填，其他内容均可选填。", add: "添加商品", edit: "编辑", category: "类别", status: "状态", active: "在售", sold: "售罄", name: "商品名称", nameRequired: "请输入至少两个字符的商品名称。", priceRequired: "请输入 CNY 价格。", season: "季节（可选）", color: "颜色（可选）", style: "风格（可选）", description: "商品说明（可选）", sourceLanguage: "填写语言", stretch: "弹性", none: "无", low: "低", medium: "中", high: "高", images: "商品图片", front: "正面", back: "背面", details: "重要细节", qr: "支付二维码", upload: "上传", replace: "替换", remove: "删除", cancel: "取消", save: "保存商品", saving: "保存中…", saved: "商品已保存。", saveFail: "无法保存商品。请检查标记内容后重试。", translationFail: "无法完成自动翻译。请检查商品名称和说明后重试。", noProducts: "还没有商品。请添加第一件 LESOUL 商品。", categoryNames: { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" } },
} as const;

export default function ProductManagerV2() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = copyByLocale[locale];
  const auth = useAuth();
  const catalog = trpc.admin.products.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.admin.createProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const translate = trpc.admin.translateProduct.useMutation();
  const upload = trpc.uploads.productImage.useMutation();
  const [draft, setDraft] = useState<ProductDraft | null>(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1" ? initialDraft() : null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<SourceLanguage>(locale);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);
  const change = (updates: Partial<ProductDraft>) => setDraft((current) => current ? { ...current, ...updates } : current);

  const openNew = () => { setEditingId(null); setSourceLanguage(locale); setFieldErrors({}); setError(""); setSuccess(""); setDraft(initialDraft()); };
  const openEdit = (item: any) => {
    const views = item.imageViews ?? {};
    setEditingId(item.id); setSourceLanguage(locale); setFieldErrors({}); setError(""); setSuccess("");
    setDraft({ name: item.name ?? "", category: item.category, price: Number(item.price ?? 0), season: item.season ?? "", color: item.color ?? "", style: item.style ?? "", description: item.description ?? "", status: item.status, frontUrl: views.front?.original ?? item.imageUrl ?? placeholder, backUrl: views.back?.original ?? "", detailUrls: (views.detail ?? []).map((entry: any) => entry.original).filter(Boolean), qrUrl: item.purchaseQrUrl ?? "", garmentMeasurements: item.garmentMeasurements ?? {}, sizeOptions: item.sizeOptions ?? [], stretchLevel: item.stretchLevel ?? "low" });
  };
  const uploadSlot = async (kind: "front" | "back" | "detail" | "qr", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file || !draft) return;
    setError("");
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) { setError(copy.saveFail); return; }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await upload.mutateAsync({ dataUrl, category: draft.category, view: kind === "qr" ? "detail" : kind, variant: "original", productKey: `${draft.category}-${draft.name || "new"}-${kind}-${Date.now()}` });
      if (kind === "front") change({ frontUrl: result.url });
      if (kind === "back") change({ backUrl: result.url });
      if (kind === "detail") change({ detailUrls: [...draft.detailUrls, result.url].slice(0, 4) });
      if (kind === "qr") change({ qrUrl: result.url });
    } catch { setError(copy.saveFail); } finally { event.target.value = ""; }
  };
  const save = async () => {
    if (!draft) return;
    setError(""); setSuccess("");
    const price = draft.price;
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (draft.name.trim().length < 2) nextErrors.name = copy.nameRequired;
    if (price === "" || !Number.isFinite(price) || price < 0) nextErrors.price = copy.priceRequired;
    if (Object.keys(nextErrors).length) { setFieldErrors(nextErrors); return; }
    const confirmedPrice = price as number;
    setFieldErrors({});
    const description = draft.description.trim() || draft.name.trim();
    try {
      const localized = await translate.mutateAsync({ sourceLanguage, name: draft.name.trim(), description });
      const imageViews: ProductImageViews = { front: asset(draft.frontUrl), ...(draft.backUrl ? { back: asset(draft.backUrl) } : {}), ...(draft.detailUrls.length ? { detail: draft.detailUrls.map(asset) } : {}) };
      const payload = { name: draft.name.trim(), ...localized, category: draft.category, season: draft.season.trim() || "all_season", color: draft.color.trim() || "unspecified", style: draft.style.trim() || "minimal", status: draft.status, price: Math.round(confirmedPrice), imageUrl: draft.frontUrl, images: [draft.frontUrl, ...[draft.backUrl, ...draft.detailUrls].filter(Boolean)], imageViews, description, purchaseQrUrl: draft.qrUrl || null, garmentMeasurements: draft.garmentMeasurements, sizeOptions: draft.sizeOptions.filter((option) => option.label.trim()), stretchLevel: draft.stretchLevel, stylistMetadata: { mainColor: draft.color.trim() || "unspecified", formality: 3, fashionMood: [] as string[], recommendedStyles: ["minimal"] as ("minimal")[], compatibleColors: [] as string[], source: "manual" as const } };
      if (editingId) await update.mutateAsync({ id: editingId, ...payload }); else await create.mutateAsync(payload);
      setSuccess(copy.saved); setDraft(null); setEditingId(null);
    } catch (caught) { setError(caught instanceof Error && caught.message ? caught.message : copy.translationFail); }
  };

  if (!auth.loading && !auth.isAuthenticated) return <div className="min-h-screen bg-[#f8f7f4]"><AppHeader /><main className="mx-auto grid min-h-[70dvh] max-w-xl place-items-center px-5 text-center"><section><p className="text-xs font-bold tracking-[.16em] text-[#777]">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-4xl">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#666]">{locale === "ko" ? "상품을 관리하려면 로그인하세요." : locale === "zh" ? "请登录后管理商品。" : "Sign in to manage products."}</p><button onClick={startLogin} className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">{locale === "ko" ? "로그인" : locale === "zh" ? "登录" : "Sign in"}</button></section></main></div>;

  const slots = draft ? [
    { key: "front", label: copy.front, url: draft.frontUrl, trigger: () => frontRef.current?.click(), remove: undefined },
    { key: "back", label: copy.back, url: draft.backUrl, trigger: () => backRef.current?.click(), remove: () => change({ backUrl: "" }) },
    { key: "detail", label: copy.details, url: draft.detailUrls[0] ?? "", trigger: () => detailRef.current?.click(), remove: () => change({ detailUrls: [] }) },
    { key: "qr", label: copy.qr, url: draft.qrUrl, trigger: () => qrRef.current?.click(), remove: () => change({ qrUrl: "" }) },
  ] : [];
  const isSaving = create.isPending || update.isPending || translate.isPending || upload.isPending;

  return <div className="lesoul-app-wrapper min-h-[100dvh] bg-[#f8f7f4] text-[#171717]"><AppHeader /><main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
    <p className="text-xs font-bold tracking-[.2em] text-[#777]">{copy.eyebrow}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-serif text-4xl sm:text-5xl">{copy.title}</h1><p className="mt-2 max-w-xl text-sm text-[#666]">{copy.intro}</p></div><button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-semibold text-white"><Plus size={15} aria-hidden="true" />{copy.add}</button></div>
    {success && <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={16} aria-hidden="true" />{success}</p>}
    {catalog.isLoading ? <div className="grid min-h-56 place-items-center"><LoaderCircle className="animate-spin" /></div> : catalog.data?.length ? <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{catalog.data.map((item: any) => <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dedbd4] bg-white"><img src={item.imageViews?.front?.original ?? item.imageUrl} alt={localizedProductName(item, i18n.language)} className="aspect-[5/4] w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{localizedProductName(item, i18n.language)}</p><p className="mt-1 text-[11px] text-[#777]">{copy.categoryNames[item.category as Category]} · {item.status === "in_stock" ? copy.active : copy.sold}</p><p className="mt-2 text-sm font-semibold">¥ {Number(item.price).toLocaleString()}</p></div><button onClick={() => openEdit(item)} aria-label={copy.edit} className="grid size-9 place-items-center rounded-full bg-[#eeeae3]"><Pencil size={14} aria-hidden="true" /></button></div></div></article>)}</section> : <p className="mt-10 text-center text-sm text-[#777]">{copy.noProducts}</p>}
    {draft && <div className="lesoul-safe-modal z-40 overflow-y-auto"><section className="mx-auto my-4 max-w-3xl rounded-[1.7rem] bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#777]">{copy.eyebrow}</p><h2 className="mt-1 font-serif text-3xl">{editingId ? copy.edit : copy.add}</h2></div><button onClick={() => setDraft(null)} aria-label={copy.cancel} className="grid size-9 place-items-center rounded-full border border-[#dedbd4]"><X size={16} aria-hidden="true" /></button></div>
      <CategorySizingEditor category={draft.category} price={draft.price} priceError={fieldErrors.price} measurements={draft.garmentMeasurements} sizeOptions={draft.sizeOptions} onCategoryChange={(category) => change({ category })} onPriceChange={(price) => { change({ price }); setFieldErrors((current) => ({ ...current, price: undefined })); }} onMeasurementsChange={(garmentMeasurements) => change({ garmentMeasurements })} onSizeOptionsChange={(sizeOptions) => change({ sizeOptions })} />
      <section className="mt-5 grid gap-3 sm:grid-cols-2"><label><span className="text-xs font-semibold text-[#666]">{copy.sourceLanguage}</span><select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as SourceLanguage)} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3"><option value="en">English</option><option value="ko">한국어</option><option value="zh">中文</option></select></label><label><span className="text-xs font-semibold text-[#666]">{copy.name}</span><input value={draft.name} onChange={(event) => { change({ name: event.target.value }); setFieldErrors((current) => ({ ...current, name: undefined })); }} className={`mt-1 h-11 w-full rounded-xl border px-3 ${fieldErrors.name ? "border-red-400" : "border-[#dedbd4]"}`} aria-invalid={Boolean(fieldErrors.name)} />{fieldErrors.name && <span className="mt-1 block text-[10px] text-red-700">{fieldErrors.name}</span>}</label><label><span className="text-xs font-semibold text-[#666]">{copy.status}</span><select value={draft.status} onChange={(event) => change({ status: event.target.value as ProductDraft["status"] })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3"><option value="in_stock">{copy.active}</option><option value="sold_out">{copy.sold}</option></select></label><label><span className="text-xs font-semibold text-[#666]">{copy.season}</span><input value={draft.season} onChange={(event) => change({ season: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] px-3" /></label><label><span className="text-xs font-semibold text-[#666]">{copy.color}</span><input value={draft.color} onChange={(event) => change({ color: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] px-3" /></label><label><span className="text-xs font-semibold text-[#666]">{copy.style}</span><input value={draft.style} onChange={(event) => change({ style: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] px-3" /></label><label><span className="text-xs font-semibold text-[#666]">{copy.stretch}</span><select value={draft.stretchLevel} onChange={(event) => change({ stretchLevel: event.target.value as StretchLevel })} className="mt-1 h-11 w-full rounded-xl border border-[#dedbd4] bg-white px-3"><option value="none">{copy.none}</option><option value="low">{copy.low}</option><option value="medium">{copy.medium}</option><option value="high">{copy.high}</option></select></label><label className="sm:col-span-2"><span className="text-xs font-semibold text-[#666]">{copy.description}</span><textarea value={draft.description} onChange={(event) => change({ description: event.target.value })} className="mt-1 min-h-24 w-full rounded-xl border border-[#dedbd4] px-3 py-2" /></label></section>
      <section className="mt-5 rounded-2xl border border-[#dedbd4] bg-[#fbfaf8] p-4"><p className="text-xs font-semibold">{copy.images}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{slots.map((slot) => <div key={slot.key} className="rounded-xl border border-[#e2ddd5] bg-white p-2"><div className="aspect-square overflow-hidden rounded-lg bg-[#eeeae3]">{slot.url ? <img src={slot.url} alt={slot.label} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[10px] text-[#777]">{slot.label}</div>}</div><button type="button" disabled={upload.isPending} onClick={slot.trigger} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-[#dedbd4] py-2 text-[10px] font-semibold"><ImagePlus size={12} aria-hidden="true" />{slot.url ? copy.replace : copy.upload}</button>{slot.remove && slot.url && <button type="button" onClick={slot.remove} className="mt-1 w-full text-[10px] text-[#8d4e42]">{copy.remove}</button>}</div>)}</div><input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadSlot("front", event)} /><input ref={backRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadSlot("back", event)} /><input ref={detailRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadSlot("detail", event)} /><input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadSlot("qr", event)} /></section>
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 flex gap-2"><button onClick={() => setDraft(null)} className="h-12 flex-1 rounded-xl border border-[#d8d2c9] bg-white text-sm font-semibold">{copy.cancel}</button><button onClick={save} disabled={isSaving} className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white disabled:opacity-50">{isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} aria-hidden="true" />}{isSaving ? copy.saving : copy.save}</button></div></section></div>}
  </main><MobileBottomNav /></div>;
}
