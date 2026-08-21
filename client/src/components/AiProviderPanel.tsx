import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, CloudCog, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

type Preference = "FORGE" | "QWEN";

const copy = {
  en: {
    eyebrow: "AI PROVIDER",
    title: "Provider switch",
    current: "GPT Image 2 · Current default",
    qwen: "Alibaba Qwen · China",
    image: "Product image processing",
    text: "Customer text translation",
    preferred: "Selected",
    effective: "Currently active",
    connected: "Connected",
    needsKey: "API key needed",
    fallback: "Qwen is not connected, so the current default AI remains active.",
    endpoint: "Reserved endpoint: China (Beijing)",
    saved: "Provider preference saved",
  },
  ko: {
    eyebrow: "AI 공급자",
    title: "AI 공급자 전환",
    current: "GPT Image 2 · 현재 기본 AI",
    qwen: "Alibaba Qwen · 중국",
    image: "상품 이미지 처리",
    text: "고객용 텍스트 번역",
    preferred: "선택",
    effective: "현재 사용",
    connected: "연결됨",
    needsKey: "API 키 연결 필요",
    fallback: "Qwen API가 아직 연결되지 않아 현재 기본 AI가 계속 사용됩니다.",
    endpoint: "예약된 엔드포인트: 중국 베이징",
    saved: "공급자 선택을 저장했습니다",
  },
  zh: {
    eyebrow: "AI 服务商",
    title: "AI 服务商切换",
    current: "GPT Image 2 · 当前默认 AI",
    qwen: "Alibaba Qwen · 中国",
    image: "商品图片处理",
    text: "客户文案翻译",
    preferred: "已选择",
    effective: "当前使用",
    connected: "已连接",
    needsKey: "需要连接 API Key",
    fallback: "尚未连接 Qwen API，因此系统将继续使用当前默认 AI。",
    endpoint: "预留端点：中国（北京）",
    saved: "服务商选择已保存",
  },
};

function ProviderChoice({ label, value, selected, onSelect, disabled }: { label: string; value: Preference; selected: Preference; onSelect: (value: Preference) => void; disabled?: boolean }) {
  const active = selected === value;
  return <button type="button" onClick={() => onSelect(value)} disabled={disabled} className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition active:scale-[.98] disabled:opacity-50 ${active ? "border-black bg-black text-white" : "border-[#ddd6cc] bg-white text-[#51483f]"}`}><span className="min-w-0 text-xs font-semibold">{label}</span><span className={`h-3.5 w-3.5 shrink-0 rounded-full border ${active ? "border-white bg-white" : "border-[#a2978b]"}`} /></button>;
}

export function AiProviderPanel() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("zh") ? "zh" : i18n.language.startsWith("ko") ? "ko" : "en";
  const t = copy[locale];
  const settings = trpc.operations.settings.useQuery();
  const status = trpc.operations.providerStatus.useQuery();
  const update = trpc.operations.updateSettings.useMutation({
    onSuccess: () => {
      void settings.refetch();
      void status.refetch();
    },
  });

  if (!settings.data) return null;
  const choose = (field: "aiImageProviderPreference" | "aiTextProviderPreference", preference: Preference) => {
    update.mutate({ [field]: preference });
  };
  const image = status.data?.image;
  const text = status.data?.text;
  const showFallback = image?.fallbackActive || text?.fallbackActive;

  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{t.eyebrow}</p><h2 className="mt-1 font-serif text-xl">{t.title}</h2></div><CloudCog size={20} className="text-[#6b6258]" /></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f7f4ef] p-3"><p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[#70675e]">{t.image}</p><div className="space-y-2"><ProviderChoice label={t.current} value="FORGE" selected={settings.data.aiImageProviderPreference} onSelect={(value) => choose("aiImageProviderPreference", value)} disabled={update.isPending} /><ProviderChoice label={t.qwen} value="QWEN" selected={settings.data.aiImageProviderPreference} onSelect={(value) => choose("aiImageProviderPreference", value)} disabled={update.isPending} /></div><p className="mt-3 text-[10px] text-[#746a61]">{t.effective}: {image?.effective === "QWEN" ? t.qwen : t.current}</p></div><div className="rounded-xl bg-[#f7f4ef] p-3"><p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[#70675e]">{t.text}</p><div className="space-y-2"><ProviderChoice label={t.current} value="FORGE" selected={settings.data.aiTextProviderPreference} onSelect={(value) => choose("aiTextProviderPreference", value)} disabled={update.isPending} /><ProviderChoice label={t.qwen} value="QWEN" selected={settings.data.aiTextProviderPreference} onSelect={(value) => choose("aiTextProviderPreference", value)} disabled={update.isPending} /></div><p className="mt-3 text-[10px] text-[#746a61]">{t.effective}: {text?.effective === "QWEN" ? t.qwen : t.current}</p></div></div><div className={`mt-3 rounded-xl border px-3 py-3 text-xs ${showFallback ? "border-[#ead5a9] bg-[#fffaf0] text-[#735a2b]" : "border-[#cfe3d0] bg-[#f6fbf6] text-[#3f6a45]"}`}><div className="flex items-center gap-2 font-semibold">{showFallback ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}<span>{status.data?.qwenConfigured ? t.connected : t.needsKey}</span></div><p className="mt-1 leading-5">{status.data?.qwenConfigured ? t.endpoint : t.fallback}</p>{!status.data?.qwenConfigured && <p className="mt-2 flex items-center gap-1 text-[10px] opacity-80"><Sparkles size={11} />{t.endpoint}</p>}</div>{update.isSuccess && <p className="mt-3 text-xs font-semibold text-[#49644c]">{t.saved}</p>}</section>;
}
