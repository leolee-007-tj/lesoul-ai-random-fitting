import { Copy, Download, QrCode, Share2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

type SaveState = "idle" | "saving" | "saved" | "fallback";
type LinkState = "idle" | "copied" | "shared" | "fallback";

async function saveQrImage(url: string, filename: string) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`QR image request failed: ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

export default function StoreInquiryQr({ className = "", productId, compact = false }: { className?: string; productId?: number; compact?: boolean }) {
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [linkState, setLinkState] = useState<LinkState>("idle");
  const config = trpc.purchase.config.useQuery(undefined, { staleTime: 60_000 });
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { label: "매장문의", missing: "위챗으로 가격을 문의해 주세요", alt: "매장 문의용 위챗 QR 코드", enlarge: "QR 크게 보기", close: "QR 닫기", save: "이미지 저장", saving: "저장 중…", saved: "저장되었습니다", fallback: "이 브라우저에서는 자동 저장이 제한됩니다. QR을 길게 눌러 사진 앱에 저장해 주세요.", guide: "이 QR을 스크린샷하거나 길게 눌러 WeChat에서 스캔해 주세요", share: "상품 링크 공유", copied: "상품 링크가 복사되었습니다", shared: "공유 창을 열었습니다", linkFallback: "자동 복사가 제한됩니다. 아래 링크를 길게 눌러 복사해 주세요." }
    : locale === "zh"
      ? { label: "店铺咨询", missing: "请通过微信咨询价格", alt: "店铺咨询微信二维码", enlarge: "查看大二维码", close: "关闭二维码", save: "保存图片", saving: "保存中…", saved: "已保存", fallback: "当前浏览器限制自动保存，请长按二维码保存到相册。", guide: "请截图此二维码，或长按后在微信中识别", share: "分享商品链接", copied: "商品链接已复制", shared: "已打开分享窗口", linkFallback: "当前浏览器限制自动复制，请长按下方链接复制。" }
      : { label: "STORE INQUIRY", missing: "Please ask the store for the price on WeChat", alt: "WeChat QR code for store inquiry", enlarge: "View large QR", close: "Close QR", save: "Save image", saving: "Saving…", saved: "Saved", fallback: "Automatic saving is limited in this browser. Long-press the QR to save it to Photos.", guide: "Screenshot this QR or long-press it to scan in WeChat", share: "Share product link", copied: "Product link copied", shared: "Share sheet opened", linkFallback: "Automatic copying is limited. Long-press the link below to copy it." };
  const qrUrl = config.data?.adminTrialPaymentQrUrl ?? null;
  const displayLabel = compact && locale === "ko" ? "점원 문의" : compact && locale === "zh" ? "店员咨询" : compact ? "Ask staff" : copy.label;
  const productUrl = productId ? `${window.location.origin}/share/product/${productId}?lang=${locale}` : null;
  const handleSave = async () => {
    if (!qrUrl || saveState === "saving") return;
    setSaveState("saving");
    try { await saveQrImage(qrUrl, "lesoul-wechat-qr.png"); setSaveState("saved"); } catch { setSaveState("fallback"); window.open(qrUrl, "_blank", "noopener,noreferrer"); }
  };
  const handleShare = async () => {
    if (!productUrl) return;
    setLinkState("idle");
    try {
      if (navigator.share) { await navigator.share({ title: document.title, url: productUrl }); setLinkState("shared"); return; }
      await navigator.clipboard.writeText(productUrl); setLinkState("copied");
    } catch {
      try { await navigator.clipboard.writeText(productUrl); setLinkState("copied"); } catch { setLinkState("fallback"); }
    }
  };
  return <>
    <div className={`w-full ${className}`}>
      <button type="button" data-store-inquiry-qr="true" onClick={() => qrUrl && setExpanded(true)} disabled={!qrUrl} aria-label={qrUrl ? `${displayLabel} · ${copy.enlarge}` : copy.missing} className={`flex ${compact ? "min-h-9 rounded-lg px-2.5 py-1.5" : "min-h-12 rounded-xl px-3 py-2"} w-full items-center justify-between gap-2 border border-[#ded5cb] bg-white text-left transition active:scale-[.99] disabled:cursor-default ${qrUrl ? "cursor-pointer hover:border-[#bda993]" : ""}`}>
        {compact ? <span className="truncate text-[10px] font-bold text-[#4d4238]">{displayLabel}</span> : <span className="min-w-0"><span className="block text-xs font-bold tracking-[.08em] text-[#4d4238]">{copy.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-[#897c70]">{qrUrl ? copy.missing : `${copy.missing} · WeChat QR ${locale === "ko" ? "미설정" : locale === "zh" ? "未设置" : "not configured"}`}</span></span>}
        {qrUrl ? <img src={qrUrl} alt={copy.alt} className={`${compact ? "size-8 rounded" : "size-12 rounded-md"} shrink-0 object-contain`} /> : <span className={`${compact ? "size-8 rounded" : "size-12 rounded-md"} grid shrink-0 place-items-center bg-[#f1ece5] text-[#9a8d80]`} aria-hidden="true"><QrCode size={compact ? 15 : 20} /></span>}
      </button>
      {productUrl && <button type="button" onClick={() => void handleShare()} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d8cec2] bg-white px-3 text-[10px] font-semibold text-[#5d5147] active:scale-[.98]"><Share2 size={14} />{linkState === "copied" ? copy.copied : linkState === "shared" ? copy.shared : copy.share}</button>}
      {linkState === "fallback" && productUrl && <p className="mt-1 break-all text-[10px] leading-4 text-[#8a5d43]">{copy.linkFallback}<br /><span className="select-text text-[#6f6258]">{productUrl}</span></p>}
    </div>
    {expanded && qrUrl && <div className="lesoul-safe-modal z-[70]" role="dialog" aria-modal="true" aria-label={copy.enlarge} onClick={() => { setExpanded(false); setSaveState("idle"); }}><section className="relative mx-auto w-full max-w-sm rounded-[1.7rem] bg-white p-5 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => { setExpanded(false); setSaveState("idle"); }} aria-label={copy.close} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[#f3eee7] text-[#4d4238]"><X size={18} /></button><p className="pt-2 text-sm font-bold tracking-[.1em] text-[#4d4238]">{copy.label}</p><p className="mt-2 text-xs leading-5 text-[#897c70]">{copy.missing}</p><div className="mx-auto mt-5 w-full max-w-[min(78vw,320px)] rounded-2xl bg-white p-3 shadow-[0_8px_28px_rgba(45,34,25,.12)]"><img src={qrUrl} alt={copy.alt} className="block aspect-square w-full object-contain" /></div><button type="button" onClick={() => void handleSave()} disabled={saveState === "saving"} className="mx-auto mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#191512] px-5 py-2.5 text-xs font-semibold text-white transition active:scale-[.98] disabled:opacity-60"><Download size={15} />{saveState === "saving" ? copy.saving : saveState === "saved" ? copy.saved : copy.save}</button>{saveState === "fallback" && <p className="mx-auto mt-2 max-w-[280px] text-[10px] leading-4 text-[#8a5d43]">{copy.fallback}</p>}<p className="mt-4 text-[11px] leading-5 text-[#766b60]">{copy.guide}</p></section></div>}
  </>;
}

export function isPriceVisibleToRole(role: string | null | undefined) {
  return role === "vip" || role === "admin";
}

export function inquiryLabelForLanguage(language: string) {
  return language.startsWith("ko") ? "매장문의" : language.startsWith("zh") ? "店铺咨询" : "STORE INQUIRY";
}

export function inquiryBodyForLanguage(language: string) {
  return language.startsWith("ko") ? "위챗으로 가격을 문의해 주세요" : language.startsWith("zh") ? "请通过微信咨询价格" : "Please ask the store for the price on WeChat";
}
