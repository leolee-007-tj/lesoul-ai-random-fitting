import { ChevronDown, Languages, LoaderCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Locale = "en" | "ko" | "zh";
type ManagedCategory = { id: number; nameEn: string; nameKo: string; nameZh: string; baseCategory: "TOP" | "PANTS" | "JACKET" | "DRESS" | "SHOES" | "BAG"; isActive: number; sortOrder: number; usageCount: number };
type Draft = Omit<ManagedCategory, "id" | "usageCount">;
const emptyDraft = (): Draft => ({ nameEn: "", nameKo: "", nameZh: "", baseCategory: "TOP", isActive: 1, sortOrder: 100 });

export default function CategoryManagementPanel({ locale, categories, open, onOpenChange, onCreated }: { locale: Locale; categories: ManagedCategory[]; open: boolean; onOpenChange: (next: boolean) => void; onCreated?: (category: ManagedCategory) => void }) {
  const copy = locale === "ko"
    ? { title: "상품 종류 관리", add: "상품 종류 추가", korean: "상품 종류 이름", auto: "한국어·중국어·영어 중 어느 언어로 입력해도 나머지 언어가 자동 저장됩니다.", base: "기본 대분류", active: "활성", inactive: "비활성", order: "정렬 순서", save: "저장 및 자동 번역", cancel: "취소", edit: "수정", used: "이 분류를 사용하는 상품 {{count}}개", inactiveNote: "사용 중인 분류는 삭제하지 않고 비활성화합니다.", empty: "등록된 상품 종류가 없습니다.", required: "상품 종류 이름을 입력하세요." }
    : locale === "zh"
      ? { title: "商品分类管理", add: "添加分类", korean: "分类名称", auto: "可使用韩文、中文或英文输入，系统会自动保存其余语言。", base: "基础分类", active: "启用", inactive: "停用", order: "排序", save: "保存并自动翻译", cancel: "取消", edit: "编辑", used: "有 {{count}} 件商品使用此分类", inactiveNote: "已使用的分类不会删除，只能停用。", empty: "还没有分类。", required: "请输入分类名称。" }
      : { title: "CATEGORY MANAGEMENT", add: "ADD CATEGORY", korean: "Category name", auto: "Enter Korean, Chinese, or English; the other locales are saved automatically.", base: "Base category", active: "Active", inactive: "Inactive", order: "Sort order", save: "SAVE & TRANSLATE", cancel: "Cancel", edit: "Edit", used: "{{count}} product(s) use this category", inactiveNote: "Used categories are never deleted; they can be made inactive.", empty: "No categories have been added.", required: "Enter a category name." };
  const utils = trpc.useUtils();
  const create = trpc.admin.createProductCategory.useMutation({ onSuccess: () => utils.admin.productCategories.invalidate() });
  const update = trpc.admin.updateProductCategory.useMutation({ onSuccess: () => utils.admin.productCategories.invalidate() });
  const translate = trpc.admin.translateCustomerText.useMutation();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const isSaving = create.isPending || update.isPending || translate.isPending;
  const updateDraft = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));
  const reset = () => { setCreating(false); setEditingId(null); setDraft(emptyDraft()); setMessage(""); };
  const startEdit = (item: ManagedCategory) => { setCreating(true); setEditingId(item.id); setDraft({ nameEn: item.nameEn, nameKo: item.nameKo, nameZh: item.nameZh, baseCategory: item.baseCategory, isActive: item.isActive, sortOrder: item.sortOrder }); setMessage(""); };
  const save = async () => {
    if (!draft.nameKo.trim()) return setMessage(copy.required);
    try {
      const translated = await translate.mutateAsync({ context: "category", title: draft.nameKo.trim() });
      const payload = { ...draft, nameEn: translated.titleEn, nameKo: translated.titleKo, nameZh: translated.titleZh };
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else {
        const category = await create.mutateAsync(payload);
        if (category) {
          const created = { ...category, usageCount: 0 };
          utils.admin.productCategories.setData(undefined, (previous) => previous ? [...previous, created] : [created]);
          onCreated?.(created);
        }
      }
      reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save category."); }
  };
  return <section className="mt-5 rounded-2xl border border-[#dedbd4] bg-white">
    <button type="button" onClick={() => { onOpenChange(!open); if (open) reset(); }} className="flex w-full items-center justify-between gap-3 p-4 text-left"><span><span className="text-[10px] font-bold tracking-[.15em] text-[#766f66]">LESOUL CATALOG</span><span className="mt-1 block text-sm font-semibold text-[#29231e]">{copy.title}</span></span><ChevronDown size={17} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
    {open && <div className="border-t border-[#ebe6de] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[11px] leading-5 text-[#746d64]">{copy.inactiveNote}</p><button type="button" onClick={() => { reset(); setCreating(true); }} className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-[10px] font-semibold text-white"><Plus size={13} />{copy.add}</button></div>
      {creating && <div className="mt-4 rounded-xl border border-[#dedbd4] bg-[#fbfaf8] p-3"><div className="grid gap-2 sm:grid-cols-2"><label className="text-[10px] font-semibold text-[#625b52] sm:col-span-2">{copy.korean}<input value={draft.nameKo} onChange={(event) => updateDraft({ nameKo: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-[#dedbd4] bg-white px-2 text-sm" /><span className="mt-1 flex items-center gap-1 text-[10px] font-normal text-[#766d64]"><Languages size={11} />{copy.auto}</span></label><label className="text-[10px] font-semibold text-[#625b52]">{copy.base}<select value={draft.baseCategory} onChange={(event) => updateDraft({ baseCategory: event.target.value as Draft["baseCategory"] })} className="mt-1 h-10 w-full rounded-lg border border-[#dedbd4] bg-white px-2 text-sm">{["TOP", "PANTS", "JACKET", "DRESS", "SHOES", "BAG"].map((base) => <option key={base}>{base}</option>)}</select></label><label className="text-[10px] font-semibold text-[#625b52]">{copy.order}<input type="number" min="0" value={draft.sortOrder} onChange={(event) => updateDraft({ sortOrder: Math.max(0, Number(event.target.value)) })} className="mt-1 h-10 w-full rounded-lg border border-[#dedbd4] bg-white px-2 text-sm" /></label><label className="flex items-end gap-2 pb-2 text-[11px] font-semibold text-[#4f4942]"><input type="checkbox" checked={Boolean(draft.isActive)} onChange={(event) => updateDraft({ isActive: event.target.checked ? 1 : 0 })} />{draft.isActive ? copy.active : copy.inactive}</label></div>{message && <p className="mt-2 text-xs text-[#a33e30]">{message}</p>}<div className="mt-3 flex gap-2"><button type="button" onClick={reset} className="h-9 flex-1 rounded-lg border border-[#d8d2c9] bg-white text-xs font-semibold">{copy.cancel}</button><button type="button" disabled={isSaving} onClick={save} className="inline-flex h-9 flex-[1.4] items-center justify-center gap-1 rounded-lg bg-black text-xs font-semibold text-white disabled:opacity-50">{isSaving && <LoaderCircle className="animate-spin" size={13} />}{copy.save}</button></div></div>}
      <div className="mt-4 grid gap-2">{categories.length ? categories.map((item) => <article key={item.id} className="flex items-center gap-2 rounded-xl border border-[#e7e1d9] bg-[#fbfaf8] p-3"><span className={`size-2 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-[#b9afa4]"}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{locale === "ko" ? item.nameKo : locale === "zh" ? item.nameZh : item.nameEn}</p><p className="mt-0.5 text-[10px] text-[#756d63]">{item.baseCategory} · {copy.used.replace("{{count}}", String(item.usageCount))}</p></div><button type="button" onClick={() => startEdit(item)} aria-label={copy.edit} className="grid size-8 place-items-center rounded-full border border-[#dedbd4] bg-white"><Pencil size={13} /></button></article>) : <p className="py-4 text-center text-xs text-[#777]">{copy.empty}</p>}</div>
    </div>}
  </section>;
}
