import MobileScreen from "@/components/MobileScreen";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVisitorId, restoreVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type SecondaryMode = "vip" | "trial";

export default function Login() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<SecondaryMode>("vip");
  const [message, setMessage] = useState("");
  const [visitorId] = useState(() => getVisitorId());
  const guestLogin = trpc.auth.guestLogin.useMutation();
  const vipLogin = trpc.auth.vipLogin.useMutation();
  const trialLogin = trpc.auth.trialStoreLogin.useMutation();
  const next = new URLSearchParams(window.location.search).get("next") || "/";
  const trialText = i18n.language.startsWith("ko")
    ? { tab: "매장 체험", body: "실제 운영 데이터와 분리된 48시간 체험 매장입니다.", submit: "체험 매장 로그인", invalid: "체험 매장 ID 또는 비밀번호를 확인하세요.", inactive: "이 체험 매장은 비활성화되었습니다." }
    : i18n.language.startsWith("zh")
      ? { tab: "店铺体验", body: "这是与正式运营数据隔离的 48 小时体验店铺。", submit: "登录体验店铺", invalid: "请检查体验店铺 ID 或密码。", inactive: "此体验店铺已停用。" }
      : { tab: "Store trial", body: "A 48-hour store workspace separated from production data.", submit: "Sign in to trial store", invalid: "Check the trial store ID and password.", inactive: "This trial store is inactive." };

  const finishCustomerEntry = (destination = next) => {
    void utils.auth.testSession.invalidate().catch(() => undefined);
    void utils.auth.me.invalidate().catch(() => undefined);
    navigate(destination.startsWith("/") && !destination.startsWith("//") ? destination : "/");
  };

  async function continueAsGuest() {
    setMessage("");
    try {
      const result = await guestLogin.mutateAsync({ visitorId });
      restoreVisitorId(result.visitorId);
      finishCustomerEntry();
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "vip") {
        const result = await vipLogin.mutateAsync({ username, password });
        if (!result.success) return setMessage(result.reason === "inactive" ? t("auth.vipInactive") : t("auth.vipInvalid"));
        finishCustomerEntry();
        return;
      }
      const result = await trialLogin.mutateAsync({ username, password });
      if (!result.success) return setMessage(result.reason === "inactive" ? trialText.inactive : trialText.invalid);
      navigate("/trial-store");
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  const pending = guestLogin.isPending || vipLogin.isPending || trialLogin.isPending;
  return <MobileScreen>
    <main className="mx-auto flex min-h-[72svh] w-full max-w-md items-center px-5 pb-14">
      <section className="w-full rounded-[2rem] border border-[#dfd9cf] bg-[#fffdf9] p-6 shadow-[0_18px_60px_rgba(37,30,24,.09)]">
        <span className="grid size-11 place-items-center rounded-full bg-[#1d1a17] text-white"><LockKeyhole size={18} /></span>
        <p className="mt-5 text-[10px] font-bold tracking-[.2em] text-[#786f65]">{t("auth.eyebrow")}</p>
        <h1 className="mt-2 font-serif text-4xl text-[#201c18]">{t("auth.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-[#71685f]">{t("auth.body")}</p>

        <button type="button" onClick={() => void continueAsGuest()} disabled={pending} className="mt-6 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#1d1a17] px-4 py-4 text-left text-white transition hover:bg-black active:scale-[.99] disabled:opacity-60">
          <span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><ArrowRight size={16} /></span><span><span className="block text-sm font-semibold">{pending && guestLogin.isPending ? t("common.loading") : t("auth.guestSubmit")}</span><span className="mt-1 block text-[10px] text-white/65">{t("auth.guestBody")}</span></span></span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] font-bold tracking-[.18em] text-[#a0978d]"><span className="h-px flex-1 bg-[#e5dfd7]" /><span>OR</span><span className="h-px flex-1 bg-[#e5dfd7]" /></div>

        <div className="grid grid-cols-2 rounded-xl bg-[#f1ede6] p-1">
          <button type="button" onClick={() => { setMode("vip"); setMessage(""); }} className={`h-9 rounded-lg text-[11px] font-bold ${mode === "vip" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.vipTab")}</button>
          <button type="button" onClick={() => { setMode("trial"); setMessage(""); }} className={`h-9 rounded-lg text-[11px] font-bold ${mode === "trial" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{trialText.tab}</button>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#71685f]">{mode === "vip" ? t("auth.vipBody") : trialText.body}</p>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.username")}<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.password")}<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          {message && <p role="alert" className="rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}
          <Button type="submit" disabled={pending} className="mt-2 h-11 rounded-xl bg-[#1d1a17] text-xs font-bold tracking-[.08em] hover:bg-black">{pending && !guestLogin.isPending ? t("common.loading") : mode === "vip" ? t("auth.vipSubmit") : trialText.submit} <ArrowRight size={15} /></Button>
        </form>

        <div className="mt-6 rounded-2xl border border-[#e2ddd5] bg-[#f8f5f0] p-4">
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#413b34]" /><p className="text-[10px] font-bold tracking-[.15em] text-[#766b60]">{t("auth.ownerSubmit")}</p></div>
          <p className="mt-2 text-[11px] leading-5 text-[#71685f]">{t("auth.ownerBody")}</p>
          <button type="button" onClick={() => startLogin(next)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#cfc7bd] bg-white px-3 py-2.5 text-xs font-bold text-[#332e29] transition hover:border-[#1d1a17]"><KeyRound size={14} />{t("auth.ownerSubmit")}</button>
          <p className="mt-2 text-[10px] leading-4 text-[#8a8177]">{t("auth.ownerOnly")}</p>
        </div>
      </section>
    </main>
  </MobileScreen>;
}
