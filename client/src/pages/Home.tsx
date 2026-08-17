import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowDownRight, ArrowRight, Sparkles, Stars } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";
import { consumeLoginIntent } from "@/lib/lookSession";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => { if (!loading && isAuthenticated && consumeLoginIntent()) navigate("/upload"); }, [isAuthenticated, loading, navigate]);
  return <div className="min-h-screen overflow-hidden bg-[#f7f2eb] text-[#382f2a]">
    <AppHeader />
    <main className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
      <section className="relative grid min-h-[610px] overflow-hidden rounded-[2rem] bg-[#e6dccf] lg:grid-cols-[1.04fr_.96fr] lg:rounded-[2.7rem]">
        <div className="relative z-10 flex flex-col justify-between px-7 py-9 sm:px-12 sm:py-12 lg:px-16 lg:py-16">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#bca991]/60 bg-[#f7f2eb]/70 px-3 py-1.5 text-[11px] font-semibold tracking-[.16em] text-[#7a624f]"><Sparkles size={13} /> CURATED BY CHANCE</div>
          <div className="max-w-2xl py-12 lg:py-6">
            <p className="mb-4 text-sm font-medium tracking-[.13em] text-[#806a57]">AI FASHION EDITORIAL</p>
            <h1 className="font-serif text-[clamp(3rem,6.3vw,6.6rem)] leading-[.92] tracking-[-.055em] text-[#382f2a]">오늘 나에게<br />어울리는<br /><em className="font-normal text-[#846a52]">LESOUL LOOK</em>은?</h1>
            <p className="mt-7 max-w-md text-[15px] leading-7 text-[#66574b]">당신의 분위기와 LESOUL의 취향이 만나는 순간. 랜덤으로 완성되는 오늘의 패션 에디토리얼을 경험해보세요.</p>
            <button onClick={() => navigate(isAuthenticated ? "/upload" : "/auth")} className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#3f342d] px-6 py-4 text-sm font-semibold text-[#fffdf8] shadow-[0_12px_28px_rgba(63,52,45,.18)] transition hover:-translate-y-0.5 hover:bg-[#59483b] active:scale-[.98]">나의 룩 시작하기 <ArrowRight size={17} /></button>
          </div>
          <div className="flex items-end justify-between border-t border-[#bba994]/60 pt-5 text-xs text-[#746458]"><span>01 — 04</span><span className="max-w-48 text-right leading-5">사진, 포즈, 그리고 예측할 수 없는 좋은 취향.</span></div>
        </div>
        <div className="relative min-h-[380px] overflow-hidden lg:min-h-0">
          <img src="/manus-storage/editorial-cafe_f970ce23.jpg" alt="LESOUL fashion editorial" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3f342d]/35 via-transparent to-[#f1e8de]/20" />
          <div className="absolute bottom-6 right-6 rounded-2xl border border-white/35 bg-[#fbf7f0]/85 p-4 backdrop-blur sm:bottom-9 sm:right-9"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#3f342d] text-white"><Stars size={16} /></span><div><p className="text-[10px] font-bold tracking-[.16em] text-[#907863]">TODAY'S MOOD</p><p className="mt-0.5 font-serif text-lg">Soft confidence</p></div></div></div>
          <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur"><ArrowDownRight size={19} /></span>
        </div>
      </section>
      <section className="grid gap-4 py-7 sm:grid-cols-3 sm:py-10"><p className="text-xs font-bold tracking-[.16em] text-[#98816c]">HOW IT WORKS</p>{[["01", "나의 사진", "전신 사진 한 장을 준비해요."], ["02", "포즈와 취향", "마음에 드는 무드를 선택해요."], ["03", "오늘의 룩", "AI 에디토리얼로 만나요."]].map(([number, title, detail]) => <article key={number} className="border-t border-[#d7cbbb] pt-3"><p className="text-xs text-[#9b836d]">{number}</p><h2 className="mt-3 font-serif text-xl">{title}</h2><p className="mt-1 text-sm text-[#77695f]">{detail}</p></article>)}</section>
    </main>
  </div>;
}
