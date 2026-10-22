import { downloadBlob } from "@/lib/shareCard";
import { localizedProductName } from "@shared/productCommerce";
import NormalizedProductImage from "@/components/NormalizedProductImage";
import { trpc } from "@/lib/trpc";
import { Clipboard, Download, LoaderCircle, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

async function loadImage(url: string) {
  const image = new Image(); image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Unable to load purchase image.")); image.src = url; });
  return image;
}

async function buildPurchaseCard(product: { imageUrl: string; purchaseQrUrl: string; name: string; nameEn: string | null; nameKo: string | null; nameZh: string | null }, language: string, text: { scan: string; instruction: string }) {
  const [productImage, qrImage] = await Promise.all([loadImage(product.imageUrl), loadImage(product.purchaseQrUrl)]);
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1600;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Purchase Card renderer is unavailable.");
  context.fillStyle = "#f8f5ef"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#1d1916"; context.font = "600 74px serif"; context.textAlign = "center"; context.fillText("LESOUL", 540, 105);
  const crop = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => { const scale = Math.max(width / image.width, height / image.height); const w = image.width * scale; const h = image.height * scale; context.save(); context.beginPath(); context.roundRect(x, y, width, height, 30); context.clip(); context.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h); context.restore(); };
  crop(productImage, 160, 170, 760, 600); context.fillStyle = "#1d1916"; context.font = "600 48px serif"; context.fillText(localizedProductName(product, language), 540, 890);
  context.fillStyle = "#fff"; context.fillRect(250, 965, 580, 460); context.drawImage(qrImage, 290, 1005, 500, 380);
  context.fillStyle = "#4b4137"; context.font = "600 32px sans-serif"; context.fillText(text.scan, 540, 1492); context.font = "400 25px sans-serif"; context.fillText(text.instruction, 540, 1542);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create Purchase Card.")), "image/png"));
}

async function downloadQr(url: string, name: string) { const response = await fetch(url); if (!response.ok) throw new Error("QR is unavailable."); downloadBlob(await response.blob(), `${name}-payment-qr.png`); }

export default function PurchaseScreen({ productId, onClose }: { productId: number; onClose: () => void }) {
  const { i18n } = useTranslation(); const language = i18n.language;
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { loading: "Loading purchase details…", soldOut: "Sold Out", consult: "Purchase Inquiry", unavailable: "Temporarily Unavailable", consultBody: "Please contact the seller for purchase information.", unavailableBody: "This product cannot open a new purchase page at the moment.", back: "Back", home: "Home", qrHeading: "PAYMENT QR", qrAlt: "Payment QR code. Long press to save or scan.", scan: "Scan to purchase", scanBody: "Scan the payment QR to pay directly.", note: "PLEASE NOTE", saveCard: "Save Purchase Card", saveQr: "Save QR", copied: "Copied", copyMessage: "Copy Message", message: "Hello, I would like to purchase this item. Here are the product and payment details; please help me confirm them.", cardInstruction: "After payment, please take a screenshot and send it to the seller via WeChat for confirmation.", cardFoot: "Save this card, then contact the seller directly if needed." },
    ko: { loading: "구매 정보를 불러오는 중…", soldOut: "품절", consult: "구매 문의", unavailable: "현재 구매 불가", consultBody: "구매 정보를 문의하려면 판매자에게 연락해 주세요.", unavailableBody: "현재 이 상품의 새로운 구매 페이지를 열 수 없습니다.", back: "뒤로", home: "홈", qrHeading: "결제 QR", qrAlt: "결제 QR 코드입니다. 길게 눌러 저장하거나 스캔하세요.", scan: "스캔하여 구매", scanBody: "결제 QR을 스캔해 직접 결제해 주세요.", note: "구매 전 확인", saveCard: "구매 카드 저장", saveQr: "QR 저장", copied: "복사됨", copyMessage: "결제 안내 복사", message: "안녕하세요, 이 상품을 구매하고 싶습니다. 상품 및 결제 정보를 보내드리니 확인 부탁드립니다.", cardInstruction: "결제 후 화면을 캡처하여 판매자에게 위챗으로 보내 확인받아 주세요.", cardFoot: "카드를 저장한 뒤, 필요한 경우 판매자에게 직접 문의해 주세요." },
    zh: { loading: "正在加载购买信息…", soldOut: "已售罄", consult: "咨询购买", unavailable: "暂时无法购买", consultBody: "请联系卖家咨询购买信息。", unavailableBody: "该商品目前无法开启新的购买页面。", back: "返回", home: "首页", qrHeading: "扫码购买", qrAlt: "付款二维码。长按保存或扫描。", scan: "扫码购买", scanBody: "请使用微信扫描二维码完成付款", note: "购买前须知", saveCard: "保存购买卡", saveQr: "保存二维码", copied: "已复制", copyMessage: "复制说明", message: "你好，我想购买这件商品。这是商品和付款信息，请帮我确认一下。", cardInstruction: "付款后请截图，并微信发送给卖家确认。", cardFoot: "保存图片后，如有需要请直接联系卖家确认。" },
  }[locale];
  const [, navigate] = useLocation();
  const info = trpc.catalog.purchaseInfo.useQuery({ productId }); const [saving, setSaving] = useState<"card" | "qr" | null>(null); const [copied, setCopied] = useState(false);
  const track = (event: string) => window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event, productId, timestamp: Date.now() } }));
  const availableProductId = info.data?.status === "available" ? productId : null;
  useEffect(() => { if (availableProductId) track("purchase_screen_opened"); }, [availableProductId]);
  if (info.isLoading) return <div className="lesoul-safe-modal z-50"><div className="mx-auto grid min-h-64 max-w-sm place-items-center rounded-[1.7rem] bg-white p-6 shadow-2xl"><LoaderCircle className="animate-spin" aria-label={copy.loading} /><span className="sr-only">{copy.loading}</span></div></div>;
  const data = info.data;
  if (!data || data.status !== "available") { const text = data?.status === "sold_out" ? copy.soldOut : data?.status === "consult" ? copy.consult : copy.unavailable; return <div className="lesoul-safe-modal z-50"><div className="mx-auto max-w-sm rounded-[1.7rem] bg-white p-6 text-center shadow-2xl"><button className="ml-auto block" onClick={onClose} aria-label={copy.back}><X size={19} /></button><QrCode className="mx-auto mt-4 text-[#77695b]" size={30} /><h2 className="mt-3 font-serif text-2xl">{text}</h2><p className="mt-2 text-sm leading-5 text-[#777]">{data?.status === "consult" ? copy.consultBody : copy.unavailableBody}</p><button onClick={onClose} className="mt-5 rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white">{copy.back}</button></div></div>; }
  const product = data.product as { id: number; name: string; nameEn: string | null; nameKo: string | null; nameZh: string | null; imageUrl: string; purchaseQrUrl: string };
  const notices = data as { purchaseNoticeEn?: string | null; purchaseNoticeKo?: string | null; purchaseNoticeZh?: string | null };
  const fallbackNotice = language.startsWith("ko") ? "결제 완료 후에는 주문 취소·반품·교환이 어렵습니다. 구매 전 상품 정보를 충분히 확인해 주세요." : language.startsWith("zh") ? "付款完成后通常无法取消、退货或换货。请在购买前充分确认商品信息。" : "Payment is final. Cancellation, return, or exchange may not be available. Please review the product carefully before paying.";
  const purchaseNotice = language.startsWith("ko") ? notices.purchaseNoticeKo || fallbackNotice : language.startsWith("zh") ? notices.purchaseNoticeZh || fallbackNotice : notices.purchaseNoticeEn || fallbackNotice;
  const saveCard = async () => { setSaving("card"); try { downloadBlob(await buildPurchaseCard(product, language, { scan: copy.scan, instruction: copy.cardInstruction }), `lesoul-${product.id}-purchase-card.png`); track("purchase_card_saved"); } finally { setSaving(null); } };
  const saveQr = async () => { setSaving("qr"); try { await downloadQr(product.purchaseQrUrl, `lesoul-${product.id}`); track("qr_saved"); } finally { setSaving(null); } };
  const copyMessage = async () => { await navigator.clipboard?.writeText(copy.message); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <div className="lesoul-safe-modal z-50"><section className="mx-auto max-h-[94svh] max-w-sm overflow-y-auto rounded-[1.7rem] bg-[#f8f5ef] p-4 shadow-2xl"><div className="flex items-center justify-between"><button onClick={onClose} className="text-xs font-semibold text-[#5f564d]">{copy.back}</button><p className="font-serif text-lg tracking-[.16em]">LESOUL</p><button onClick={() => navigate("/")} className="text-xs font-semibold text-[#5f564d]">{copy.home}</button></div><p className="mt-3 text-[10px] font-bold tracking-[.16em] text-[#7c6c5d]">{copy.qrHeading}</p><NormalizedProductImage src={product.imageUrl} alt={localizedProductName(product, language)} className="mt-3 aspect-[4/3] w-full rounded-2xl" /><h2 className="mt-3 font-serif text-2xl">{localizedProductName(product, language)}</h2><div className="mt-4 rounded-2xl bg-white p-3"><img src={product.purchaseQrUrl} alt={copy.qrAlt} className="mx-auto aspect-square w-full max-w-60 object-contain" onLoad={() => track("payment_qr_viewed")} /><p className="mt-2 text-center text-xs text-[#655b51]">{copy.scanBody}</p></div><div className="mt-3 rounded-xl border border-[#d9cfc2] bg-[#fffaf3] p-3"><p className="text-[10px] font-bold tracking-[.12em] text-[#785d44]">{copy.note}</p><p className="mt-1 text-[11px] leading-5 text-[#675c51]">{purchaseNotice}</p></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={saveCard} disabled={saving !== null} className="flex items-center justify-center gap-1 rounded-xl bg-black py-3 text-xs font-semibold text-white disabled:opacity-50">{saving === "card" ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}{copy.saveCard}</button><button onClick={saveQr} disabled={saving !== null} className="flex items-center justify-center gap-1 rounded-xl border border-[#d4cdc4] bg-white py-3 text-xs font-semibold disabled:opacity-50">{saving === "qr" ? <LoaderCircle size={14} className="animate-spin" /> : <QrCode size={14} />}{copy.saveQr}</button></div><button onClick={copyMessage} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-[#d4cdc4] bg-white py-3 text-xs font-semibold"><Clipboard size={14} />{copied ? copy.copied : copy.copyMessage}</button><p className="mt-3 text-center text-[10px] leading-4 text-[#857a70]">{copy.cardFoot}</p></section></div>;
}
