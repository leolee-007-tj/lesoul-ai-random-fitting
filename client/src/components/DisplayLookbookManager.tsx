import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, LoaderCircle, RefreshCw, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Locale = "ko" | "zh" | "en";

const copy = {
  ko: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "매장 디스플레이 AI 룩북", body: "상품별로 서양인 모델 착용 이미지와 자연스러운 동대문 매장 근무 장면을 최대 10장 생성합니다. 승인된 이미지만 매장 디스플레이 자동전시에 사용됩니다.", choose: "상품 선택", generate: "10장 생성", regenerate: "새 10장 재생성", generating: "이미지 생성 중…", empty: "아직 생성된 룩북 이미지가 없습니다.", pending: "검토 대기", approved: "전시 승인", revoke: "승인 취소", remove: "삭제", generated: "생성 완료", note: "AI 이미지에는 실제 상품과 차이가 생길 수 있으므로 승인 후 공개됩니다." },
  zh: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "门店展示 AI Lookbook", body: "为每件商品生成最多 10 张西方模特试穿图和自然的东大门店铺工作场景。只有批准的图片会用于门店自动展示。", choose: "选择商品", generate: "生成 10 张", regenerate: "重新生成 10 张", generating: "正在生成…", empty: "还没有生成 Lookbook 图片。", pending: "待审核", approved: "已批准展示", revoke: "取消批准", remove: "删除", generated: "生成完成", note: "AI 图片可能与实物存在差异，审核后才会公开。" },
  en: { eyebrow: "STORE DISPLAY AI LOOKBOOK", title: "Store Display AI Lookbook", body: "Generate up to 10 Western-model try-on images and natural Dongdaemun boutique work scenes per product. Only approved images appear in the store display showroom.", choose: "Choose a product", generate: "Generate 10", regenerate: "Regenerate 10", generating: "Generating…", empty: "No lookbook images generated yet.", pending: "Pending review", approved: "Approved for display", revoke: "Revoke approval", remove: "Delete", generated: "Generated", note: "AI images may differ from the physical product and are shown only after approval." },
};

export default function DisplayLookbookManager({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const productsQuery = trpc.admin.products.useQuery(undefined, { retry: 1 });
  const products = productsQuery.data ?? [];
  const [productId, setProductId] = useState<number | null>(null);
  const selected = useMemo(() => products.find((product: any) => product.id === productId), [products, productId]);
  useEffect(() => { if (productId == null && products[0]) setProductId(products[0].id); }, [products, productId]);
  const imagesQuery = trpc.displayLookbook.adminList.useQuery({ productId: productId ?? 0 }, { enabled: Boolean(productId), retry: 1 });
  const generate = trpc.displayLookbook.generateBatch.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const approve = trpc.displayLookbook.approve.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const revoke = trpc.displayLookbook.revoke.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const remove = trpc.displayLookbook.remove.useMutation({ onSuccess: () => void imagesQuery.refetch() });
  const busy = generate.isPending;
  const imageRows = imagesQuery.data ?? [];
  const approvedCount = imageRows.filter((image: any) => image.isApproved === 1).length;
  const titleFor = (product: any) => locale === "ko" ? product.nameKo || product.name : locale === "zh" ? product.nameZh || product.name : product.nameEn || product.name;

  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
    <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f2eadf]"><ImagePlus size={17} /></div><div><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{text.eyebrow}</p><h2 className="mt-1 text-lg font-semibold">{text.title}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#70675e]">{text.body}</p></div></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label className="text-xs font-semibold text-[#51483f]">{text.choose}<select value={productId ?? ""} onChange={(event) => setProductId(Number(event.target.value) || null)} className="mt-1 h-11 w-full rounded-xl border border-[#d9d0c5] bg-white px-3 text-sm"><option value="">—</option>{products.map((product: any) => <option key={product.id} value={product.id}>{titleFor(product)}</option>)}</select></label><button type="button" disabled={!productId || busy} onClick={() => productId && generate.mutate({ productId })} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-bold text-white disabled:opacity-40">{busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}{busy ? text.generating : imageRows.length ? text.regenerate : text.generate}</button></div>
    {selected && <p className="mt-3 text-[11px] text-[#786e63]">{titleFor(selected)} · {text.generated}: {imageRows.length}/10 · {text.approved}: {approvedCount}/10</p>}
    {generate.error && <p role="alert" className="mt-2 rounded-xl bg-[#fff0ed] px-3 py-2 text-xs text-[#9b4439]">{generate.error.message}</p>}
    {imageRows.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{imageRows.map((image: any) => <article key={image.id} className="overflow-hidden rounded-xl border border-[#e0d8ce] bg-[#faf8f4]"><div className="aspect-[3/4] bg-[#eee9e1]"><img src={image.imageUrl} alt={image.sceneDescription} className="h-full w-full object-cover" loading="lazy" /></div><div className="p-2"><p className="min-h-8 text-[10px] leading-4 text-[#6d6258]">{image.shotIndex}. {image.sceneDescription}</p><p className={`mt-2 text-[10px] font-bold ${image.isApproved ? "text-[#31734d]" : "text-[#927047]"}`}>{image.isApproved ? text.approved : text.pending}</p><div className="mt-2 grid grid-cols-2 gap-1"><button type="button" onClick={() => image.isApproved ? revoke.mutate({ id: image.id }) : approve.mutate({ id: image.id })} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-white text-[10px] font-bold ring-1 ring-[#d9d0c5]">{image.isApproved ? <X size={12} /> : <Check size={12} />}{image.isApproved ? text.revoke : text.approved}</button><button type="button" onClick={() => remove.mutate({ id: image.id })} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#fff0ed] text-[10px] font-bold text-[#9b4439]"><Trash2 size={12} />{text.remove}</button></div></div></article>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-[#dcd3c9] px-4 py-7 text-center text-xs text-[#7c7167]">{text.empty}</p>}
    <p className="mt-4 text-[10px] leading-4 text-[#8a7d70]">{text.note}</p>
  </section>;
}
