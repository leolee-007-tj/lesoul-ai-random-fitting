import MobileScreen from "@/components/MobileScreen";
import PurchaseListAddButton from "@/components/PurchaseListAddButton";
import { clearHistory, readHistory, removeHistoryByIds, replaceHistory, type LookHistory, type SavedLookProduct } from "@/lib/mvpStore";
import { formatLookDate, formatPrice } from "@/lib/localeFormat";
import { localizedProductDescription, localizedProductName } from "@shared/productCommerce";
import { localizePose } from "@/lib/poseLocalization";
import { getLocalizedBackground, getLocalizedStyle } from "@/lib/lookLocalization";
import { ArrowRight, Check, LoaderCircle, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function ProductDetail({ product, language }: { product: SavedLookProduct; language: string }) {
  const { t } = useTranslation();
  const detailImages = [product.imageViews?.front?.original, product.imageViews?.back?.original, ...(product.imageViews?.detail ?? []).map((asset) => asset.original)].filter((url): url is string => Boolean(url));
  const name = localizedProductName(product, language);
  return <article className="rounded-2xl border border-[#e1ddd5] bg-[#fbfaf8] p-3"><div className="flex gap-3"><img src={detailImages[0] ?? product.imageUrl} alt={name} className="size-24 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold tracking-[.12em] text-[#777]">{t(`categories.${product.category}`, { defaultValue: product.category })}</p><h3 className="mt-1 text-sm font-semibold">{name}</h3><p className="mt-1 text-[11px] leading-4 text-[#777]">{localizedProductDescription(product, language)}</p><p className="mt-2 text-xs font-semibold">{formatPrice(product.price, language)}</p></div></div>{detailImages.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{detailImages.slice(0, 6).map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${name} ${index + 1}`} className="aspect-square w-full rounded-lg object-cover" />)}</div>}<PurchaseListAddButton product={{ ...product, imageUrl: detailImages[0] ?? product.imageUrl, sizeOptions: (product as SavedLookProduct & { sizeOptions?: Array<{ label: string; available?: boolean }> }).sizeOptions ?? null }} source="ai_fitting" className="mt-3" /></article>;
}

export default function History() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [items, setItems] = useState<LookHistory[]>([]);
  const [selected, setSelected] = useState<LookHistory | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLookIds, setSelectedLookIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState("");
  const syncLook = trpc.savedLooks.sync.useMutation();
  const remoteLooks = trpc.savedLooks.list.useQuery(undefined, { enabled: isAuthenticated });
  const removeMany = trpc.savedLooks.removeMany.useMutation();
  const clearRemoteLooks = trpc.savedLooks.clear.useMutation();

  useEffect(() => {
    const local = readHistory();
    setItems(local);
    if (isAuthenticated) local.forEach((look) => syncLook.mutate({ id: look.id, lookCode: look.id.slice(0, 48), imageUrl: look.imageUrl, snapshot: look }));
  }, [isAuthenticated]);

  useEffect(() => {
    const local = readHistory();
    const remote = (remoteLooks.data ?? []).map((row) => row.snapshot as LookHistory).filter((look) => Boolean(look?.id));
    const merged = [...local, ...remote].filter((look, index, all) => all.findIndex((candidate) => candidate.id === look.id) === index).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 12);
    replaceHistory(merged);
    setItems(readHistory());
  }, [remoteLooks.data]);

  const language = i18n.language;
  const poseLabel = (look: LookHistory) => localizePose(language, look.poseRaw ?? look.pose).title;
  const localizedBackground = (look: LookHistory) => getLocalizedBackground(t, look.backgroundRaw ?? look.background, look.backgroundKey);
  const localizedStyle = (look: LookHistory) => getLocalizedStyle(t, look.style, look.styleKey).label;
  const localizedProductNames = (look: LookHistory) => look.products?.map((product) => localizedProductName(product, language)).filter(Boolean).join(" · ") || look.productNames.join(" · ");
  const exitSelection = () => { setSelectionMode(false); setSelectedLookIds([]); };
  const updateRemovedState = (ids: string[]) => {
    const removing = new Set(ids);
    removeHistoryByIds(ids);
    setItems((current) => current.filter((look) => !removing.has(look.id)));
    setSelected((current) => current && removing.has(current.id) ? null : current);
    setSelectedLookIds([]);
    setSelectionMode(false);
    utils.savedLooks.list.setData(undefined, (current) => current?.filter((look) => !removing.has(look.lookId)) ?? []);
  };
  const deleteLooks = async (ids: string[]) => {
    if (!ids.length || !window.confirm(t("history.manage.confirmSelected"))) return;
    setDeleteError("");
    try {
      if (isAuthenticated) await removeMany.mutateAsync({ lookIds: ids });
      updateRemovedState(ids);
      if (isAuthenticated) await utils.savedLooks.list.invalidate();
    } catch (caught) { setDeleteError(caught instanceof Error ? caught.message : "SAVED_LOOK_DELETE_FAILED"); }
  };
  const deleteAll = async () => {
    if (!items.length || !window.confirm(t("history.manage.confirmAll"))) return;
    setDeleteError("");
    try {
      if (isAuthenticated) await clearRemoteLooks.mutateAsync();
      clearHistory();
      setItems([]); setSelected(null); exitSelection();
      utils.savedLooks.list.setData(undefined, []);
      if (isAuthenticated) await utils.savedLooks.list.invalidate();
    } catch (caught) { setDeleteError(caught instanceof Error ? caught.message : "SAVED_LOOK_DELETE_ALL_FAILED"); }
  };
  const toggleLook = (id: string) => setSelectedLookIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const busy = removeMany.isPending || clearRemoteLooks.isPending;

  return <MobileScreen><div className="lesoul-mobile-frame lesoul-history-frame px-4 pb-5 pt-4 sm:px-6"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#777]">{t("history.eyebrow")}</p><h1 className="mt-1 font-serif text-3xl">{t("history.title")}</h1><p className="mt-2 text-sm leading-5 text-[#666]">{t("history.body")}</p></div>{items.length > 0 && !selectionMode && <button onClick={() => setSelectionMode(true)} className="h-9 rounded-full border border-[#ddd7ce] bg-white px-3 text-[10px] font-semibold text-[#666]">{t("history.manage.select")}</button>}</div>{items.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f5f1eb] p-2">{selectionMode ? <><span className="px-1 text-[11px] font-semibold text-[#5d544b]">{t("history.manage.selected", { count: selectedLookIds.length })}</span><div className="flex gap-2"><button onClick={exitSelection} disabled={busy} className="h-8 rounded-full border border-[#d8d0c6] bg-white px-3 text-[10px] font-semibold">{t("history.manage.cancel")}</button><button onClick={() => void deleteLooks(selectedLookIds)} disabled={!selectedLookIds.length || busy} className="flex h-8 items-center gap-1 rounded-full bg-[#29231e] px-3 text-[10px] font-semibold text-white disabled:opacity-40">{busy && <LoaderCircle className="animate-spin" size={12} />}{t("history.manage.deleteSelected")}</button></div></> : <button onClick={() => void deleteAll()} disabled={busy} className="ml-auto flex h-8 items-center gap-1 rounded-full border border-[#e7cfc8] bg-white px-3 text-[10px] font-semibold text-[#9b3c29] disabled:opacity-40"><Trash2 size={12} />{t("history.manage.deleteAll")}</button>}</div>}{deleteError && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{deleteError}</p>}{items.length ? <section className="mt-5 grid gap-3 min-[744px]:grid-cols-3 min-[1024px]:grid-cols-4">{items.map((item) => { const checked = selectedLookIds.includes(item.id); return <article key={item.id} className={`relative overflow-hidden rounded-2xl border bg-white text-left transition ${checked ? "border-black ring-2 ring-black/20" : "border-[#dfdbd4]"}`}><button type="button" onClick={() => selectionMode ? toggleLook(item.id) : setSelected(item)} aria-pressed={selectionMode ? checked : undefined} className="flex min-h-22 w-full text-left transition hover:-translate-y-0.5 hover:shadow-md min-[744px]:block"><img src={item.imageUrl} alt={t("history.manage.savedLookAlt")} className="aspect-square w-24 shrink-0 object-cover min-[744px]:aspect-[.8] min-[744px]:w-full" /><div className="min-w-0 p-3"><p className="text-[10px] font-bold tracking-[.12em] text-[#777]">{localizedStyle(item)} · {localizedBackground(item).name}</p><p className="mt-1 truncate text-sm font-semibold">{poseLabel(item)}</p><p className="mt-1 text-[11px] text-[#777]">{formatLookDate(item.createdAt, language)}</p><p className="mt-1 truncate text-[10px] text-[#777]">{localizedProductNames(item)}</p><p className="mt-2 text-[10px] font-semibold text-[#5c5148]">{selectionMode ? t("history.manage.select") : t("history.viewDetails")}</p></div></button>{selectionMode ? <span aria-hidden="true" className={`absolute right-2 top-2 grid size-6 place-items-center rounded-full border-2 ${checked ? "border-black bg-black text-white" : "border-white bg-white/90 text-transparent"}`}><Check size={14} /></span> : <button type="button" onClick={(event) => { event.stopPropagation(); void deleteLooks([item.id]); }} disabled={busy} aria-label={t("history.manage.delete")} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95 text-[#8b3d2d] shadow-sm disabled:opacity-40"><Trash2 size={13} /></button>}</article>; })}</section> : <section className="mt-5 grid min-h-72 place-items-center rounded-[1.6rem] border border-dashed border-[#c9c4bb] bg-white text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#ece8e1]"><Sparkles size={19} /></span><h2 className="mt-3 font-serif text-xl">{t("history.manage.empty")}</h2><button onClick={() => navigate("/body-model")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">{t("history.cta")} <ArrowRight size={15} /></button></div></section>}{selected && <div className="lesoul-safe-modal z-40"><div className="mx-auto max-h-[90svh] max-w-2xl overflow-auto rounded-[1.7rem] bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#777]">{t("history.outfitDetails")}</p><h2 className="mt-1 font-serif text-3xl">{localizedProductNames(selected)}</h2><p className="mt-2 text-xs text-[#777]">{poseLabel(selected)} · {localizedBackground(selected).name} · {formatLookDate(selected.createdAt, language)}</p>{localizedBackground(selected).description && <p className="mt-1 text-[11px] leading-4 text-[#84796e]">{localizedBackground(selected).description}</p>}</div><div className="flex gap-2"><button type="button" onClick={() => void deleteLooks([selected.id])} disabled={busy} aria-label={t("history.manage.delete")} className="grid size-8 place-items-center rounded-full border border-[#ead4cd] text-[#9b3c29]"><Trash2 size={15} /></button><button type="button" onClick={() => setSelected(null)} aria-label={t("common.close")}><X size={20} /></button></div></div><img src={selected.imageUrl} alt={t("history.manage.savedLookAlt")} className="mt-4 max-h-[42svh] w-full rounded-2xl object-cover" /><div className="mt-4 grid gap-3">{(selected.products ?? []).map((product) => <ProductDetail key={product.id} product={product} language={language} />)}</div>{!(selected.products?.length) && <p className="mt-4 rounded-xl bg-[#f5f1eb] p-3 text-xs text-[#777]">{t("history.legacyDetails")}</p>}</div></div>}</div></MobileScreen>;
}
