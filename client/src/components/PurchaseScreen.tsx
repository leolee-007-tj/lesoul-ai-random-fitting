import { downloadBlob } from "@/lib/shareCard";
import { formatPrice } from "@/lib/localeFormat";
import { localizedProductName } from "@shared/productCommerce";
import { trpc } from "@/lib/trpc";
import { Clipboard, Download, LoaderCircle, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

async function loadImage(url: string) {
  const image = new Image(); image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Unable to load purchase image.")); image.src = url; });
  return image;
}

async function buildPurchaseCard(product: { imageUrl: string; purchaseQrUrl: string; name: string; nameEn: string | null; nameKo: string | null; nameZh: string | null; price: number }, language: string) {
  const [productImage, qrImage] = await Promise.all([loadImage(product.imageUrl), loadImage(product.purchaseQrUrl)]);
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1600;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Purchase Card renderer is unavailable.");
  context.fillStyle = "#f8f5ef"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#1d1916"; context.font = "600 74px serif"; context.textAlign = "center"; context.fillText("LESOUL", 540, 105);
  const crop = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => { const scale = Math.max(width / image.width, height / image.height); const w = image.width * scale; const h = image.height * scale; context.save(); context.beginPath(); context.roundRect(x, y, width, height, 30); context.clip(); context.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h); context.restore(); };
  crop(productImage, 160, 170, 760, 600); context.fillStyle = "#1d1916"; context.font = "600 48px serif"; context.fillText(localizedProductName(product, language), 540, 845); context.font = "500 36px sans-serif"; context.fillText(formatPrice(product.price, language), 540, 900);
  context.fillStyle = "#fff"; context.fillRect(250, 965, 580, 460); context.drawImage(qrImage, 290, 1005, 500, 380);
  context.fillStyle = "#4b4137"; context.font = "600 32px sans-serif"; context.fillText("扫码购买", 540, 1492); context.font = "400 25px sans-serif"; context.fillText("付款后请截图，并微信发送给卖家确认。", 540, 1542);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create Purchase Card.")), "image/png"));
}

async function downloadQr(url: string, name: string) { const response = await fetch(url); if (!response.ok) throw new Error("QR is unavailable."); downloadBlob(await response.blob(), `${name}-payment-qr.png`); }

export default function PurchaseScreen({ productId, onClose }: { productId: number; onClose: () => void }) {
  const { i18n } = useTranslation(); const language = i18n.language;
  const info = trpc.catalog.purchaseInfo.useQuery({ productId }); const [saving, setSaving] = useState<"card" | "qr" | null>(null); const [copied, setCopied] = useState(false);
  const track = (event: string) => window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event, productId, timestamp: Date.now() } }));
  const availableProductId = info.data?.status === "available" ? productId : null;
  useEffect(() => { if (availableProductId) track("purchase_screen_opened"); }, [availableProductId]);
  if (info.isLoading) return <div className="lesoul-safe-modal z-50"><div className="mx-auto grid min-h-64 max-w-sm place-items-center rounded-[1.7rem] bg-white p-6 shadow-2xl"><LoaderCircle className="animate-spin" /></div></div>;
  const data = info.data;
  if (!data || data.status !== "available") { const text = data?.status === "sold_out" ? "已售罄" : data?.status === "consult" ? "咨询购买" : "暂时无法购买"; return <div className="lesoul-safe-modal z-50"><div className="mx-auto max-w-sm rounded-[1.7rem] bg-white p-6 text-center shadow-2xl"><button className="ml-auto block" onClick={onClose}><X size={19} /></button><QrCode className="mx-auto mt-4 text-[#77695b]" size={30} /><h2 className="mt-3 font-serif text-2xl">{text}</h2><p className="mt-2 text-sm leading-5 text-[#777]">{data?.status === "consult" ? "请联系卖家咨询购买信息。" : "该商品目前无法开启新的购买页面。"}</p><button onClick={onClose} className="mt-5 rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white">返回</button></div></div>; }
  const product = data.product as { id: number; name: string; nameEn: string | null; nameKo: string | null; nameZh: string | null; imageUrl: string; price: number; purchaseQrUrl: string };
  const saveCard = async () => { setSaving("card"); try { downloadBlob(await buildPurchaseCard(product, language), `lesoul-${product.id}-purchase-card.png`); track("purchase_card_saved"); } finally { setSaving(null); } };
  const saveQr = async () => { setSaving("qr"); try { await downloadQr(product.purchaseQrUrl, `lesoul-${product.id}`); track("qr_saved"); } finally { setSaving(null); } };
  const copyMessage = async () => { await navigator.clipboard?.writeText("你好，我想购买这件商品。这是商品和付款信息，请帮我确认一下。"); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <div className="lesoul-safe-modal z-50"><section className="mx-auto max-h-[94svh] max-w-sm overflow-y-auto rounded-[1.7rem] bg-[#f8f5ef] p-4 shadow-2xl"><div className="flex items-center justify-between"><p className="font-serif text-lg tracking-[.16em]">LESOUL</p><button onClick={onClose} aria-label="Close purchase screen"><X size={20} /></button></div><p className="mt-2 text-[10px] font-bold tracking-[.16em] text-[#7c6c5d]">扫码购买</p><img src={product.imageUrl} alt={localizedProductName(product, language)} className="mt-3 aspect-[4/3] w-full rounded-2xl bg-[#e7e0d6] object-cover" /><h2 className="mt-3 font-serif text-2xl">{localizedProductName(product, language)}</h2><p className="mt-1 text-lg font-semibold">{formatPrice(product.price, language)}</p><div className="mt-4 rounded-2xl bg-white p-3"><img src={product.purchaseQrUrl} alt="Payment QR code. Long press to save or scan." className="mx-auto aspect-square w-full max-w-60 object-contain" onLoad={() => track("payment_qr_viewed")} /><p className="mt-2 text-center text-xs text-[#655b51]">请使用微信扫描二维码完成付款</p><p className="mt-1 text-center text-[11px] text-[#7b7167]">付款后请截图，并微信发送给卖家确认。</p></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={saveCard} disabled={saving !== null} className="flex items-center justify-center gap-1 rounded-xl bg-black py-3 text-xs font-semibold text-white disabled:opacity-50">{saving === "card" ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}保存购买页面</button><button onClick={saveQr} disabled={saving !== null} className="flex items-center justify-center gap-1 rounded-xl border border-[#d4cdc4] bg-white py-3 text-xs font-semibold disabled:opacity-50">{saving === "qr" ? <LoaderCircle size={14} className="animate-spin" /> : <QrCode size={14} />}保存二维码</button></div><button onClick={copyMessage} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-[#d4cdc4] bg-white py-3 text-xs font-semibold"><Clipboard size={14} />{copied ? "已复制" : "复制说明"}</button><p className="mt-3 text-center text-[10px] leading-4 text-[#857a70]">保存图片后，请在微信个人聊天中发送给卖家确认。</p></section></div>;
}
