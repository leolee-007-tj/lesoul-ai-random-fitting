import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { Check, LoaderCircle, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type PricingMode = "BASE" | "SEASON_FORMAT_1" | "SEASON_FORMAT_2" | "SEASON_FORMAT_3";

const text = {
  en: { eyebrow: "OWNER ONLY · STOREWIDE PRICING", title: "Sale Settings", body: "Choose one mode. A seasonal format immediately replaces every product's selected base discount. Select Base to restore the NORMAL and VIP discount chosen for each product.", restricted: "Sale Settings is available only to the store owner.", active: "ACTIVE STOREWIDE POLICY", saved: "The storewide sale policy has been applied.", base: ["Product-selected base discounts", "Each product chooses NORMAL · 17% or 20%\nEach product chooses VIP · 20% or 30%\nSelecting Base restores these choices."], one: ["Season sale · Format 1", "1 item 20% · 2 items 30% · 3 items 40% · 4+ items 45%"], two: ["Season sale · Format 2", "1 item 30% · 2 items 40% · 3+ items 45%"], three: ["Season sale · Format 3", "Every item · 45%"], excludeNew: "Exclude new arrivals from seasonal sale", excludeNewBody: "When ON, products marked NEW keep their regular price during seasonal formats.", on: "ON", off: "OFF", saving: "Applying…" },
  ko: { eyebrow: "소유자 전용 · 전체 가격", title: "세일 설정", body: "한 가지 모드만 선택하세요. 시즌 형식을 선택하면 모든 상품의 기본 할인 선택값이 즉시 대체됩니다. 기본 모드를 선택하면 각 상품에서 고른 일반·VIP 할인으로 복귀합니다.", restricted: "세일 설정은 매장 소유자만 사용할 수 있습니다.", active: "현재 전체 가격 정책", saved: "전체 고객 가격에 세일 정책을 적용했습니다.", base: ["상품별 기본 고객 할인", "각 상품에서 일반 · 17% 또는 20% 선택\n각 상품에서 VIP · 20% 또는 30% 선택\n기본 모드를 선택하면 이 값으로 복귀합니다."], one: ["시즌 세일 · 형식 1", "1벌 20% · 2벌 30% · 3벌 40% · 4벌 이상 45%"], two: ["시즌 세일 · 형식 2", "1벌 30% · 2벌 40% · 3벌 이상 45%"], three: ["시즌 세일 · 형식 3", "모든 수량 · 45%"], excludeNew: "신상품은 시즌 세일에서 제외", excludeNewBody: "켜면 NEW로 표시한 상품은 시즌 세일 기간에도 정상가를 유지합니다.", on: "켜짐", off: "꺼짐", saving: "적용 중…" },
  zh: { eyebrow: "仅限所有者 · 全店价格", title: "促销设置", body: "一次只能选择一种模式。选择季节促销后，会立即替代每件商品已选择的基础折扣。选择基础模式后，会恢复每件商品的普通用户与 VIP 折扣。", restricted: "只有店铺所有者可以使用促销设置。", active: "当前全店价格政策", saved: "促销政策已应用至全店客户价格。", base: ["按商品选择基础客户折扣", "每件商品选择普通用户 · 8.3折或8折\n每件商品选择 VIP · 8折或7折\n选择基础模式后恢复这些设置。"], one: ["季节促销 · 方案 1", "1件 8折 · 2件 7折 · 3件 6折 · 4件以上 5.5折"], two: ["季节促销 · 方案 2", "1件 7折 · 2件 6折 · 3件以上 5.5折"], three: ["季节促销 · 方案 3", "所有数量 · 5.5折"], excludeNew: "新商品不参加季节促销", excludeNewBody: "开启后，标记为 NEW 的商品在季节促销期间仍保持原价。", on: "开启", off: "关闭", saving: "正在应用…" },
} as const;

export default function SaleSettings() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const c = text[locale];
  const owner = trpc.operations.ownerStatus.useQuery();
  const config = trpc.admin.releaseConfig.useQuery(undefined, { enabled: owner.data?.isOwner === true });
  const [confirmation, setConfirmation] = useState(false);
  const [excludeNewArrivalsFromSale, setExcludeNewArrivalsFromSale] = useState<number | null>(null);
  const update = trpc.admin.updateReleaseConfig.useMutation({ onSuccess: () => { void config.refetch(); setConfirmation(true); } });

  useEffect(() => {
    if (config.data) setExcludeNewArrivalsFromSale(config.data.excludeNewArrivalsFromSale ?? 0);
  }, [config.data]);

  const modeCards: { mode: PricingMode; copy: readonly [string, string] }[] = [
    { mode: "BASE", copy: c.base },
    { mode: "SEASON_FORMAT_1", copy: c.one },
    { mode: "SEASON_FORMAT_2", copy: c.two },
    { mode: "SEASON_FORMAT_3", copy: c.three },
  ];

  if (owner.isLoading || (owner.data?.isOwner && config.isLoading)) return <div className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin" /></div>;
  if (!owner.data?.isOwner || !config.data) return <div className="min-h-screen bg-[#f8f7f4]"><AppHeader /><main className="mx-auto grid min-h-[70dvh] max-w-xl place-items-center px-5 text-center"><section><h1 className="font-serif text-3xl">{c.title}</h1><p className="mt-3 text-sm text-[#666]">{c.restricted}</p></section></main></div>;

  const saveMode = (pricingMode: PricingMode, excludeOverride?: number) => {
    const current = config.data;
    const excluded = excludeOverride ?? excludeNewArrivalsFromSale ?? current.excludeNewArrivalsFromSale ?? 0;
    setConfirmation(false);
    setExcludeNewArrivalsFromSale(excluded);
    update.mutate({
      storeName: current.storeName,
      storeTaglineEn: current.storeTaglineEn,
      storeTaglineKo: current.storeTaglineKo,
      storeTaglineZh: current.storeTaglineZh,
      adminTrialPaymentQrUrl: current.adminTrialPaymentQrUrl,
      adminTrialUsageGuideQrUrl: current.adminTrialUsageGuideQrUrl,
      pricingMode,
      excludeNewArrivalsFromSale: excluded,
      releaseMode: current.releaseMode === "REDEEM_CODE" ? "PRIVATE" : current.releaseMode,
      betaCatalogLimit: current.betaCatalogLimit,
      betaDailyVisitorLimit: current.betaDailyVisitorLimit,
      betaFreeGenerationAllowance: current.betaFreeGenerationAllowance,
      globalDailyGenerationLimit: current.globalDailyGenerationLimit,
      monthlyGenerationLimit: current.monthlyGenerationLimit,
      generationEnabled: current.generationEnabled,
      purchaseMode: current.purchaseMode,
      purchaseListMaxItems: current.purchaseListMaxItems,
      purchaseQrEnabled: current.purchaseQrEnabled,
      stylistIncludePreorder: current.stylistIncludePreorder,
    });
  };

  const active = config.data.pricingMode as PricingMode;
  const excluded = Boolean(excludeNewArrivalsFromSale ?? config.data.excludeNewArrivalsFromSale);
  return <div className="min-h-screen bg-[#f8f7f4] text-[#171717]"><AppHeader /><main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><Tags size={20} /></span><div><p className="text-[10px] font-bold tracking-[.18em] text-[#777]">{c.eyebrow}</p><h1 className="mt-1 font-serif text-4xl">{c.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#666]">{c.body}</p></div></div>{confirmation && <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><Check size={16} />{c.saved}</p>}<section className="mt-6 grid gap-3"><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{c.active}</p><div className="flex items-center justify-between gap-4 rounded-2xl border border-[#ded8cf] bg-white p-4"><div><p className="text-sm font-semibold">{c.excludeNew}</p><p className="mt-1 text-xs leading-5 text-[#6d655c]">{c.excludeNewBody}</p></div><button type="button" aria-pressed={excluded} disabled={update.isPending} onClick={() => saveMode(active, excluded ? 0 : 1)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${excluded ? "bg-black text-white" : "bg-[#eeeae3] text-[#5a524a]"}`}>{excluded ? c.on : c.off}</button></div>{modeCards.map(({ mode, copy }) => { const selected = mode === active; return <button key={mode} type="button" disabled={update.isPending} onClick={() => saveMode(mode)} className={`rounded-2xl border p-5 text-left transition ${selected ? "border-black bg-black text-white shadow-lg" : "border-[#ded8cf] bg-white text-[#2b2723] hover:border-[#8b7d6f]"} disabled:opacity-60`}><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold">{copy[0]}</p><p className={`mt-2 whitespace-pre-line text-sm leading-6 ${selected ? "text-white/80" : "text-[#6d655c]"}`}>{copy[1]}</p></div>{selected && <span className="grid size-7 place-items-center rounded-full bg-white text-black"><Check size={15} /></span>}</div>{update.isPending && selected && <p className="mt-3 text-xs font-semibold">{c.saving}</p>}</button>;})}</section></main></div>;
}
