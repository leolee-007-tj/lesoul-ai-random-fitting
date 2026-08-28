import MobileScreen from "@/components/MobileScreen";
import { getVisitorId } from "@/lib/visitor";
import { useAuth } from "@/_core/hooks/useAuth";
import { Crown, Shirt, ShoppingBag, UserRound } from "lucide-react";
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
  return <MobileScreen><main className="lesoul-mobile-frame lesoul-home flex min-h-[calc(100dvh-var(--mobile-nav-height)-var(--safe-area-bottom))] flex-col px-4 pb-5 pt-5 text-center sm:px-6"><div className="flex flex-col items-center border-b border-[#e3ded6] pb-6"><span className="text-[8px] font-bold tracking-[.24em] text-[#8b8378]">{copy.eyebrow}</span><h1 className="mt-2 font-serif text-3xl tracking-[.16em] text-[#171717]">LESOUL</h1><p className="mt-0.5 text-[10px] font-medium tracking-[.2em] text-[#5f5952]">{copy.look}</p><button onClick={() => navigate("/profile")} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#ded8cf] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#4e463e]"><UserRound size={12} />{welcome}<span>→</span></button><p className="mt-3 max-w-72 text-xs leading-5 text-[#777]">{copy.headline}</p></div><div className="grid gap-2.5 py-5 text-left">{isVip && <button onClick={() => navigate("/vip-early-access")} className="rounded-xl border border-[#b89163] bg-[#fff8ee] p-3.5 text-[#3b2a1e]"><span className="flex items-center gap-3"><Crown className="text-[#855d31]" size={19} /><span><b className="block text-[11px] tracking-[.1em]">{copy.vipEarly}</b><small className="mt-0.5 block text-[9px] text-[#735f4d]">{copy.vipEarlyBody}</small></span><span className="ml-auto text-base">→</span></span></button>}<button onClick={() => navigate("/catalog")} className="rounded-xl bg-[#171717] p-4 text-white shadow-[0_10px_20px_rgba(23,23,23,.15)]"><span className="flex items-center gap-3"><ShoppingBag size={19} /><span><b className="block text-[11px] tracking-[.12em]">{copy.browse}</b><small className="mt-0.5 block text-[9px] text-white/70">{copy.browseBody}</small></span><span className="ml-auto text-base">→</span></span></button><button onClick={() => navigate("/style-match")} className="rounded-xl border border-[#d9d2c8] bg-white p-3.5"><span className="flex items-center gap-3"><Shirt size={19} /><span><b className="block text-[11px] tracking-[.1em]">{copy.match}</b><small className="mt-0.5 block text-[9px] text-[#777]">{copy.matchBody}</small></span><span className="ml-auto text-base">→</span></span></button></div><p className="mt-auto pb-1 pt-2 text-[9px] leading-4 text-[#8a837a]">{copy.promise}</p></main></MobileScreen>;
}
