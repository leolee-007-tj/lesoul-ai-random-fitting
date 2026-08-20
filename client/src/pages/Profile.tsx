import MobileScreen from "@/components/MobileScreen";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePurchaseList, type PurchaseListItem } from "@/contexts/PurchaseListContext";
import { getVisitorId } from "@/lib/visitor";
import { readHistory, type LookHistory } from "@/lib/mvpStore";
import { anonymousNickname } from "@shared/anonymousNickname";
import { Archive, ArrowRight, Heart, ReceiptText, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type PreviousRequest = { requestId?: string; createdAt?: string; items?: Array<{ productId?: number; name?: string; imageUrl?: string; quantity?: number }> };

function purchaseItemName(item: PurchaseListItem, locale: "en" | "ko" | "zh") {
  return locale === "ko" ? item.nameKo || item.productName : locale === "zh" ? item.nameZh || item.productName : item.nameEn || item.productName;
}

export default function Profile() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { items } = usePurchaseList();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const [looks, setLooks] = useState<LookHistory[]>([]);
  const [previousRequest, setPreviousRequest] = useState<PreviousRequest | null>(null);
  const visitorId = user?.openId ? `account:${user.openId}` : getVisitorId();
  const displayName = user?.name || anonymousNickname(visitorId, locale);
  const copy = {
    en: { eyebrow: "MY LESOUL", welcome: `${displayName}, welcome back`, vip: "VIP MEMBER", normal: "LESOUL MEMBER", looks: "SAVED LOOKS", interest: "INTERESTED PIECES", purchase: "PREVIOUS PURCHASE REQUEST", noLooks: "No saved looks yet.", noInterest: "Add pieces you love from the catalog.", noPurchase: "Your purchase request will appear here.", viewAll: "View all", explore: "Browse products", create: "Create a LOOK", request: "Open purchase list", requestItems: "items" },
    ko: { eyebrow: "나의 LESOUL", welcome: `${displayName}님, 어서오세요`, vip: "VIP 회원", normal: "LESOUL 회원", looks: "저장한 룩", interest: "관심 상품", purchase: "이전 구매 요청", noLooks: "아직 저장한 룩이 없습니다.", noInterest: "마음에 드는 상품을 관심 목록에 담아보세요.", noPurchase: "구매 요청을 만들면 이곳에 표시됩니다.", viewAll: "전체 보기", explore: "상품 둘러보기", create: "LOOK 만들기", request: "구매목록 열기", requestItems: "개 상품" },
    zh: { eyebrow: "我的 LESOUL", welcome: `${displayName}，欢迎回来`, vip: "VIP 会员", normal: "LESOUL 会员", looks: "已保存造型", interest: "感兴趣的商品", purchase: "过往购买请求", noLooks: "还没有保存的造型。", noInterest: "从商品目录添加喜欢的单品。", noPurchase: "创建购买请求后会显示在这里。", viewAll: "查看全部", explore: "浏览商品", create: "创建 LOOK", request: "打开购买清单", requestItems: "件商品" },
  }[locale];

  useEffect(() => {
    setLooks(readHistory().slice(0, 3));
    try {
      const raw = localStorage.getItem("lesoulPurchaseRequest");
      setPreviousRequest(raw ? JSON.parse(raw) as PreviousRequest : null);
    } catch { setPreviousRequest(null); }
  }, []);

  const recentInterest = useMemo(() => items.slice(0, 3), [items]);
  const requestItems = previousRequest?.items ?? [];
  return <MobileScreen><main className="lesoul-mobile-frame min-h-[calc(100dvh-var(--mobile-nav-height)-var(--safe-area-bottom))] px-4 pb-7 pt-4 sm:px-6">
    <header className="rounded-[1.6rem] bg-[#171717] p-5 text-white"><p className="text-[10px] font-bold tracking-[.18em] text-white/60">{copy.eyebrow}</p><h1 className="mt-2 font-serif text-3xl">{copy.welcome}</h1><p className="mt-2 text-xs text-white/70">{user?.role === "vip" ? copy.vip : copy.normal}</p></header>
    <section className="mt-5"><SectionHeader label={copy.looks} onClick={() => navigate("/history")} text={copy.viewAll} />{looks.length ? <div className="mt-3 grid grid-cols-3 gap-2">{looks.map((look) => <button key={look.id} onClick={() => navigate("/history")} className="overflow-hidden rounded-xl bg-[#eee9e2] text-left"><img src={look.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" /><p className="truncate px-2 py-1.5 text-[9px] font-semibold text-[#4d463f]">{look.productNames[0] ?? "LESOUL LOOK"}</p></button>)}</div> : <Empty icon={Archive} text={copy.noLooks} action={copy.create} onClick={() => navigate("/body-model")} />}</section>
    <section className="mt-6"><SectionHeader label={copy.interest} onClick={() => navigate("/purchase-list")} text={copy.viewAll} />{recentInterest.length ? <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{recentInterest.map((item) => <button key={`${item.productId}-${item.selectedSize}`} onClick={() => navigate("/purchase-list")} className="w-28 shrink-0 overflow-hidden rounded-xl border border-[#e2ddd5] bg-white text-left"><img src={item.productImage} alt={purchaseItemName(item, locale)} className="aspect-square w-full object-cover" /><p className="truncate px-2 py-2 text-[10px] font-semibold">{purchaseItemName(item, locale)}</p></button>)}</div> : <Empty icon={Heart} text={copy.noInterest} action={copy.explore} onClick={() => navigate("/catalog")} />}</section>
    <section className="mt-6 rounded-2xl border border-[#e2ddd5] bg-white p-4"><div className="flex items-center gap-2"><ReceiptText size={16} /><p className="text-[10px] font-bold tracking-[.15em] text-[#766b60]">{copy.purchase}</p></div>{requestItems.length ? <div className="mt-3 flex items-center gap-3"><div className="flex -space-x-2">{requestItems.slice(0, 3).map((item, index) => <img key={`${item.productId ?? index}-${index}`} src={item.imageUrl} alt="" className="size-10 rounded-full border-2 border-white object-cover" />)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{requestItems.map((item) => item.name).filter(Boolean).join(" · ")}</p><p className="mt-1 text-[10px] text-[#776e65]">{requestItems.length} {copy.requestItems}</p></div></div> : <p className="mt-3 text-xs leading-5 text-[#756d64]">{copy.noPurchase}</p>}<button onClick={() => navigate("/purchase-list")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-xs font-bold text-white"><ShoppingBag size={14} />{copy.request}</button></section>
  </main></MobileScreen>;
}

function SectionHeader({ label, text, onClick }: { label: string; text: string; onClick: () => void }) { return <div className="flex items-center justify-between"><p className="text-[10px] font-bold tracking-[.15em] text-[#766b60]">{label}</p><button onClick={onClick} className="text-[11px] font-semibold text-[#443d35]">{text} <ArrowRight className="inline" size={13} /></button></div>; }
function Empty({ icon: Icon, text, action, onClick }: { icon: typeof Sparkles; text: string; action: string; onClick: () => void }) { return <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-[#d8d1c7] bg-white p-4"><span className="grid size-9 place-items-center rounded-full bg-[#f0ece5] text-[#5f564d]"><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="text-xs text-[#70675e]">{text}</p><button onClick={onClick} className="mt-1 text-[11px] font-semibold text-[#26211d]">{action} <ArrowRight className="inline" size={12} /></button></div></div>; }
