import MobileScreen from "@/components/MobileScreen";
import { Camera, Shirt, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "PERSONAL AI FASHION STUDIO", aiLook: "AI LOOK", fitting: "AI FITTING", fittingBody: "Try on with your model or photo", quick: "QUICK FIT", quickBody: "Fast styling with real products only", browse: "BROWSE PRODUCTS", browseBody: "Explore all active pieces by category", promise: "Style your LOOK with real LESOUL pieces." },
    ko: { eyebrow: "퍼스널 AI 패션 스튜디오", aiLook: "AI 룩", fitting: "AI 피팅", fittingBody: "내 체형 또는 사진으로 입어보기", quick: "빠른 피팅", quickBody: "사람 없이 코디만 빠르게 보기", browse: "상품 둘러보기", browseBody: "상의·하의 등 종류별 모든 상품 보기", promise: "실제 LESOUL 상품으로 나만의 LOOK을 완성하세요." },
    zh: { eyebrow: "个人 AI 时尚工作室", aiLook: "AI 造型", fitting: "AI 试穿", fittingBody: "用我的身材或照片试穿", quick: "快速试穿", quickBody: "快速查看真实商品搭配", browse: "浏览商品", browseBody: "按品类查看全部在售商品", promise: "用真实 LESOUL 商品完成你的 LOOK。" },
  }[language];

  return <MobileScreen><main className="lesoul-mobile-frame lesoul-home flex min-h-[calc(100dvh-var(--mobile-nav-height)-var(--safe-area-bottom))] flex-col px-6 pb-5 pt-[max(2rem,var(--safe-area-top))] text-center"><div className="flex flex-1 flex-col items-center justify-center pb-12"><span className="text-[9px] font-bold tracking-[.26em] text-[#8b8378]">{copy.eyebrow}</span><h1 className="mt-3 font-serif text-4xl tracking-[.18em] text-[#171717]">LESOUL</h1><p className="mt-1 text-sm font-light tracking-[.26em] text-[#272727]">{copy.aiLook}</p><p className="mt-3 max-w-60 text-sm leading-5 text-[#777]">{t("home.headline")}</p></div><div className="grid gap-3 py-6 text-left"><button onClick={() => navigate("/body-model")} className="rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_25%,#e7dace,#a88769)] p-4 text-white shadow-[0_14px_28px_rgba(111,82,59,.22)]"><span className="flex items-center gap-3"><Camera size={23} /><span><b className="block text-xs tracking-[.12em]">{copy.fitting}</b><small className="mt-1 block text-[10px] text-white/80">{copy.fittingBody}</small></span><span className="ml-auto text-lg">→</span></span></button><button onClick={() => navigate("/quick-fit")} className="rounded-[1.4rem] border border-[#d9d2c8] bg-white p-4"><span className="flex items-center gap-3"><Shirt size={23} /><span><b className="block text-xs tracking-[.12em]">{copy.quick}</b><small className="mt-1 block text-[10px] text-[#777]">{copy.quickBody}</small></span><span className="ml-auto text-lg">→</span></span></button><button onClick={() => navigate("/catalog")} className="rounded-2xl border border-dashed border-[#cfc4b8] bg-[#f8f5ef] px-4 py-3"><span className="flex items-center gap-3"><ShoppingBag size={18} /><span><b className="block text-[10px] tracking-[.12em] text-[#40372e]">{copy.browse}</b><small className="mt-1 block text-[10px] text-[#777]">{copy.browseBody}</small></span><span className="ml-auto text-base text-[#544a40]">→</span></span></button></div><p className="pb-2 text-[10px] leading-4 text-[#8a837a]">{copy.promise}</p></main></MobileScreen>;
}
