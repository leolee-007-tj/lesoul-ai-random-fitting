import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { Check, LoaderCircle, Tags } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type PricingMode = "BASE" | "SEASON_FORMAT_1" | "SEASON_FORMAT_2" | "SEASON_FORMAT_3";

const text = {
  en: { eyebrow: "OWNER ONLY · STOREWIDE PRICING", title: "Sale Settings", body: "Choose one mode. The selection changes every customer-facing product price immediately, including catalog cards, purchase lists, QR purchase cards, and share cards.", restricted: "Sale Settings is available only to the store owner.", active: "ACTIVE STOREWIDE POLICY", saved: "The storewide sale policy has been applied.", base: ["Base customer policy", "NORMAL · 17% for every quantity\nVIP · 22% for every quantity"], one: ["Season sale · Format 1", "1 item 20% · 2 items 30% · 3 items 40% · 4+ items 45%"], two: ["Season sale · Format 2", "1 item 30% · 2 items 40% · 3+ items 45%"], three: ["Season sale · Format 3", "Every item · 45%"], saving: "Applying…" },
  ko: { eyebrow: "소유자 전용 · 전체 가격", title: "세일 설정", body: "한 가지 모드만 선택하세요. 선택 즉시 모든 고객 상품 가격이 바뀌며, 카탈로그·구매목록·QR 구매 카드·공유 카드에 함께 반영됩니다.", restricted: "세일 설정은 매장 소유자만 사용할 수 있습니다.", active: "현재 전체 가격 정책", saved: "전체 고객 가격에 세일 정책을 적용했습니다.", base: ["기본 고객 할인", "일반 · 수량과 무관하게 17%\nVIP · 수량과 무관하게 22%"], one: ["시즌 세일 · 형식 1", "1벌 20% · 2벌 30% · 3벌 40% · 4벌 이상 45%"], two: ["시즌 세일 · 형식 2", "1벌 30% · 2벌 40% · 3벌 이상 45%"], three: ["시즌 세일 · 형식 3", "모든 수량 · 45%"], saving: "적용 중…" },
  zh: { eyebrow: "仅限所有者 · 全店价格", title: "促销设置", body: "一次只能选择一种模式。选择后，所有面向客户的商品价格会立即更新，包括商品目录、购买清单、二维码购买卡和分享卡。", restricted: "只有店铺所有者可以使用促销设置。", active: "当前全店价格政策", saved: "促销政策已应用至全店客户价格。", base: ["基础客户折扣", "普通用户 · 任意数量 8.3折\nVIP · 任意数量 7.8折"], one: ["季节促销 · 方案 1", "1件 8折 · 2件 7折 · 3件 6折 · 4件以上 5.5折"], two: ["季节促销 · 方案 2", "1件 7折 · 2件 6折 · 3件以上 5.5折"], three: ["季节促销 · 方案 3", "所有数量 · 5.5折"], saving: "正在应用…" },
} as const;

export default function SaleSettings() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const c = text[locale];
  const owner = trpc.operations.ownerStatus.useQuery();
  const config = trpc.admin.releaseConfig.useQuery(undefined, { enabled: owner.data?.isOwner === true });
  const [confirmation, setConfirmation] = useState(false);
  const update = trpc.admin.updateReleaseConfig.useMutation({ onSuccess: () => { void config.refetch(); setConfirmation(true); } });
  const modeCards: { mode: PricingMode; copy: readonly [string, string] }[] = [
    { mode: "BASE", copy: c.base },
    { mode: "SEASON_FORMAT_1", copy: c.one },
    { mode: "SEASON_FORMAT_2", copy: c.two },
    { mode: "SEASON_FORMAT_3", copy: c.three },
  ];

  if (owner.isLoading || (owner.data?.isOwner && config.isLoading)) return <div className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin" /></div>;
  if (!owner.data?.isOwner || !config.data) return <div className="min-h-screen bg-[#f8f7f4]"><AppHeader /><main className="mx-auto grid min-h-[70dvh] max-w-xl place-items-center px-5 text-center"><section><h1 className="font-serif text-3xl">{c.title}</h1><p className="mt-3 text-sm text-[#666]">{c.restricted}</p></section></main></div>;

  const saveMode = (pricingMode: PricingMode) => {
    const current = config.data;
    setConfirmation(false);
    update.mutate({
      storeName: current.storeName, storeTaglineEn: current.storeTaglineEn, storeTaglineKo: current.storeTaglineKo, storeTaglineZh: current.storeTaglineZh,
      adminTrialPaymentQrUrl: current.adminTrialPaymentQrUrl, adminTrialUsageGuideQrUrl: current.adminTrialUsageGuideQrUrl, pricingMode,
      releaseMode: current.releaseMode === "REDEEM_CODE" ? "PRIVATE" : current.releaseMode, betaCatalogLimit: current.betaCatalogLimit, betaDailyVisitorLimit: current.betaDailyVisitorLimit,
      betaFreeGenerationAllowance: current.betaFreeGenerationAllowance, globalDailyGenerationLimit: current.globalDailyGenerationLimit, monthlyGenerationLimit: current.monthlyGenerationLimit,
      generationEnabled: current.generationEnabled, purchaseMode: current.purchaseMode, purchaseListMaxItems: current.purchaseListMaxItems, purchaseQrEnabled: current.purchaseQrEnabled,
      stylistIncludePreorder: current.stylistIncludePreorder,
    });
  };

  const active = config.data.pricingMode as PricingMode;
  return <div className="min-h-screen bg-[#f8f7f4] text-[#171717]"><AppHeader /><main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><Tags size={20} /></span><div><p className="text-[10px] font-bold tracking-[.18em] text-[#777]">{c.eyebrow}</p><h1 className="mt-1 font-serif text-4xl">{c.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#666]">{c.body}</p></div></div>{confirmation && <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><Check size={16} />{c.saved}</p>}<section className="mt-6 grid gap-3"><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{c.active}</p>{modeCards.map(({ mode, copy }) => { const selected = mode === active; return <button key={mode} type="button" disabled={update.isPending} onClick={() => saveMode(mode)} className={`rounded-2xl border p-5 text-left transition ${selected ? "border-black bg-black text-white shadow-lg" : "border-[#ded8cf] bg-white text-[#2b2723] hover:border-[#8b7d6f]"} disabled:opacity-60`}><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold">{copy[0]}</p><p className={`mt-2 whitespace-pre-line text-sm leading-6 ${selected ? "text-white/80" : "text-[#6d655c]"}`}>{copy[1]}</p></div>{selected && <span className="grid size-7 place-items-center rounded-full bg-white text-black"><Check size={15} /></span>}</div>{update.isPending && selected && <p className="mt-3 text-xs font-semibold">{c.saving}</p>}</button>;})}</section></main></div>;
}
