import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";
import { startLogin } from "@/const";
import { consumeLoginIntent, setLoginIntent } from "@/lib/lookSession";

export default function Auth() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!loading && isAuthenticated) navigate(consumeLoginIntent() ? "/upload" : "/upload");
  }, [isAuthenticated, loading, navigate]);
  const proceed = () => { setLoginIntent(); startLogin(); };

  return <div className="min-h-screen bg-[#f7f2eb] text-[#382f2a]">
    <AppHeader />
    <main className="mx-auto grid max-w-5xl items-stretch gap-7 px-5 pb-12 pt-6 sm:px-8 md:grid-cols-[1.05fr_.95fr] lg:pt-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#3f342d] px-7 py-10 text-[#fbf8f1] sm:px-10 sm:py-14">
        <div className="absolute -right-10 -top-16 size-52 rounded-full border border-white/15" /><div className="absolute -bottom-20 -left-10 size-64 rounded-full bg-[#cbb9a7]/20 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[11px] tracking-[.18em]"><Sparkles size={12} /> PERSONAL LOOKBOOK</span>
          <h1 className="mt-12 font-serif text-4xl leading-[1.14] sm:text-5xl">당신의 하루에<br />어울리는 한 장면.</h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-[#e5dad0]">사진 한 장으로 시작하는 LESOUL의 큐레이션. 취향을 담은 코디와 분위기를 새로운 에디토리얼로 만나보세요.</p>
          <div className="mt-12 space-y-3 text-sm text-[#efe8df]">{["사진은 룩 생성에만 사용됩니다", "원하는 포즈와 무드를 직접 고릅니다", "만든 룩은 나만의 갤러리에 보관됩니다"].map((item) => <p key={item} className="flex items-center gap-3"><span className="grid size-5 place-items-center rounded-full bg-white/15"><Check size={13} /></span>{item}</p>)}</div>
        </div>
      </section>
      <section className="flex flex-col justify-center rounded-[2rem] border border-[#e6dccf] bg-[#fffdf8] px-7 py-10 sm:px-10">
        <p className="text-xs font-bold tracking-[.2em] text-[#9a8066]">WELCOME TO LESOUL</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight">나만의 룩을<br />시작해 볼까요?</h2>
        <p className="mt-4 text-sm leading-6 text-[#76685d]">로그인하면 사진 업로드부터 생성된 스타일의 저장까지 편하게 이어갈 수 있어요.</p>
        <button onClick={proceed} className="mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-[#3f342d] px-5 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#59483b] active:scale-[.98]">Manus로 계속하기 <ArrowRight size={17} /></button>
        <p className="mt-5 text-center text-xs leading-5 text-[#9a8e83]">계속하면 LESOUL LOOK의 이용 방식에 동의하는 것으로 간주합니다.</p>
      </section>
    </main>
  </div>;
}
