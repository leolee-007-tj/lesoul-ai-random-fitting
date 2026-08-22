import { Check, ImagePlus, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { allowedPendingProductImageCount, nextProductImageSlot, type ProductImageSlotKey } from "@shared/productBulkImages";

type PendingImage = { id: string; file: File; preview: string; slot: ProductImageSlotKey };

const copyFor = (locale: "en" | "ko" | "zh") => locale === "ko"
  ? { title: "이미지 일괄 업로드", open: "여러 이미지 선택", help: "최대 4장의 원본 품질 사진을 먼저 고른 뒤, 앞면·뒷면·디테일 1·디테일 2에 배정하세요.", empty: "대기 중인 이미지가 없습니다.", apply: "슬롯에 업로드", cancel: "닫기", invalid: "JPG, PNG, WEBP 이미지만 장당 20MB 이하로 추가할 수 있습니다.", limit: "한 번에 최대 4장까지 대기시킬 수 있습니다.", slots: { front: "앞면", back: "뒷면", detail1: "디테일 1", detail2: "디테일 2" } }
  : locale === "zh"
    ? { title: "批量上传图片", open: "选择多张图片", help: "最多先选择 4 张原始画质照片，再分配到正面、背面、细节 1、细节 2。", empty: "暂无待上传图片。", apply: "上传到槽位", cancel: "关闭", invalid: "仅支持 JPG、PNG、WEBP 图片，单张不超过 20MB。", limit: "一次最多暂存 4 张图片。", slots: { front: "正面", back: "背面", detail1: "细节 1", detail2: "细节 2" } }
    : { title: "Bulk image upload", open: "Choose multiple images", help: "Choose up to four original-quality images, then assign each one to Front, Back, Detail 1, or Detail 2.", empty: "No pending images.", apply: "Upload to slot", cancel: "Close", invalid: "Only JPG, PNG, or WEBP images up to 20MB each can be added.", limit: "You can stage up to four images at once.", slots: { front: "Front", back: "Back", detail1: "Detail 1", detail2: "Detail 2" } };

export default function BulkProductImageTray({ visible, locale, uploading, onAssign }: { visible: boolean; locale: "en" | "ko" | "zh"; uploading: boolean; onAssign: (slot: ProductImageSlotKey, file: File) => Promise<void> }) {
  const copy = copyFor(locale);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PendingImage[]>([]);
  const [error, setError] = useState("");
  const stagedCount = useMemo(() => items.length, [items.length]);
  if (!visible) return null;
  const chooseFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= 20 * 1024 * 1024);
    if (valid.length !== files.length) setError(copy.invalid);
    const allowed = allowedPendingProductImageCount(items.length, valid.length);
    if (allowed < valid.length) setError(copy.limit);
    const next = valid.slice(0, allowed).map((file, index) => ({ id: `${file.name}-${file.lastModified}-${index}`, file, preview: URL.createObjectURL(file), slot: nextProductImageSlot(items.length + index) }));
    setItems((current) => [...current, ...next]);
  };
  const remove = (id: string) => setItems((current) => { const target = current.find((item) => item.id === id); if (target) URL.revokeObjectURL(target.preview); return current.filter((item) => item.id !== id); });
  const assign = async (item: PendingImage) => { setError(""); try { await onAssign(item.slot, item.file); remove(item.id); } catch { setError(copy.invalid); } };
  return <aside className="fixed inset-x-3 bottom-3 z-[45] mx-auto max-w-xl rounded-2xl border border-[#d8d1c7] bg-white p-3 shadow-2xl"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#332c25]">{copy.title}</p><p className="mt-0.5 text-[10px] text-[#756b61]">{stagedCount}/4</p></div><div className="flex gap-2"><label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-black px-3 text-[10px] font-semibold text-white"><ImagePlus size={13} />{copy.open}<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { chooseFiles(event.target.files); event.target.value = ""; }} /></label><button type="button" onClick={() => setOpen((current) => !current)} className="grid size-9 place-items-center rounded-lg border border-[#d9d1c8]" aria-label={copy.cancel}>{open ? <X size={15} /> : <UploadCloud size={15} />}</button></div></div>{open && <div className="mt-3 max-h-[46svh] overflow-y-auto"><p className="text-[10px] leading-4 text-[#756b61]">{copy.help}</p>{error && <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-[10px] text-red-700">{error}</p>}{items.length ? <div className="mt-3 space-y-2">{items.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-xl bg-[#f8f5ef] p-2"><img src={item.preview} alt="" className="size-12 rounded-lg bg-white object-contain" /><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#463d35]">{item.file.name}</p><select value={item.slot} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, slot: event.target.value as ProductImageSlotKey } : entry))} className="mt-1 h-7 w-full rounded-md border border-[#ded7ce] bg-white px-2 text-[10px]">{Object.entries(copy.slots).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><button type="button" disabled={uploading} onClick={() => void assign(item)} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-black px-2 text-[10px] font-semibold text-white disabled:opacity-40">{uploading ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}{copy.apply}</button><button type="button" onClick={() => remove(item.id)} className="grid size-8 shrink-0 place-items-center text-[#9a4a3f]" aria-label="Remove"><Trash2 size={13} /></button></div>)}</div> : <p className="mt-3 rounded-xl border border-dashed border-[#ddd5ca] p-3 text-center text-[10px] text-[#7b7065]">{copy.empty}</p>}</div>}</aside>;
}
