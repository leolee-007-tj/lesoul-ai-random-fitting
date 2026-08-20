import ProductDetailScreen from "@/components/ProductDetailScreen";
import PurchaseListAddButton from "@/components/PurchaseListAddButton";
import FitReferenceNotice from "@/components/FitReferenceNotice";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import { ProductStatusBadges } from "@/components/ProductStatusBadges";
import { getVisitorId } from "@/lib/visitor";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { buildShareCard, downloadBlob, updateSocialMeta } from "@/lib/shareCard";
import { formatPrice } from "@/lib/localeFormat";
import { localizedProductDescription, localizedProductName } from "@shared/productCommerce";
import { recommendSize } from "@shared/sizeRecommendation";
import type { BodyMeasurements } from "@shared/bodyMeasurements";
import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type ResultProduct = {
  id: number; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null;
  description?: string; descriptionEn?: string | null; descriptionKo?: string | null; descriptionZh?: string | null;
  category: string; imageUrl: string; price: number; fit?: string | null; garmentMeasurements?: import("@shared/fitEngine").GarmentMeasurements | null;
  stretchLevel?: import("@shared/fitEngine").StretchLevel; catalogDisplay?: import("@shared/catalogDisplay").CatalogDisplaySettings & { effectiveScale?: number | null }; sizeOptions?: import("@shared/fitEngine").GarmentSizeOption[] | null; purchaseQrUrl?: string | null; purchaseUrl?: string | null; purchasePlatform?: string | null; status?: string | null; availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "PRE_ORDER" | "SOLD_OUT" | null; isNew?: number | boolean | null; newArrivalAt?: Date | string | null;
};

type ResultProps = {
  imageUrl: string; previousImageUrl: string | null; lookCode: string; products: ResultProduct[]; measurements: BodyMeasurements;
  isRegenerating: boolean; onRegenerate: (adjustments: Record<string, unknown>) => Promise<void>; onChangePose: () => void; onChangeOutfit: () => void;
  shareUrl: string; poseName: string; styleName: string; onRetry: () => void; generationId?: string | null; initialEditorOpen?: boolean; isSampleResult?: boolean; validationStatus?: string;
};

function copyFor(language: string) {
  if (language.startsWith("ko")) return { eyebrow: "나의 LESOUL 룩", editorial: "에디토리얼 프리뷰", shop: "이 LOOK 구매목록", saveImage: "LOOK 저장", detail: "상품 정보", size: "추천 사이즈", noSize: "FREE", imageAlt: "LESOUL AI 패션 룩" };
  if (language.startsWith("zh")) return { eyebrow: "你的 LESOUL 造型", editorial: "编辑预览", shop: "将这套 LOOK 加入清单", saveImage: "保存 LOOK", detail: "商品信息", size: "推荐尺码", noSize: "FREE", imageAlt: "LESOUL AI 时尚造型" };
  return { eyebrow: "YOUR LESOUL LOOK", editorial: "EDITORIAL PREVIEW", shop: "ADD THIS LOOK TO LIST", saveImage: "SAVE LOOK", detail: "VIEW DETAILS", size: "RECOMMENDED SIZE", noSize: "FREE", imageAlt: "LESOUL AI fashion look" };
}

export default function LookResultPanel({ imageUrl, lookCode, products, measurements, shareUrl }: ResultProps) {
  const { i18n } = useTranslation(); const language = i18n.language; const copy = copyFor(language);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false); const [detailId, setDetailId] = useState<number | null>(null);
  const access = trpc.access.status.useQuery({ visitorId: user?.openId ? `account:${user.openId}` : getVisitorId() });
  useEffect(() => { updateSocialMeta(lookCode, `${window.location.origin}/api/og/look?code=${encodeURIComponent(lookCode)}`); }, [lookCode]);
  const download = async () => { setSaving(true); try { const card = await buildShareCard(imageUrl, lookCode); downloadBlob(card, `${lookCode.toLowerCase()}-lesoul-look.jpg`); } finally { setSaving(false); } };
  const allowance = access.data?.isVip ? (language.startsWith("ko") ? "LESOUL VIP · 무제한 LOOK 생성" : language.startsWith("zh") ? "LESOUL VIP · 无限生成 LOOK" : "LESOUL VIP · UNLIMITED LOOKS") : access.data?.remaining !== null && access.data?.remaining !== undefined ? (language.startsWith("ko") ? `LOOK 생성 ${access.data.remaining}회 남음` : language.startsWith("zh") ? `还可以生成 ${access.data.remaining} 次 LOOK` : `${access.data.remaining} LOOKS REMAINING`) : null;
  return <section className="lesoul-result-panel mx-auto mt-5 w-full max-w-5xl"><p className="text-center text-[10px] font-bold tracking-[.2em] text-[#746b61]">{copy.eyebrow}</p><div className="relative mx-auto mt-3 w-full max-w-[480px] overflow-hidden rounded-[1.6rem] bg-[#e5e2dc]"><img src={imageUrl} alt={copy.imageAlt} className="mx-auto aspect-[3/4] max-h-[68svh] w-auto max-w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-white">{lookCode}</span></div><FitReferenceNotice context="result" className="mx-auto mt-3 max-w-[480px]" /><section className="mt-6"><p className="text-[10px] font-bold tracking-[.18em] text-[#766b60]">{copy.editorial}</p><h2 className="mt-2 font-serif text-3xl text-[#181512]">{copy.shop}</h2><div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">{products.map((item) => { const fit = recommendSize(item, measurements); return <article key={item.id} onClick={() => setDetailId(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setDetailId(item.id); }} role="button" tabIndex={0} className="w-[71vw] max-w-64 shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-[#e2ded7] bg-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-black"><div className="relative"><NormalizedProductImage src={item.imageUrl} alt={localizedProductName(item, language)} catalogDisplay={item.catalogDisplay} className="aspect-[4/5] w-full" /><ProductStatusBadges availabilityStatus={item.availabilityStatus} legacyStatus={item.status} isNew={item.isNew} newArrivalAt={item.newArrivalAt} /></div><div className="p-3"><p className="truncate text-sm font-semibold">{localizedProductName(item, language)}</p><p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-[#71685f]">{localizedProductDescription(item, language)}</p><p className="mt-2 text-[10px] font-semibold text-[#665d54]">{fit.size ? `${copy.size} · ${fit.size}` : copy.noSize}</p><p className="mt-1 text-sm font-semibold">{formatPrice(item.price, language)}</p><PurchaseListAddButton product={{ ...item, recommendedSize: fit.size }} source="ai_fitting" className="mt-3 w-full" /><p className="mt-3 text-[10px] font-bold tracking-[.08em] text-[#574c41]">{copy.detail} →</p></div></article>; })}</div></section><button onClick={download} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl border border-[#d8d2c9] bg-white py-3 text-xs font-semibold disabled:opacity-50">{saving ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} aria-hidden="true" />}{copy.saveImage}</button>{allowance && <p className="mt-3 text-center text-[10px] font-semibold tracking-[.08em] text-[#766b60]">{allowance}</p>}{detailId !== null && <ProductDetailScreen productId={detailId} onClose={() => setDetailId(null)} />}</section>;
}
