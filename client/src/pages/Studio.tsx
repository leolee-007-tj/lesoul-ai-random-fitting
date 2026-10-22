import MobileScreen from "@/components/MobileScreen";
import { Shirt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

/** Historical route kept only so older bookmarks can reach curated recommendations safely. */
export default function Studio() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const text = i18n.language.startsWith("ko") ? { title: "관리자 추천 코디", body: "이미지 생성 기능은 종료되었습니다. 매장이 직접 구성한 실제 상품 코디를 확인하세요.", action: "추천 코디 보기" } : i18n.language.startsWith("zh") ? { title: "店主精选搭配", body: "图片生成功能已停止使用。请查看由店主亲自搭配的真实商品造型。", action: "查看精选搭配" } : { title: "CURATED LOOKS", body: "Image generation is no longer available. Explore complete looks personally arranged by the store.", action: "VIEW CURATED LOOKS" };
  return <MobileScreen><main className="lesoul-mobile-frame grid min-h-[60svh] place-items-center px-5 text-center"><section className="max-w-sm rounded-[1.6rem] border border-[#ded8cf] bg-white p-6 shadow-sm"><Shirt className="mx-auto text-[#655a50]" size={28} /><h1 className="mt-4 font-serif text-3xl text-[#2d2722]">{text.title}</h1><p className="mt-3 text-sm leading-6 text-[#70675e]">{text.body}</p><button onClick={() => navigate("/style-match")} className="mt-5 h-11 w-full rounded-xl bg-black text-xs font-bold text-white">{text.action}</button></section></main></MobileScreen>;
}
