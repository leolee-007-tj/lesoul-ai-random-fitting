import { QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

export default function StoreInquiryQr({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const config = trpc.purchase.config.useQuery(undefined, { staleTime: 60_000 });
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko" ? { label: "매장문의", missing: "위챗으로 가격을 문의해 주세요", alt: "매장 문의용 위챗 QR 코드" } : locale === "zh" ? { label: "店铺咨询", missing: "请通过微信咨询价格", alt: "店铺咨询微信二维码" } : { label: "STORE INQUIRY", missing: "Please ask the store for the price on WeChat", alt: "WeChat QR code for store inquiry" };
  const qrUrl = config.data?.adminTrialPaymentQrUrl ?? null;
  return <div data-store-inquiry-qr="true" className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#ded5cb] bg-white px-3 py-2 ${className}`}><div className="min-w-0"><p className="text-xs font-bold tracking-[.08em] text-[#4d4238]">{copy.label}</p><p className="mt-0.5 text-[10px] leading-4 text-[#897c70]">{qrUrl ? copy.missing : `${copy.missing} · WeChat QR ${locale === "ko" ? "미설정" : locale === "zh" ? "未设置" : "not configured"}`}</p></div>{qrUrl ? <img src={qrUrl} alt={copy.alt} className="size-12 shrink-0 rounded-md object-contain" /> : <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#f1ece5] text-[#9a8d80]" aria-label={copy.missing}><QrCode size={20} /></span>}</div>;
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
