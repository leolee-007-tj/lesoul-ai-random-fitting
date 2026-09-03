import { useTranslation } from "react-i18next";

export default function AnonymousAnalyticsNotice() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? "서비스 개선을 위해 개인을 식별하지 않는 익명 고유 방문자 수만 집계합니다."
    : locale === "zh"
      ? "为了改善服务，我们只统计无法识别个人的匿名独立访客数量。"
      : "For service improvement, we count only anonymous unique visitors that do not identify individuals.";
  return <p className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e1d8] bg-[#fffdf9]/95 px-4 py-2 text-center text-[10px] leading-4 text-[#756c63] backdrop-blur-sm" role="note">{copy}</p>;
}
