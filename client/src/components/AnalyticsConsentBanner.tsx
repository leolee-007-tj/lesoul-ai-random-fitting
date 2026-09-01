import { useState } from "react";
import { BarChart3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/siteAnalytics";

export default function AnalyticsConsentBanner({ onDecision }: { onDecision?: () => void }) {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null);
  if (!visible) return null;
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { title: "방문 통계 안내", body: "서비스 개선을 위해 익명 방문 수와 대략적인 기기 유형·운영체제·브라우저·화면 등급만 수집합니다. IP 주소, 정확한 휴대폰 모델, 연락처와 원문 User-Agent는 저장하지 않습니다.", accept: "허용", decline: "거부", close: "닫기" }
    : locale === "zh"
      ? { title: "访问统计说明", body: "为了改善服务，我们只收集匿名访问次数以及大致的设备类型、操作系统、浏览器和屏幕级别。不保存 IP 地址、准确手机型号、联系方式或原始 User-Agent。", accept: "允许", decline: "拒绝", close: "关闭" }
      : { title: "Anonymous visit analytics", body: "To improve the service, we collect only anonymous visit counts and coarse device type, operating system, browser, and screen class. We do not store IP addresses, exact phone models, contact details, or raw User-Agent strings.", accept: "Allow", decline: "Decline", close: "Close" };
  const decide = (value: "accepted" | "declined") => { setAnalyticsConsent(value); setVisible(false); onDecision?.(); };
  return <aside className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-[#d8d0c6] bg-[#fffdf9] p-4 shadow-[0_18px_45px_rgba(60,45,30,.18)]" role="dialog" aria-label={copy.title}>
    <div className="flex items-start gap-3"><BarChart3 size={18} className="mt-0.5 shrink-0 text-[#5f503f]" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#211b17]">{copy.title}</p><p className="mt-1 text-xs leading-5 text-[#6e655d]">{copy.body}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => decide("accepted")} className="min-h-10 rounded-full bg-[#171412] px-4 text-xs font-bold text-white">{copy.accept}</button><button type="button" onClick={() => decide("declined")} className="min-h-10 rounded-full border border-[#bdb2a6] px-4 text-xs font-bold text-[#332b25]">{copy.decline}</button></div></div><button type="button" onClick={() => decide("declined")} className="rounded-full p-1 text-[#746b63]" aria-label={copy.close}><X size={16} /></button></div>
  </aside>;
}
