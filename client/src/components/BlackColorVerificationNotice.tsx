import { AlertTriangle } from "lucide-react";
import { isBlackLikeColor } from "@shared/productCommerce";
import { useTranslation } from "react-i18next";

export function getBlackColorVerificationNotice(language: string) {
  if (language.startsWith("ko")) return "조명에 따라 사진과 실제 색감이 다르게 보일 수 있습니다. 실물 색상을 확인해 주세요.";
  if (language.startsWith("zh")) return "商品可能因拍摄光线与图片产生色差，请确认实物颜色。";
  return "Colours may look different in photos because of lighting. Please check the actual colour.";
}

export function shouldShowBlackColorVerificationNotice(color: string | null | undefined) {
  return isBlackLikeColor(color);
}

export default function BlackColorVerificationNotice({ color, className = "" }: { color: string | null | undefined; className?: string }) {
  const { i18n } = useTranslation();
  return <aside className={`flex gap-1.5 rounded-lg border border-[#e6dfd6] bg-[#f3efe9]/75 px-2.5 py-1.5 text-[9px] leading-3.5 text-[#81776d] ${className}`}><AlertTriangle size={11} className="mt-0.5 shrink-0 text-[#a79a8d]" aria-hidden="true" /><p>{getBlackColorVerificationNotice(i18n.language)}</p></aside>;
}
