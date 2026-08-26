import { AlertTriangle } from "lucide-react";
import { isBlackLikeColor } from "@shared/productCommerce";
import { useTranslation } from "react-i18next";

export function getBlackColorVerificationNotice(language: string) {
  if (language.startsWith("ko")) return "블랙 색상은 조명에 따라 사진과 실제 색감이 다르게 보일 수 있습니다. 실물 색상을 반드시 확인해 주세요.";
  if (language.startsWith("zh")) return "黑色商品会因拍摄光线与图片产生色差，请务必确认实物颜色。";
  return "Black items can look different in photos because of lighting. Please verify the actual colour before purchasing.";
}

export function shouldShowBlackColorVerificationNotice(color: string | null | undefined) {
  return isBlackLikeColor(color);
}

export default function BlackColorVerificationNotice({ color, className = "" }: { color: string | null | undefined; className?: string }) {
  const { i18n } = useTranslation();
  if (!shouldShowBlackColorVerificationNotice(color)) return null;
  return <aside className={`flex gap-1.5 rounded-lg bg-[#201b18] px-2 py-1.5 text-[9px] leading-3.5 text-white shadow-sm ${className}`}><AlertTriangle size={12} className="mt-0.5 shrink-0 text-[#f3c477]" aria-hidden="true" /><p>{getBlackColorVerificationNotice(i18n.language)}</p></aside>;
}
