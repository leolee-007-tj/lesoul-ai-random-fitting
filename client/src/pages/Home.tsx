import MobileScreen from "@/components/MobileScreen";
import { getVisitorId } from "@/lib/visitor";
import { useAuth } from "@/_core/hooks/useAuth";
import { Crown, Shirt, ShoppingBag, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { anonymousNickname } from "@shared/anonymousNickname";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [anonymousVisitorId] = useState(() => getVisitorId());
  const visitorId = user?.openId ? `account:${user.openId}` : anonymousVisitorId;
  const language = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: { eyebrow: "LESOUL CURATED FASHION", look: "CURATED LOOKS", headline: "Discover real pieces and complete looks selected by LESOUL.", match: "CURATED RECOMMENDATIONS", matchBody: "Explore complete looks selected and arranged by the LESOUL administrator.", browse: "BROWSE PRODUCTS", browseBody: "Explore all active pieces by category", vipEarly: "VIP EARLY ACCESS", vipEarlyBody: "See selected pieces and prices before public release", promise: "Discover looks from real LESOUL pieces, selected by the store." },
    ko: { eyebrow: "LESOUL 큐레이션 패션", look: "큐레이션 LOOK", headline: "LESOUL이 직접 선택한 실제 상품과 완성 코디를 만나보세요.", match: "관리자 추천 코디", matchBody: "LESOUL 관리자가 직접 선택하고 구성한 완성 코디를 확인하세요.", browse: "상품 둘러보기", browseBody: "상의·하의 등 종류별 모든 상품 보기", vipEarly: "VIP 선공개 상품", vipEarlyBody: "일반 공개 전 상품 사진과 가격 먼저 보기", promise: "매장이 직접 선택한 실제 LESOUL 상품 코디를 만나보세요." },
    zh: { eyebrow: "LESOUL 精选时尚", look: "精选造型", headline: "发现由 LESOUL 亲自挑选的真实商品与完整搭配。", match: "店主精选搭配", matchBody: "查看由 LESOUL 店主亲自挑选和搭配的完整造型。", browse: "浏览商品", browseBody: "按品类查看全部在售商品", vipEarly: "VIP 抢先看", vipEarlyBody: "公开前优先查看商品图片和价格", promise: "发现由店铺亲自挑选的真实 LESOUL 商品搭配。" },
  }[language];
  const profileName = user?.name || anonymousNickname(visitorId, language);
  const welcome = language === "ko" ? `${profileName}님, 어서오세요` : language === "zh" ? `${profileName}，欢迎回来` : `Welcome back, ${profileName}`;
  const isVip = user?.role === "vip" || user?.role === "admin";
  return <MobileScreen><main className="lesoul-mobile-frame lesoul-home flex min-h-[calc(100dvh-var(--mobile-nav-height)-var(--safe-area-bottom))] flex-col px-6 pb-5 pt-[max(2rem,var(--safe-area-top))] text-center"><div className="flex flex-1 flex-col items-center justify-center pb-12"><span className="text-[9px] font-bold tracking-[.26em] text-[#8b8378]">{copy.eyebrow}</span><h1 className="mt-3 font-serif text-4xl tracking-[.18em] text-[#171717]">LESOUL</h1><p className="mt-1 text-sm font-light tracking-[.26em] text-[#272727]">{copy.look}</p><button onClick={() => navigate("/profile")} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ded8cf] bg-white px-3 py-2 text-xs font-semibold text-[#4e463e]"><UserRound size={13} />{welcome}<span>→</span></button><p className="mt-3 max-w-60 text-sm leading-5 text-[#777]">{copy.headline}</p></div><div className="grid gap-3 py-6 text-left">{isVip && <button onClick={() => navigate("/vip-early-access")} className="rounded-[1.4rem] border border-[#b89163] bg-[#fff8ee] p-4 text-[#3b2a1e]"><span className="flex items-center gap-3"><Crown className="text-[#855d31]" size={22} /><span><b className="block text-xs tracking-[.12em]">{copy.vipEarly}</b><small className="mt-1 block text-[10px] text-[#735f4d]">{copy.vipEarlyBody}</small></span><span className="ml-auto text-lg">→</span></span></button>}<button onClick={() => navigate("/style-match")} className="rounded-[1.4rem] border border-[#d9d2c8] bg-white p-4"><span className="flex items-center gap-3"><Shirt size={23} /><span><b className="block text-xs tracking-[.12em]">{copy.match}</b><small className="mt-1 block text-[10px] text-[#777]">{copy.matchBody}</small></span><span className="ml-auto text-lg">→</span></span></button><button onClick={() => navigate("/catalog")} className="rounded-[1.4rem] bg-[#171717] p-4 text-white shadow-[0_14px_28px_rgba(23,23,23,.18)]"><span className="flex items-center gap-3"><ShoppingBag size={21} /><span><b className="block text-xs tracking-[.12em]">{copy.browse}</b><small className="mt-1 block text-[10px] text-white/70">{copy.browseBody}</small></span><span className="ml-auto text-lg">→</span></span></button></div><p className="pb-2 pt-5 text-[10px] leading-4 text-[#8a837a]">{copy.promise}</p></main></MobileScreen>;
}
