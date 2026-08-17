import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Heart, Menu, Sparkles } from "lucide-react";

export default function AppHeader() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="LESOUL LOOK 홈">
        <span className="grid size-8 place-items-center rounded-full bg-[#3b312b] text-[13px] text-[#fffdf8] shadow-[0_4px_15px_rgba(59,49,43,.18)] transition-transform duration-200 group-hover:rotate-12"><Sparkles size={14} /></span>
        <span className="font-serif text-[19px] font-semibold tracking-[0.16em] text-[#352d28]">LESOUL</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-5">
        {isAuthenticated && <button onClick={() => navigate("/gallery")} className="hidden items-center gap-2 text-sm font-medium text-[#63564d] transition-colors hover:text-[#352d28] sm:flex"><Heart size={16} /> My looks</button>}
        <button onClick={() => navigate(isAuthenticated ? "/upload" : "/auth")} className="whitespace-nowrap rounded-full border border-[#dcd1c2] bg-[#fffdf8]/80 px-3.5 py-2 text-xs font-semibold tracking-[0.08em] text-[#50453d] backdrop-blur transition hover:border-[#8b7355] hover:bg-white sm:px-4">{isAuthenticated ? <><span className="sm:hidden">새 룩</span><span className="hidden sm:inline">새 룩 만들기</span></> : "로그인"}</button>
        <Menu size={18} className="text-[#6f6258] sm:hidden" />
      </nav>
    </header>
  );
}
