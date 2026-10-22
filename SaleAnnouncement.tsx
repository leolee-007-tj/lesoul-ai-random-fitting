import { X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import type { PricingMode } from "@shared/pricingPolicy";

function saleLines(mode: PricingMode | null | undefined, locale: "ko" | "zh" | "en") {
  if (locale === "ko") {
    if (mode === "SEASON_FORMAT_1") return ["1개 구매 · 20% 할인", "2개 구매 · 30% 할인", "3개 구매 · 40% 할인", "4개 이상 · 45% 할인"];
    if (mode === "SEASON_FORMAT_2") return ["1개 구매 · 30% 할인", "2개 구매 · 40% 할인", "3개 이상 · 45% 할인"];
    if (mode === "SEASON_FORMAT_3") return ["구매 수량과 관계없이 · 45% 할인"];
    return ["상품별 기본 할인율이 적용됩니다.", "VIP 고객은 별도 VIP 할인율이 적용됩니다."];
  }
  if (locale === "zh") {
    if (mode === "SEASON_FORMAT_1") return ["购买1件 · 20%优惠", "购买2件 · 30%优惠", "购买3件 · 40%优惠", "购买4件以上 · 45%优惠"];
    if (mode === "SEASON_FORMAT_2") return ["购买1件 · 30%优惠", "购买2件 · 40%优惠", "购买3件以上 · 45%优惠"];
    if (mode === "SEASON_FORMAT_3") return ["不限制购买数量 · 45%优惠"];
    return ["按每件商品的基础折扣计算。", "VIP客户适用单独的VIP折扣。"];
  }
  if (mode === "SEASON_FORMAT_1") return ["1 item · 20% OFF", "2 items · 30% OFF", "3 items · 40% OFF", "4+ items · 45% OFF"];
  if (mode === "SEASON_FORMAT_2") return ["1 item · 30% OFF", "2 items · 40% OFF", "3+ items · 45% OFF"];
  if (mode === "SEASON_FORMAT_3") return ["Any quantity · 45% OFF"];
  return ["Product-specific base discounts apply.", "VIP customers receive their separate VIP discount."];
}

export default function SaleAnnouncement() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const config = trpc.purchase.config.useQuery(undefined, { staleTime: 30_000, refetchOnWindowFocus: true });
  const endTime = config.data?.saleEndsAt ? new Date(config.data.saleEndsAt).getTime() : null;
  useEffect(() => {
    if (!endTime || !Number.isFinite(endTime)) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);
  if (!open || !config.data?.centralSaleEnabled || (endTime !== null && endTime <= now)) return null;
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const remainingSeconds = endTime === null ? null : Math.max(0, Math.floor((endTime - now) / 1000));
  const days = remainingSeconds === null ? 0 : Math.floor(remainingSeconds / 86400);
  const hours = remainingSeconds === null ? 0 : Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = remainingSeconds === null ? 0 : Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds === null ? 0 : remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  const countdown = remainingSeconds === null ? null : days > 0 ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const endLabel = endTime === null ? null : new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(endTime));
  const copy = locale === "ko"
    ? { kicker: "LESOUL SPECIAL SALE", title: "현재 세일이 진행 중입니다", body: "지금 상품을 확인하고 적용된 할인 혜택을 만나보세요.", excluded: "신상품은 세일에서 제외될 수 있습니다.", ends: "세일 종료", remaining: "남은 시간", noEnd: "종료일 없음", close: "세일 안내 닫기" }
    : locale === "zh"
      ? { kicker: "LESOUL SPECIAL SALE", title: "当前正在进行促销", body: "现在查看商品，享受当前适用的优惠。", excluded: "新品可能不参加本次促销。", ends: "促销结束", remaining: "剩余时间", noEnd: "未设置结束时间", close: "关闭促销说明" }
      : { kicker: "LESOUL SPECIAL SALE", title: "Our sale is now live", body: "Explore the collection and enjoy the currently active offer.", excluded: "New arrivals may be excluded from the sale.", ends: "Sale ends", remaining: "Time remaining", noEnd: "No end date", close: "Close sale announcement" };
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-5 py-8 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="sale-announcement-title">
    <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#fffaf2]/95 p-7 shadow-[0_24px_90px_rgba(40,25,10,.35)] sm:p-10">
      <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/10 text-[#30261d] transition hover:bg-black/20 active:scale-95"><X size={22} /></button>
      <div className="flex items-center gap-2 text-[#9a332c]"><Sparkles size={19} /><span className="text-[11px] font-black tracking-[.22em]">{copy.kicker}</span></div>
      <h2 id="sale-announcement-title" className="mt-5 max-w-[calc(100%-2rem)] font-serif text-3xl leading-tight text-[#211a14] sm:text-4xl">{copy.title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#66594d] sm:text-base">{copy.body}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-[#211a14] px-4 py-3 text-white"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/65">{copy.remaining}</p><p className="mt-1 font-mono text-xl font-bold tracking-wider">{countdown ?? copy.noEnd}</p></div><div className="rounded-xl border border-[#dfd1c4] bg-white/70 px-4 py-3 text-[#55483d]"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8b7868]">{copy.ends}</p><p className="mt-1 text-sm font-bold">{endLabel ?? copy.noEnd}</p></div></div>
      <div className="mt-7 grid gap-2 sm:grid-cols-2">{saleLines(config.data.pricingMode as PricingMode, locale).map((line) => <div key={line} className="rounded-xl border border-[#e8cfc2] bg-[#fff1e9] px-4 py-3 text-sm font-bold text-[#8f2f28]">{line}</div>)}</div>
      {config.data.excludeNewArrivalsFromSale ? <p className="mt-5 text-xs leading-5 text-[#766b60]">{copy.excluded}</p> : null}
      <button type="button" onClick={() => setOpen(false)} className="mt-7 w-full rounded-xl bg-[#211a14] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3c2f25] active:scale-[.98]">{copy.close}</button>
    </div>
  </div>;
}
