import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

type NoticeContext = "result" | "detail" | "purchase" | "request";

export function getFitReferenceNotice(language: string, context: NoticeContext) {
  const text = language.startsWith("ko")
    ? {
        result: "AI 피팅 이미지는 착용 참고용입니다. 실제 핏과 차이가 있을 수 있으니 구매 전 반드시 상품 실측 사이즈(cm)를 확인해 주세요.",
        detail: "상품사진 및 AI 착용 이미지는 참고용입니다. 실제 크기는 아래 실측 사이즈를 기준으로 확인해 주시고, 촬영 당시 조명 환경의 영향으로 실제 제품의 색상과 약간의 차이가 있을 수 있습니다.",
        purchase: "구매 전 실측 사이즈를 확인해 주세요.",
        request: "AI 이미지 및 상품사진은 참고용이며, 실제 크기는 상품 실측 사이즈를 기준으로 확인해 주세요.",
      }
    : language.startsWith("zh")
      ? {
          result: "AI试穿效果仅供穿搭参考，实际穿着效果可能存在差异。购买前请务必确认商品实际测量尺寸（cm）。",
          detail: "商品图片及AI试穿效果仅供参考。实际尺寸请以下方实测尺寸为准；受拍摄时光线环境影响，实际产品颜色可能略有差异。",
          purchase: "购买前请确认商品实测尺寸。",
          request: "AI效果及商品图片仅供参考，实际尺寸请以商品实测数据为准。",
        }
      : {
          result: "AI fitting images are for visual reference only. Actual fit may vary. Please check the garment’s actual measurements (cm) before purchasing.",
          detail: "Product photos and AI fitting images are for reference only. Please use the actual measurements below to check garment size. Actual product color may vary slightly because of lighting during photography.",
          purchase: "Please check the actual measurements before purchasing.",
          request: "AI images and product photos are for reference only. Please check the garment’s actual measurements before purchasing.",
        };
  return text[context];
}

export default function FitReferenceNotice({ context, className = "" }: { context: NoticeContext; className?: string }) {
  const { i18n } = useTranslation();
  return <aside className={`flex gap-2 rounded-xl bg-[#eee8df] px-3 py-2.5 text-[10px] leading-4 text-[#706458] ${className}`}><Info size={13} className="mt-0.5 shrink-0 text-[#867563]" aria-hidden="true" /><p>{getFitReferenceNotice(i18n.language, context)}</p></aside>;
}
