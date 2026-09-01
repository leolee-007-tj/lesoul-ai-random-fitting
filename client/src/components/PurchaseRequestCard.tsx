import { formatPrice } from "@/lib/localeFormat";
import { Eye, LoaderCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import FitReferenceNotice from "@/components/FitReferenceNotice";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";

type RequestItem = {
  productId: number;
  productName: string;
  nameEn: string | null;
  nameKo: string | null;
  nameZh: string | null;
  productImage: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  selectedSize: string;
  quantity: number;
  currentPrice: number;
  purchaseType?: "NORMAL" | "RESERVATION";
  status?: string | null;
  availabilityStatus?: "IN_STOCK" | "PRE_ORDER" | "SOLD_OUT" | null;
  isActive?: number | boolean | null;
};

type PurchaseRequest = {
  purchaseRequestId: string;
  createdAt: Date | string;
  items: RequestItem[];
  referenceTotal: number;
  purchaseNoticeEn?: string | null;
  purchaseNoticeKo?: string | null;
  purchaseNoticeZh?: string | null;
};

function nameFor(item: RequestItem, language: string) {
  return language.startsWith("ko") ? item.nameKo || item.productName : language.startsWith("zh") ? item.nameZh || item.productName : item.nameEn || item.productName;
}

function displaySize(size: string, language: string) {
  return size === "F" || size === "FREE" ? (language.startsWith("zh") ? "均码" : "FREE") : size;
}

function isAvailable(item: RequestItem) {
  return item.isActive !== 0 && item.availabilityStatus !== "SOLD_OUT" && item.status !== "sold_out" && item.status !== "SOLD_OUT";
}

function isPersistenceInstruction(text: string) {
  return /저장|save|保存/i.test(text);
}

async function imageFor(url: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load product image."));
    image.src = url;
  });
  return image;
}

async function buildRequestImage(
  request: PurchaseRequest,
  language: string,
  labels: { title: string; size: string; qty: string; reference: string; count: string; wechat: string; final: string; reservation: string; measurement: string },
) {
  const items = request.items.filter(isAvailable);
  const images = await Promise.all(items.map(async (item) => {
    try { return await imageFor(item.productImage); } catch { return null; }
  }));
  const grid = items.length > 4;
  const columns = grid ? 2 : 1;
  const rowHeight = grid ? 250 : 215;
  const rows = Math.ceil(items.length / columns);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = Math.max(1500, 260 + rows * rowHeight + 340);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Purchase request card renderer is unavailable.");
  ctx.fillStyle = "#f8f5ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1d1916";
  ctx.textAlign = "center";
  ctx.font = "600 72px serif";
  ctx.fillText("LESOUL", 540, 105);
  ctx.font = "600 28px sans-serif";
  ctx.fillText(labels.title, 540, 156);
  ctx.strokeStyle = "#d8cfc3";
  ctx.beginPath();
  ctx.moveTo(72, 190);
  ctx.lineTo(1008, 190);
  ctx.stroke();
  const contain = (image: HTMLImageElement, x: number, y: number, width: number, height: number, display?: RequestItem["catalogDisplay"]) => {
    const xPosition = display?.objectPositionX ?? 50;
    const yPosition = display?.objectPositionY ?? 50;
    const scale = Math.min(width / image.width, height / image.height) * (display?.effectiveScale ?? display?.manualScale ?? 1);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 18);
    ctx.clip();
    ctx.drawImage(image, x + (width - w) * (xPosition / 100), y + (height - h) * (yPosition / 100), w, h);
    ctx.restore();
  };
  items.forEach((item, index) => {
    const col = grid ? index % 2 : 0;
    const row = grid ? Math.floor(index / 2) : index;
    const x = grid ? 72 + col * 474 : 72;
    const y = 224 + row * rowHeight;
    const imageWidth = grid ? 160 : 190;
    const imageHeight = grid ? 190 : 180;
    const reservation = item.purchaseType === "RESERVATION";
    const detailY = reservation ? 124 : 94;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(x, y, grid ? 438 : 936, rowHeight - 18, 22);
    ctx.fill();
    if (images[index]) contain(images[index]!, x + 16, y + 15, imageWidth, imageHeight, item.catalogDisplay);
    ctx.textAlign = "left";
    ctx.fillStyle = "#1d1916";
    ctx.font = grid ? "600 24px sans-serif" : "600 32px sans-serif";
    ctx.fillText(nameFor(item, language).slice(0, grid ? 22 : 42), x + imageWidth + 35, y + 50);
    if (reservation) {
      ctx.fillStyle = "#6a5542";
      ctx.font = grid ? "600 16px sans-serif" : "600 20px sans-serif";
      ctx.fillText(labels.reservation, x + imageWidth + 35, y + 84);
    }
    ctx.fillStyle = "#62584e";
    ctx.font = grid ? "400 19px sans-serif" : "400 24px sans-serif";
    ctx.fillText(`${labels.size}: ${displaySize(item.selectedSize, language)}`, x + imageWidth + 35, y + detailY);
    ctx.fillText(`${labels.qty}: ${item.quantity}`, x + imageWidth + 35, y + detailY + 34);
    ctx.fillStyle = "#1d1916";
    ctx.font = grid ? "600 21px sans-serif" : "600 27px sans-serif";
    ctx.fillText(formatPrice(item.currentPrice, language), x + imageWidth + 35, y + detailY + 77);
  });
  const referenceTotal = items.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
  const footerY = 230 + rows * rowHeight + 30;
  ctx.strokeStyle = "#d8cfc3";
  ctx.beginPath();
  ctx.moveTo(72, footerY);
  ctx.lineTo(1008, footerY);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = "#1d1916";
  ctx.font = "600 27px sans-serif";
  ctx.fillText(`${labels.count}: ${items.reduce((sum, item) => sum + item.quantity, 0)}`, 78, footerY + 54);
  ctx.fillText(`${labels.reference}: ${formatPrice(referenceTotal, language)}`, 78, footerY + 96);
  ctx.fillStyle = "#675d53";
  ctx.font = "500 22px sans-serif";
  ctx.fillText(request.purchaseRequestId, 78, footerY + 146);
  ctx.font = "400 20px sans-serif";
  ctx.fillText(labels.wechat, 78, footerY + 202);
  ctx.fillText(labels.final, 78, footerY + 238);
  ctx.fillStyle = "#7b7065";
  ctx.font = "400 17px sans-serif";
  ctx.fillText(labels.measurement, 78, footerY + 278);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create purchase request image.")), "image/png"));
}

export default function PurchaseRequestCard({ request, onNewList }: { request: PurchaseRequest; onNewList: () => void }) {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const config = trpc.purchase.config.useQuery();
  const [sharing, setSharing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const copy = language.startsWith("ko") ? { title: "구매목록", size: "사이즈", qty: "수량", reference: "상품 기준 합계", count: "상품 수", wechat: "미리보기 후 이 이미지를 위챗으로 바로 공유해 주세요.", final: "재고와 최종 가격은 판매자와 확인해 주세요.", reservation: "예약 상품", reservationGuide: "예약 상품이 포함되어 있습니다. LESOUL WeChat으로 보내 입고 예정일, 재고 및 최종 가격을 확인해 주세요.", measurement: "AI 이미지와 상품 사진은 참고용입니다. 실제 크기는 상품 실측(cm)을 기준으로 확인해 주세요.", preview: "구매목록 미리보기", share: "위챗으로 공유", previewReady: "미리보기는 이 화면에서만 확인되며 이미지 파일로 저장되지 않습니다.", newList: "새 구매목록 만들기", message: "안녕하세요. 이 상품들의 재고와 최종 가격을 확인하고 싶습니다. 감사합니다.", copy: "메시지 복사", noAvailable: "현재 구매 가능한 상품이 없습니다.", excluded: "품절 상품은 합계와 공유 이미지에서 제외됩니다.", shareFallback: "이 기기에서는 위챗 공유 시트를 열 수 없습니다. 저장 없이 위챗 앱의 공유 기능을 사용해 주세요.", shareError: "위챗 공유를 시작하지 못했습니다. 이미지는 저장되지 않았습니다." } : language.startsWith("zh") ? { title: "购买清单", size: "尺码", qty: "数量", reference: "商品参考合计", count: "商品数量", wechat: "确认预览后，请直接通过微信分享此图片。", final: "库存和最终价格请与卖家确认。", reservation: "预约商品", reservationGuide: "此清单包含预约商品。请发送给 LESOUL 微信客服确认到货时间、库存及最终价格。", measurement: "AI效果及商品图片仅供参考，实际尺寸请以商品实测数据为准。", preview: "预览购买清单", share: "直接分享到微信", previewReady: "预览只在此页面显示，不会保存图片文件。", newList: "新建购买清单", message: "你好，我想咨询购买这些商品。麻烦帮我确认一下库存和最终价格，谢谢。", copy: "复制消息", noAvailable: "当前没有可购买的商品。", excluded: "已售罄商品不计入合计和分享图片。", shareFallback: "此设备无法打开微信分享面板。图片不会保存，请在微信应用中使用分享功能。", shareError: "无法开始微信分享，图片不会保存。" } : { title: "PURCHASE REQUEST", size: "Size", qty: "Qty", reference: "ITEM TOTAL", count: "Items", wechat: "Review the preview, then share this image directly to WeChat.", final: "Please confirm stock and final price with the seller.", reservation: "RESERVATION ITEM", reservationGuide: "This list includes a reservation item. Ask LESOUL on WeChat to confirm arrival timing, stock, and final price.", measurement: "AI images and product photos are for reference only. Please check the garment’s actual measurements (cm).", preview: "PREVIEW PURCHASE LIST", share: "SHARE TO WECHAT", previewReady: "The preview is shown only on this screen; no image file is saved.", newList: "NEW PURCHASE LIST", message: "Hello, I would like to ask about these items. Please confirm stock and final price. Thank you.", copy: "COPY MESSAGE", noAvailable: "There are no currently available items.", excluded: "Sold-out items are excluded from the total and shared image.", shareFallback: "This device could not open the WeChat share sheet. The image was not saved; please use sharing from the WeChat app.", shareError: "We could not start WeChat sharing. The image was not saved." };
  const availableItems = request.items.filter(isAvailable);
  const containsReservation = availableItems.some((item) => item.purchaseType === "RESERVATION");
  const configuredNotice = language.startsWith("ko") ? request.purchaseNoticeKo || config.data?.purchaseNoticeKo : language.startsWith("zh") ? request.purchaseNoticeZh || config.data?.purchaseNoticeZh : request.purchaseNoticeEn || config.data?.purchaseNoticeEn;
  const notice = containsReservation ? copy.reservationGuide : configuredNotice && !isPersistenceInstruction(configuredNotice) ? configuredNotice : copy.wechat;
  const cardCopy = { ...copy, wechat: notice };
  const fileName = `${request.purchaseRequestId.toLowerCase()}-purchase-request.png`;

  const renderImage = async () => {
    if (!availableItems.length) throw new Error("NO_AVAILABLE_ITEMS");
    return buildRequestImage(request, language, cardCopy);
  };

  const preview = async () => {
    setError("");
    setSharing(true);
    try {
      const image = await renderImage();
      setPreviewBlob(image);
      setPreviewUrl(URL.createObjectURL(image));
      window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event: "purchase_request_previewed", requestId: request.purchaseRequestId, timestamp: Date.now() } }));
    } catch (caught) {
      setError(caught instanceof Error && caught.message === "NO_AVAILABLE_ITEMS" ? copy.noAvailable : copy.shareError);
    } finally {
      setSharing(false);
    }
  };

  const share = async () => {
    setError("");
    setSharing(true);
    try {
      const image = previewBlob ?? await renderImage();
      if (!previewBlob) {
        setPreviewBlob(image);
        setPreviewUrl(URL.createObjectURL(image));
      }
      const file = new File([image], fileName, { type: "image/png" });
      const canShareFiles = typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }));
      if (canShareFiles) {
        await navigator.share({ title: copy.title, text: copy.message, files: [file] });
        window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event: "purchase_request_shared", requestId: request.purchaseRequestId, timestamp: Date.now() } }));
      } else {
        await navigator.clipboard?.writeText(copy.message);
        setError(copy.shareFallback);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error && caught.message === "NO_AVAILABLE_ITEMS" ? copy.noAvailable : copy.shareError);
    } finally {
      setSharing(false);
    }
  };

  return <section className="mt-5 rounded-[1.4rem] border border-[#ded6cb] bg-[#f5f0e9] p-4">
    <p className="text-[10px] font-bold tracking-[.16em] text-[#705e4e]">LESOUL · {copy.title}</p>
    <p className="mt-2 font-serif text-2xl text-[#211a14]">{request.purchaseRequestId}</p>
    {containsReservation && <span className="mt-2 inline-flex rounded-full border border-[#7b6652] bg-[#fffaf4] px-2 py-1 text-[9px] font-bold tracking-[.1em] text-[#604d3c]">{copy.reservation}</span>}
    <p className="mt-2 text-xs leading-5 text-[#675d53]">{notice}<br />{copy.final}</p>
    {availableItems.length !== request.items.length && <p className="mt-3 rounded-xl bg-[#fff7f3] px-3 py-2 text-[11px] font-semibold leading-5 text-[#8f2f28]">{copy.excluded}</p>}
    <FitReferenceNotice context="request" className="mt-3 bg-white/55" />
    {previewUrl ? <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8cfc3] bg-white p-2"><img src={previewUrl} alt={copy.preview} className="h-auto max-h-[70svh] w-full rounded-xl object-contain" /><p className="px-2 py-2 text-[10px] leading-4 text-[#766b60]">{copy.previewReady}</p></div> : <div className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] bg-white/70 px-4 py-7 text-center text-xs text-[#766b60]">{copy.preview}</div>}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <button onClick={preview} disabled={sharing || !availableItems.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white disabled:opacity-50">{sharing ? <LoaderCircle className="animate-spin" size={15} /> : <Eye size={15} />}{copy.preview}</button>
      <button onClick={share} disabled={sharing || !availableItems.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d3c8bc] bg-white text-xs font-semibold disabled:opacity-50"><Share2 size={15} />{copy.share}</button>
    </div>
    <button onClick={() => navigator.clipboard?.writeText(copy.message)} className="mt-2 h-10 w-full rounded-xl border border-[#d3c8bc] bg-white text-xs font-semibold">{copy.copy}</button>
    {error && <p className="mt-3 text-xs leading-5 text-[#8f2f28]" role="status">{error}</p>}
    <button onClick={onNewList} className="mt-2 w-full py-2 text-[11px] font-semibold underline underline-offset-4">{copy.newList}</button>
  </section>;
}
