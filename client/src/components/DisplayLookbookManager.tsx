import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, LoaderCircle, RefreshCw, Shuffle, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Locale = "ko" | "zh" | "en";
type GarmentGroup = "all" | "top" | "bottom" | "outer" | "dress";
type OutfitMode = "separates" | "dress";

const copy = {
  ko: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "매장 디스플레이 AI 룩북", body: "상품별 이미지 또는 등록 상품을 상·하의·외투·원피스로 랜덤 조합한 코디 이미지를 실제 AI로 생성합니다. 승인된 이미지만 매장 디스플레이 자동전시에 사용됩니다.", choose: "상품 선택", count: "생성 장수", randomOutfit: "랜덤 코디 생성", separates: "상의 + 하의 (+ 외투)", dress: "원피스 (+ 외투)", planning: "코디를 뽑는 중…", generate: "생성", regenerate: "재생성", generating: "이미지 생성 중…", empty: "아직 생성된 룩북 이미지가 없습니다.", pending: "검토 대기", approved: "전시 승인", revoke: "승인 취소", remove: "삭제", generated: "생성 완료", progress: "생성 진행률", failed: "장 생성 실패", composition: "코디 구성", note: "랜덤 코디는 등록된 상품의 원본 이미지를 각각 참고합니다. 상의·하의·외투·원피스를 임의로 바꾸거나 합치지 않고, 선택된 옷의 색상·실루엣·길이·소매·넥라인·디테일을 보존합니다. 생성 후 관리자가 승인한 이미지에만 매장 전시가 적용됩니다." },
  zh: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "门店展示 AI Lookbook", body: "使用真实 AI 图像生成模型，也可以将已登记的上装、下装、外套、连衣裙随机组合成搭配。只有批准的图片会用于门店自动展示。", choose: "选择商品", count: "生成张数", randomOutfit: "生成随机搭配", separates: "上装 + 下装（+ 外套）", dress: "连衣裙（+ 外套）", planning: "正在抽取搭配…", generate: "生成", regenerate: "重新生成", generating: "正在生成…", empty: "还没有生成 Lookbook 图片。", pending: "待审核", approved: "已批准展示", revoke: "取消批准", remove: "删除", generated: "生成完成", progress: "生成进度", failed: "张生成失败", composition: "搭配构成", note: "随机搭配分别参考已登记商品的原图，不任意替换或合并服装，并保留每件衣服的颜色、轮廓、长度、袖型、领口和细节。只有管理员批准后才会展示。" },
  en: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "Store Display AI Lookbook", body: "Generate real AI images for individual products or randomly combine registered tops, bottoms, outerwear, and dresses into complete outfits. Only approved images appear in the showroom.", choose: "Choose a product", count: "Image count", randomOutfit: "Generate random outfit", separates: "Top + bottom (+ outerwear)", dress: "Dress (+ outerwear)", planning: "Picking an outfit…", generate: "Generate", regenerate: "Regenerate", generating: "Generating…", empty: "No lookbook images generated yet.", pending: "Pending review", approved: "Approved for display", revoke: "Revoke approval", remove: "Delete", generated: "Generated", progress: "Generation progress", failed: "failed", composition: "Outfit composition", note: "Random outfits use each registered garment image as a separate reference. Do not replace or merge garments, and preserve each selected garment's color, silhouette, length, sleeves, neckline, and visible details. Only approved images are shown in the store display." },
};

function groupFor(product: any): Exclude<GarmentGroup, "all"> {
  const text = [product.category, product.productType, product.displayCategory?.name, product.displayCategory?.nameKo, product.displayCategory?.nameEn, product.name].filter(Boolean).join(" ").toLowerCase();
  if (/dress|원피스|连衣裙/.test(text)) return "dress";
  if (/outer|coat|jacket|cardigan|외투|아우터|코트|재킷|자켓|外套/.test(text)) return "outer";
  if (/bottom|skirt|pants|하의|치마|바지|裙|裤/.test(text)) return "bottom";
  return "top";
}

export default function DisplayLookbookManager({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const productsQuery = trpc.admin.products.useQuery(undefined, { retry: 1 });
  const products = productsQuery.data ?? [];
  const [group, setGroup] = useState<GarmentGroup>("all");
  const [count, setCount] = useState(3);
  const [productId, setProductId] = useState<number | null>(null);
  const [outfitMode, setOutfitMode] = useState<OutfitMode>("separates");
  const [lastOutfitLabel, setLastOutfitLabel] = useState("");
  const filteredProducts = useMemo(() => group === "all" ? products : products.filter((product: any) => groupFor(product) === group), [products, group]);
  const selected = useMemo(() => products.find((product: any) => product.id === productId), [products, productId]);
  useEffect(() => { if (!filteredProducts.some((product: any) => product.id === productId)) setProductId(filteredProducts[0]?.id ?? null); }, [filteredProducts, productId]);
  const imagesQuery = trpc.displayLookbook.adminList.useQuery({ productId: productId ?? 0 }, { enabled: Boolean(productId), retry: 1 });
  const progressQuery = trpc.displayLookbook.progress.useQuery({ productId: productId ?? 0 }, { enabled: Boolean(productId), refetchInterval: 1000, retry: false });
  const outfitPlan = trpc.displayLookbook.randomOutfitPlan.useQuery({ mode: outfitMode }, { enabled: false, retry: false });
  const generate = trpc.displayLookbook.generateBatch.useMutation({ onSuccess: () => void imagesQuery.refetch(), onSettled: () => void progressQuery.refetch() });
  const generateOutfit = trpc.displayLookbook.generateOutfitBatch.useMutation({ onSuccess: (result) => { setGroup("all"); setProductId(result.productId); setLastOutfitLabel(result.label); void imagesQuery.refetch(); }, onSettled: () => void progressQuery.refetch() });
  const approve = trpc.displayLookbook.approve.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const revoke = trpc.displayLookbook.revoke.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const remove = trpc.displayLookbook.remove.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const busy = generate.isPending || generateOutfit.isPending;
  const imageRows = imagesQuery.data ?? [];
  const progress = progressQuery.data;
  const approvedCount = imageRows.filter((image: any) => image.isApproved === 1).length;
  const titleFor = (product: any) => locale === "ko" ? product.nameKo || product.name : locale === "zh" ? product.nameZh || product.name : product.nameEn || product.name;
  const generateRandomOutfit = async () => {
    const result = await outfitPlan.refetch();
    if (result.data?.productIds.length) generateOutfit.mutate({ productIds: result.data.productIds, count });
  };

  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
    <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f2eadf]"><ImagePlus size={17} /></div><div><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{text.eyebrow}</p><h2 className="mt-1 text-lg font-semibold">{text.title}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#70675e]">{text.body}</p></div></div>
    <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={text.choose}>{(Object.keys({ all: 1, top: 1, bottom: 1, outer: 1, dress: 1 }) as GarmentGroup[]).map((key) => <button key={key} type="button" role="tab" aria-selected={group === key} onClick={() => setGroup(key)} className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${group === key ? "bg-black text-white" : "bg-[#f5f1eb] text-[#6f655b]"}`}>{key === "all" ? (locale === "ko" ? "전체" : locale === "zh" ? "全部" : "All") : text[key === "top" ? "separates" : key === "bottom" ? "separates" : key === "outer" ? "separates" : "dress"]}</button>)}</div>
    <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end"><label className="text-xs font-semibold text-[#51483f]">{text.choose}<select value={productId ?? ""} onChange={(event) => setProductId(Number(event.target.value) || null)} className="mt-1 h-11 w-full rounded-xl border border-[#d9d0c5] bg-white px-3 text-sm"><option value="">—</option>{filteredProducts.map((product: any) => <option key={product.id} value={product.id}>{titleFor(product)}</option>)}</select></label><label className="text-xs font-semibold text-[#51483f]">{text.count}<select value={count} onChange={(event) => setCount(Number(event.target.value))} disabled={busy} className="mt-1 h-11 w-full rounded-xl border border-[#d9d0c5] bg-white px-3 text-sm">{[1, 2, 3, 5, 8, 10].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button type="button" disabled={!productId || busy} onClick={() => productId && generate.mutate({ productId, count })} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white disabled:opacity-40">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}{busy ? text.generating : imageRows.length ? text.regenerate : text.generate} {count}</button></div>
    <div className="mt-4 rounded-2xl border border-[#eadfd2] bg-[#fbf7f1] p-3"><div className="flex items-center gap-2"><Shuffle size={16} /><p className="text-xs font-bold">{text.randomOutfit}</p></div><div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><select value={outfitMode} onChange={(event) => setOutfitMode(event.target.value as OutfitMode)} disabled={busy} className="h-11 rounded-xl border border-[#d9d0c5] bg-white px-3 text-xs"><option value="separates">{text.separates}</option><option value="dress">{text.dress}</option></select><button type="button" disabled={busy} onClick={() => void generateRandomOutfit()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1f1b18] bg-white px-4 text-xs font-bold text-[#1f1b18] disabled:opacity-40">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Shuffle size={15} />}{busy ? text.generating : text.randomOutfit}</button></div>{(outfitPlan.isFetching || generateOutfit.isPending) && <p className="mt-2 text-[11px] text-[#786e63]">{outfitPlan.isFetching ? text.planning : text.generating}</p>}{lastOutfitLabel && <p className="mt-2 text-[11px] text-[#786e63]"><span className="font-bold">{text.composition}:</span> {lastOutfitLabel}</p>}</div>
    {busy && <div className="mt-4 rounded-xl bg-[#f7f3ed] p-3" role="status" aria-live="polite"><div className="flex items-center justify-between text-[11px] font-bold text-[#5b5148]"><span>{text.progress}</span><span>{progress?.completed ?? 0}/{progress?.total ?? count} · {progress?.percent ?? 0}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ddd2]"><div className="h-full rounded-full bg-[#2b2520] transition-[width] duration-500" style={{ width: `${progress?.percent ?? 0}%` }} /></div></div>}
    {selected && <p className="mt-3 text-[11px] text-[#786e63]">{titleFor(selected)} · {text.generated}: {imageRows.length}/{progress?.total ?? count} · {text.approved}: {approvedCount}/{progress?.total ?? count}{progress?.failed ? ` · ${progress.failed}${text.failed}` : ""}</p>}
    {(generate.error || generateOutfit.error || progress?.lastError || outfitPlan.error) && <p role="alert" className="mt-2 rounded-xl bg-[#fff0ed] px-3 py-2 text-xs text-[#9b4439]">{generate.error?.message || generateOutfit.error?.message || progress?.lastError || outfitPlan.error?.message}</p>}
    {imageRows.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{imageRows.map((image: any) => <article key={image.id} className="overflow-hidden rounded-xl border border-[#e0d8ce] bg-[#faf8f4]"><div className="aspect-[3/4] bg-[#eee9e1]"><img src={image.imageUrl} alt={image.sceneDescription} className="h-full w-full object-cover" loading="lazy" /></div><div className="p-2">{image.compositionLabel && <p className="mb-1 text-[10px] font-bold leading-4 text-[#433a32]">{text.composition}: {image.compositionLabel}</p>}<p className="min-h-8 text-[10px] leading-4 text-[#6d6258]">{image.shotIndex}. {image.sceneDescription}</p><p className={`mt-2 text-[10px] font-bold ${image.isApproved ? "text-[#31734d]" : "text-[#927047]"}`}>{image.isApproved ? text.approved : text.pending}</p><div className="mt-2 grid grid-cols-2 gap-1"><button type="button" onClick={() => image.isApproved ? revoke.mutate({ id: image.id }) : approve.mutate({ id: image.id })} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-white text-[10px] font-bold ring-1 ring-[#d9d0c5]">{image.isApproved ? <X size={12} /> : <Check size={12} />}{image.isApproved ? text.revoke : text.approved}</button><button type="button" onClick={() => remove.mutate({ id: image.id })} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#fff0ed] text-[10px] font-bold text-[#9b4439]"><Trash2 size={12} />{text.remove}</button></div></div></article>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-[#dcd3c9] px-4 py-7 text-center text-xs text-[#7c7167]">{text.empty}</p>}
    <p className="mt-4 text-[10px] leading-4 text-[#8a7d70]">{text.note}</p>
  </section>;
}

export { groupFor };
