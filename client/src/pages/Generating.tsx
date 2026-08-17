import { useAuth } from "@/_core/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { getPreparedLook } from "@/lib/lookSession";
import { trpc } from "@/lib/trpc";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";

type Reel = { label: string; value: string; detail: string };

export default function Generating() {
  const { isAuthenticated, loading } = useAuth(); const [, navigate] = useLocation(); const [, params] = useRoute("/generating/:id");
  const id = Number(params?.id); const prepared = useMemo(() => getPreparedLook(), []); const [stopped, setStopped] = useState(0); const [error, setError] = useState("");
  const generate = trpc.generations.generate.useMutation();
  const reels: Reel[] = prepared ? [
    { label: "👚 TOP", value: prepared.outfit.dress?.name ?? prepared.outfit.top?.name ?? "STYLE", detail: prepared.outfit.type === "dress" ? "DRESS EDIT" : "CURATED TOP" },
    { label: "👖 BOTTOM", value: prepared.outfit.dress ? "DRESS LOOK" : prepared.outfit.bottom?.name ?? "—", detail: prepared.outfit.dress ? "ONE PIECE" : "CURATED BOTTOM" },
    { label: "🧥 OUTER", value: prepared.outfit.outer?.name ?? "NO OUTER", detail: prepared.outfit.outer ? "OPTIONAL LAYER" : "LIGHT LAYER" },
    { label: "🌆 PLACE", value: prepared.outfit.background.name, detail: "EDITORIAL SCENE" },
  ] : [];
  useEffect(() => { if (!loading && !isAuthenticated) navigate("/auth"); else if (!prepared) navigate("/pose"); }, [isAuthenticated, loading, navigate, prepared]);
  useEffect(() => {
    if (!prepared || !id) return;
    const timers = [650, 1100, 1550, 2000].map((delay, index) => window.setTimeout(() => setStopped(index + 1), delay));
    const request = window.setTimeout(async () => { try { await generate.mutateAsync({ id }); window.setTimeout(() => navigate(`/result/${id}`), 620); } catch (cause) { setError(cause instanceof Error ? cause.message : "이미지 생성이 잠시 지연되고 있어요."); } }, 2050);
    return () => { timers.forEach(window.clearTimeout); window.clearTimeout(request); };
  }, [id, navigate, prepared]);
  return <div className="min-h-screen bg-[#312821] text-[#fffaf2]"><AppHeader /><main className="mx-auto max-w-4xl px-5 pb-14 pt-7 sm:px-8"><div className="text-center"><p className="text-[11px] font-bold tracking-[.22em] text-[#ccb9a3]">THE RANDOM EDIT</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">오늘의 룩을 고르는 중</h1><p className="mt-4 text-sm text-[#d6c9bb]">각 릴이 멈추면, 당신만을 위한 에디토리얼이 시작됩니다.</p></div>
    <section className="mt-10 grid gap-3 sm:grid-cols-2">{reels.map((reel, index) => <article key={reel.label} className={`overflow-hidden rounded-[1.4rem] border p-5 transition duration-500 ${stopped > index ? "border-[#d0b89e]/60 bg-[#fffaf2] text-[#3d3028]" : "border-white/15 bg-white/[.06] text-[#f8f2ea]"}`}><div className="flex items-center justify-between text-[11px] font-bold tracking-[.16em] opacity-70"><span>{reel.label}</span><span>{stopped > index ? "SELECTED" : "SPINNING"}</span></div><div className="mt-5 h-[52px] overflow-hidden"><p className={`${stopped > index ? "translate-y-0" : "reel-motion"} font-serif text-2xl transition-transform duration-500`}>{stopped > index ? reel.value : "—  SELECTING  —"}</p></div><p className="mt-3 text-[10px] tracking-[.16em] opacity-55">{reel.detail}</p></article>)}</section>
    <section className="mx-auto mt-11 max-w-sm text-center"><span className="mx-auto grid size-12 place-items-center rounded-full border border-white/20 bg-white/[.08]">{generate.isPending || stopped < 4 ? <LoaderCircle className="animate-spin" size={20} /> : <Sparkles size={19} />}</span><p className="mt-4 text-sm font-semibold">AI가 스타일을 생성 중입니다...</p><p className="mt-2 text-xs text-[#cdbfb1]">사진의 분위기와 선택한 룩을 정교하게 조합하고 있어요.</p>{error && <button onClick={() => navigate("/pose")} className="mt-5 rounded-full border border-white/30 px-4 py-2 text-xs">다시 선택하기</button>}</section>
  </main></div>;
}
