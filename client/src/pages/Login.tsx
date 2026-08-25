import MobileScreen from "@/components/MobileScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVisitorId, restoreVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type LoginMode = "normal" | "admin";

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<LoginMode>("normal");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [visitorId] = useState(() => getVisitorId());
  const guestLogin = trpc.auth.guestLogin.useMutation();
  const adminLogin = trpc.auth.adminLogin.useMutation();
  const next = new URLSearchParams(window.location.search).get("next") || "/";

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const finishNormal = (destination = safeNext) => {
    void utils.auth.testSession.invalidate().catch(() => undefined);
    void utils.auth.me.invalidate().catch(() => undefined);
    navigate(destination);
  };

  async function continueAsGuest() {
    setMessage("");
    try {
      const result = await guestLogin.mutateAsync({ visitorId });
      restoreVisitorId(result.visitorId);
      finishNormal();
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  async function submitAdmin(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const result = await adminLogin.mutateAsync({ username, password });
      if (!result.success) return setMessage(result.reason === "inactive" ? t("auth.adminInactive") : t("auth.adminInvalid"));
      void utils.auth.me.invalidate().catch(() => undefined);
      navigate("/operations");
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  const pending = guestLogin.isPending || adminLogin.isPending;
  return <MobileScreen>
    <main className="mx-auto flex min-h-[72svh] w-full max-w-md items-center px-5 pb-14">
      <section className="w-full rounded-[2rem] border border-[#dfd9cf] bg-[#fffdf9] p-6 shadow-[0_18px_60px_rgba(37,30,24,.09)]">
        <span className="grid size-11 place-items-center rounded-full bg-[#1d1a17] text-white"><LockKeyhole size={18} /></span>
        <p className="mt-5 text-[10px] font-bold tracking-[.2em] text-[#786f65]">{t("auth.eyebrow")}</p>
        <h1 className="mt-2 font-serif text-4xl text-[#201c18]">{t("auth.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-[#71685f]">{t("auth.body")}</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#f1ede6] p-1">
          <button type="button" onClick={() => { setMode("normal"); setMessage(""); }} className={`h-10 rounded-lg text-[11px] font-bold ${mode === "normal" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.normalTab")}</button>
          <button type="button" onClick={() => { setMode("admin"); setMessage(""); }} className={`h-10 rounded-lg text-[11px] font-bold ${mode === "admin" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.adminTab")}</button>
        </div>

        {mode === "normal" ? <div className="mt-5">
          <p className="text-[11px] leading-5 text-[#71685f]">{t("auth.guestBody")}</p>
          <button type="button" onClick={() => void continueAsGuest()} disabled={pending} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#1d1a17] px-4 py-4 text-left text-white transition hover:bg-black active:scale-[.99] disabled:opacity-60">
            <span><span className="block text-sm font-semibold">{guestLogin.isPending ? t("common.loading") : t("auth.guestSubmit")}</span><span className="mt-1 block text-[10px] text-white/65">{t("auth.normalBody")}</span></span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div> : <form onSubmit={submitAdmin} className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-[#e2ddd5] bg-[#f8f5f0] p-4"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#413b34]" /><p className="text-[10px] font-bold tracking-[.15em] text-[#766b60]">{t("auth.adminBody")}</p></div><p className="mt-2 text-[11px] leading-5 text-[#71685f]">{t("auth.ownerOnly")}</p></div>
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.username")}<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.password")}<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          {message && <p role="alert" className="rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}
          <Button type="submit" disabled={pending} className="mt-2 h-11 rounded-xl bg-[#1d1a17] text-xs font-bold tracking-[.08em] hover:bg-black">{adminLogin.isPending ? t("common.loading") : t("auth.adminSubmit")} <ArrowRight size={15} /></Button>
        </form>}
        {mode === "normal" && message && <p role="alert" className="mt-4 rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}
      </section>
    </main>
  </MobileScreen>;
}
