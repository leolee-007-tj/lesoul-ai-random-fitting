import { Link, useLocation } from "wouter";
import { Archive, Menu, PackagePlus, Sparkles } from "lucide-react";

export default function AppHeader() {
  const [, navigate] = useLocation();
  return <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="LESOUL AI LOOK home"><span className="grid size-8 place-items-center rounded-full bg-[#171717] text-[13px] text-[#fffdf8] shadow-[0_4px_15px_rgba(20,20,20,.18)] transition-transform duration-200 group-hover:rotate-12"><Sparkles size={14} /></span><span className="font-serif text-[18px] font-semibold tracking-[0.12em] text-[#191919]">LESOUL <span className="font-sans text-[10px] tracking-[.2em]">AI LOOK</span></span></Link>
    <nav className="flex items-center gap-2 sm:gap-5"><button onClick={() => navigate("/history")} className="hidden items-center gap-2 text-sm font-medium text-[#4c4c4c] transition-colors hover:text-black sm:flex"><Archive size={16} /> History</button><button onClick={() => navigate("/products")} className="hidden items-center gap-2 text-sm font-medium text-[#4c4c4c] transition-colors hover:text-black md:flex"><PackagePlus size={16} /> Products</button><button onClick={() => navigate("/studio")} className="whitespace-nowrap rounded-full border border-[#d4d0c8] bg-white px-3.5 py-2 text-xs font-semibold tracking-[.08em] text-[#222] transition hover:border-[#111] hover:bg-[#f8f8f6] sm:px-4">Create Look</button><Menu size={18} className="text-[#383838] sm:hidden" /></nav>
  </header>;
}
