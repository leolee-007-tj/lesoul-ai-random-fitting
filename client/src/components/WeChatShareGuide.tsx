import { Check, Copy, Download, MessageCircleMore } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildProductShareCard, type ProductShareCardData } from "@/lib/productShareCard";
import { downloadBlob } from "@/lib/shareCard";
import { trpc } from "@/lib/trpc";

export function isWeChatUserAgent(userAgent: string): boolean {
  return /micromessenger/i.test(userAgent);
}

export function buildProductShareUrl(locationHref: string, productId: number): string {
  const url = new URL(locationHref);
  url.pathname = "/catalog";
  url.search = "";
  url.searchParams.set("product", String(productId));
  url.searchParams.set("source", "wechat_share");
  return url.toString();
}

export default function WeChatShareGuide({ productId, product }: { productId: number; product?: ProductShareCardData }) {
  const { i18n } = useTranslation();
  const pricing = trpc.purchase.config.useQuery();
  const locale = i18n.language.startsWith("zh") ? "zh" : i18n.language.startsWith("ko") ? "ko" : "en";
  const [isWeChat, setIsWeChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => setIsWeChat(isWeChatUserAgent(window.navigator.userAgent)), []);
  const shareUrl = useMemo(() => typeof window === "undefined" ? "" : buildProductShareUrl(window.location.href, productId), [productId]);
  const copy = locale === "ko"
    ? { title: isWeChat ? "WeChat에서 더 편하게 열기" : "상품 링크 공유", body: isWeChat ? "오른쪽 위 ··· 메뉴에서 ‘브라우저에서 열기’를 선택하면 기본 브라우저로 볼 수 있습니다." : "상품 링크를 복사해 WeChat 대화에 붙여넣을 수 있습니다.", action: copied ? "복사됨" : "상품 링크 복사", card: "공유 카드 저장", making: "카드 생성 중…" }
    : locale === "zh"
      ? { title: isWeChat ? "在微信中更方便地打开" : "分享商品链接", body: isWeChat ? "请点击右上角 ···，选择“在浏览器中打开”，即可使用系统浏览器查看。" : "复制商品链接后可粘贴到微信聊天中分享。", action: copied ? "已复制" : "复制商品链接", card: "保存分享卡", making: "正在生成卡片…" }
      : { title: isWeChat ? "Open more easily from WeChat" : "Share this product", body: isWeChat ? "Tap the ··· menu in the top-right, then choose Open in Browser to continue in your system browser." : "Copy this product link to share it in a WeChat conversation.", action: copied ? "Copied" : "Copy product link", card: "Save share card", making: "Creating card…" };
  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(copy.action, shareUrl);
    }
  };
  const downloadCard = async () => {
    if (!product || downloading) return;
    setDownloading(true);
    try { downloadBlob(await buildProductShareCard({ ...product, pricingMode: pricing.data?.pricingMode, excludeNewArrivalsFromSale: pricing.data?.excludeNewArrivalsFromSale }, locale), `lesoul-product-${productId}.jpg`); } finally { setDownloading(false); }
  };
  return <section className="mt-4 rounded-2xl border border-[#ded8cf] bg-white p-3"><div className="flex gap-2"><MessageCircleMore size={16} className="mt-0.5 shrink-0 text-[#556d52]" aria-hidden="true" /><div><p className="text-xs font-semibold text-[#342d26]">{copy.title}</p><p className="mt-1 text-[10px] leading-4 text-[#72685e]">{copy.body}</p></div></div>{product && <button type="button" onClick={downloadCard} disabled={downloading} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-black px-3 text-[11px] font-semibold text-white disabled:opacity-50"><Download size={14} aria-hidden="true" />{downloading ? copy.making : copy.card}</button>}<button type="button" onClick={copyLink} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#d4cec4] bg-[#fbfaf8] px-3 text-[11px] font-semibold text-[#453d35]">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copy.action}</button></section>;
}
