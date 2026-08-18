import AppHeader from "@/components/AppHeader";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { LoaderCircle, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

const defaults = {
  en: "Payment is final. Cancellation, return, or exchange may not be available. Please review the product carefully before paying.",
  ko: "결제 완료 후에는 주문 취소·반품·교환이 어렵습니다. 구매 전 상품 정보를 충분히 확인해 주세요.",
  zh: "付款完成后通常无法取消、退货或换货。请在购买前充分确认商品信息。",
};

export default function PurchaseNoticeManager() {
  const config = trpc.admin.releaseConfig.useQuery(); const update = trpc.admin.updateReleaseConfig.useMutation({ onSuccess: () => config.refetch() });
  const [copy, setCopy] = useState(defaults);
  useEffect(() => { if (config.data) setCopy({ en: config.data.purchaseNoticeEn ?? defaults.en, ko: config.data.purchaseNoticeKo ?? defaults.ko, zh: config.data.purchaseNoticeZh ?? defaults.zh }); }, [config.data]);
  if (config.isLoading) return <div className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin" /></div>;
  if (config.error || !config.data) return <div className="grid min-h-screen place-items-center bg-[#f8f7f4] p-6 text-center"><div><p className="text-xs font-bold tracking-[.16em] text-[#777]">ADMIN ONLY</p><h1 className="mt-2 font-serif text-3xl">Purchase notice settings are protected</h1><button onClick={startLogin} className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">Sign in as administrator</button></div></div>;
  const save = () => update.mutate({ releaseMode: config.data.releaseMode, betaCatalogLimit: config.data.betaCatalogLimit, betaDailyVisitorLimit: config.data.betaDailyVisitorLimit, globalDailyGenerationLimit: config.data.globalDailyGenerationLimit, monthlyGenerationLimit: config.data.monthlyGenerationLimit, generationEnabled: config.data.generationEnabled, purchaseQrEnabled: config.data.purchaseQrEnabled, purchaseNoticeEn: copy.en, purchaseNoticeKo: copy.ko, purchaseNoticeZh: copy.zh });
  return <div className="min-h-screen bg-[#f8f7f4]"><AppHeader /><main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8"><p className="text-xs font-bold tracking-[.18em] text-[#777]">ADMIN ONLY · PURCHASE CARD</p><h1 className="mt-2 font-serif text-4xl">Purchase notices</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#666]">This text appears below the product payment QR. Update it whenever your payment, cancellation, return, or exchange policy changes.</p><section className="mt-6 rounded-[1.5rem] border border-[#dedbd4] bg-white p-5"><div className="flex gap-2 rounded-xl bg-[#fff8ee] p-3 text-xs leading-5 text-[#765b3e]"><ShieldAlert size={17} className="mt-0.5 shrink-0" />These notices are shown by the visitor’s selected language. They do not process payments or create an external purchase link.</div><div className="mt-5 grid gap-4"><label className="text-xs font-semibold">English<textarea value={copy.en} onChange={(event) => setCopy({ ...copy, en: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-[#d9d3ca] p-3 text-sm font-normal" /></label><label className="text-xs font-semibold">한국어<textarea value={copy.ko} onChange={(event) => setCopy({ ...copy, ko: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-[#d9d3ca] p-3 text-sm font-normal" /></label><label className="text-xs font-semibold">中文<textarea value={copy.zh} onChange={(event) => setCopy({ ...copy, zh: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-[#d9d3ca] p-3 text-sm font-normal" /></label></div><button onClick={save} disabled={update.isPending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold text-white disabled:opacity-50">{update.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}Save purchase notices</button></section></main></div>;
}
