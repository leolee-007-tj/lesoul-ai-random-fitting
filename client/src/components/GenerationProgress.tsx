import { LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = { isCompleting: boolean; averageDurationMs?: number | null; onRetryCheck?: () => Promise<"waiting" | "retrying"> };
type Stage = { at: number; key: "photo" | "products" | "styling" | "scene" | "sending" | "creating" | "checking" | "finalizing" | "ready" };

const stages: Stage[] = [
  { at: 10, key: "photo" }, { at: 20, key: "products" }, { at: 30, key: "styling" }, { at: 40, key: "scene" }, { at: 50, key: "sending" }, { at: 85, key: "creating" }, { at: 90, key: "checking" }, { at: 95, key: "finalizing" }, { at: 100, key: "ready" },
];

export default function GenerationProgress({ isCompleting, averageDurationMs, onRetryCheck }: Props) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(10); const [isLong, setIsLong] = useState(false); const [checkingRetry, setCheckingRetry] = useState(false); const [retryNotice, setRetryNotice] = useState("");
  useEffect(() => {
    if (isCompleting) return;
    const timers = [
      window.setTimeout(() => setProgress(20), 350), window.setTimeout(() => setProgress(30), 700),
      window.setTimeout(() => setProgress(40), 1100), window.setTimeout(() => setProgress(50), 1500),
    ];
    const visual = window.setInterval(() => setProgress((current) => current < 85 ? Math.min(85, current + (current < 65 ? 3 : 1)) : current), 900);
    const long = window.setTimeout(() => setIsLong(true), 30000);
    return () => { timers.forEach(window.clearTimeout); window.clearInterval(visual); window.clearTimeout(long); };
  }, [isCompleting]);
  useEffect(() => {
    if (!isCompleting) return;
    setProgress(90); const ninetyFive = window.setTimeout(() => setProgress(95), 260); const done = window.setTimeout(() => setProgress(100), 560);
    return () => { window.clearTimeout(ninetyFive); window.clearTimeout(done); };
  }, [isCompleting]);
  const stage = useMemo(() => [...stages].reverse().find((item) => progress >= item.at) ?? stages[0], [progress]);
  const estimate = averageDurationMs && averageDurationMs > 0 ? t("generationProgress.average", { seconds: Math.max(1, Math.round(averageDurationMs / 1000)) }) : t("generationProgress.moment");
  const checkRetry = async () => { if (!onRetryCheck) return; setCheckingRetry(true); try { const state = await onRetryCheck(); setRetryNotice(state === "waiting" ? t("generationProgress.stillWorking") : t("generationProgress.retrying")); } finally { setCheckingRetry(false); } };
  return <section className="mt-5 grid min-h-[58svh] place-items-center rounded-[1.7rem] border border-[#dedbd4] bg-[radial-gradient(circle_at_top,#f4eee5,white_58%)] p-6 text-center"><div className="w-full max-w-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9dfd1] text-[#4e4035]"><Sparkles size={23} /></div><p className="mt-5 text-[10px] font-bold tracking-[.2em] text-[#76685b]">LESOUL AI COMPOSITE</p><h2 className="mt-2 font-serif text-3xl leading-tight">{t("generationProgress.titleLine1")}<br />{t("generationProgress.titleLine2")}</h2><div className="mt-7 h-2 overflow-hidden rounded-full bg-[#e9e3db]"><div className="h-full rounded-full bg-[#2c251f] transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex items-center justify-between text-[10px] font-bold tracking-[.12em] text-[#76685b]"><span>{t("generationProgress.workflow")}</span><span>{progress}%</span></div><div className="mt-5 rounded-2xl bg-white/75 px-4 py-3"><div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#43382f]"><LoaderCircle size={15} className="animate-spin" />{t(`generationProgress.stages.${stage.key}`)}</div><p className="mt-2 text-[11px] leading-4 text-[#766f66]">{isLong ? t("generationProgress.long") : estimate}</p>{isLong && onRetryCheck && <><button onClick={checkRetry} disabled={checkingRetry} className="mt-3 rounded-full border border-[#cfc7bc] bg-white px-3 py-1.5 text-[10px] font-bold text-[#4c443d] disabled:opacity-50">{checkingRetry ? t("generationProgress.checking") : t("generationProgress.retry")}</button>{retryNotice && <p className="mt-2 text-[10px] leading-4 text-[#766f66]">{retryNotice}</p>}</>}</div><p className="mt-5 text-[10px] leading-4 text-[#8a8279]">{t("generationProgress.note")}</p></div></section>;
}
