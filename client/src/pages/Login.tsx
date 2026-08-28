import MobileScreen from "@/components/MobileScreen";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearExplicitLogout, getVisitorId, restoreVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { ArrowRight, KeyRound, LockKeyhole, MonitorPlay, ShieldCheck, Store } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

type LoginMode = "normal" | "vip" | "trial" | "display" | "admin";

export default function Login() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<LoginMode>("normal");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [visitorId] = useState(() => getVisitorId());
  const guestLogin = trpc.auth.guestLogin.useMutation();
  const vipLogin = trpc.auth.vipLogin.useMutation();
  const storeDisplayLogin = trpc.auth.storeDisplayLogin.useMutation();
  const trialStoreLogin = trpc.auth.trialStoreLogin.useMutation();
  const adminLogin = trpc.auth.adminLogin.useMutation();
  const next = new URLSearchParams(window.location.search).get("next") || "/";
  const displayCopy = i18n.language.startsWith("ko") ? { tab: "매장 디스플레이", body: "매장 화면 전용 계정입니다. 큰 상품 보기와 방문 알림만 사용할 수 있습니다.", submit: "디스플레이 시작", invalid: "디스플레이 ID 또는 비밀번호가 올바르지 않습니다.", inactive: "이 디스플레이 계정은 현재 비활성 상태입니다." } : i18n.language.startsWith("zh") ? { tab: "店铺展示", body: "这是店铺展示专用账户，仅可浏览大图商品和使用到店提醒。", submit: "进入展示模式", invalid: "展示 ID 或密码不正确。", inactive: "此展示账户当前已停用。" } : { tab: "STORE DISPLAY", body: "This store-display account can only browse large products and use the visitor alert.", submit: "START DISPLAY", invalid: "The display ID or password is incorrect.", inactive: "This display account is currently inactive." };

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
      clearExplicitLogout();
      restoreVisitorId(result.visitorId);
      finishNormal();
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  function continueAsOwner() {
    clearExplicitLogout();
    startLogin("/operations");
  }

  async function submitCredentials(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const result = mode === "vip"
        ? await vipLogin.mutateAsync({ username, password })
        : mode === "trial"
          ? await trialStoreLogin.mutateAsync({ username, password })
          : mode === "display"
            ? await storeDisplayLogin.mutateAsync({ username, password })
            : await adminLogin.mutateAsync({ username, password });
      if (!result.success) {
        const inactiveCopy = mode === "vip" ? t("auth.vipInactive") : mode === "trial" ? t("auth.trialInactive") : mode === "display" ? displayCopy.inactive : t("auth.adminInactive");
        const invalidCopy = mode === "vip" ? t("auth.vipInvalid") : mode === "trial" ? t("auth.trialInvalid") : mode === "display" ? displayCopy.invalid : t("auth.adminInvalid");
        return setMessage(result.reason === "inactive" ? inactiveCopy : invalidCopy);
      }
      clearExplicitLogout();
      void utils.auth.me.invalidate().catch(() => undefined);
      if (mode === "admin") navigate("/operations");
      else if (mode === "trial") navigate("/trial-store");
      else if (mode === "display") navigate("/store-display");
      else navigate(safeNext);
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  const pending = guestLogin.isPending || vipLogin.isPending || trialStoreLogin.isPending || storeDisplayLogin.isPending || adminLogin.isPending;
  const setLoginMode = (nextMode: LoginMode) => { setMode(nextMode); setMessage(""); };
  const credentialMode = mode !== "normal";
  const credentialIcon = mode === "vip" ? <KeyRound size={16} className="text-[#413b34]" /> : mode === "trial" ? <Store size={16} className="text-[#413b34]" /> : mode === "display" ? <MonitorPlay size={16} className="text-[#413b34]" /> : <ShieldCheck size={16} className="text-[#413b34]" />;
  const credentialBody = mode === "vip" ? t("auth.vipBody") : mode === "trial" ? t("auth.trialBody") : mode === "display" ? displayCopy.body : t("auth.adminBody");
  const credentialSubmit = mode === "vip" ? t("auth.vipSubmit") : mode === "trial" ? t("auth.trialSubmit") : mode === "display" ? displayCopy.submit : t("auth.adminSubmit");

  return <MobileScreen>
    <main className="mx-auto flex min-h-[72svh] w-full max-w-md items-center px-5 pb-14">
      <section className="w-full rounded-[2rem] border border-[#dfd9cf] bg-[#fffdf9] p-6 shadow-[0_18px_60px_rgba(37,30,24,.09)]">
        <span className="grid size-11 place-items-center rounded-full bg-[#1d1a17] text-white"><LockKeyhole size={18} /></span>
        <p className="mt-5 text-[10px] font-bold tracking-[.2em] text-[#786f65]">{t("auth.eyebrow")}</p>
        <h1 className="mt-2 font-serif text-4xl text-[#201c18]">{t("auth.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-[#71685f]">{t("auth.body")}</p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-[#f1ede6] p-1 sm:grid-cols-5">
          {(["normal", "vip", "trial", "display", "admin"] as const).map((item) => <button key={item} type="button" onClick={() => setLoginMode(item)} className={`h-10 rounded-lg text-[11px] font-bold ${mode === item ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{item === "display" ? displayCopy.tab : t(`auth.${item === "normal" ? "normalTab" : item === "vip" ? "vipTab" : item === "trial" ? "trialTab" : "adminTab"}`)}</button>)}
        </div>

        {!credentialMode ? <div className="mt-5">
          <p className="text-[11px] leading-5 text-[#71685f]">{t("auth.guestBody")}</p>
          <button type="button" onClick={() => void continueAsGuest()} disabled={pending} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#1d1a17] px-4 py-4 text-left text-white transition hover:bg-black active:scale-[.99] disabled:opacity-60">
            <span><span className="block text-sm font-semibold">{guestLogin.isPending ? t("common.loading") : t("auth.guestSubmit")}</span><span className="mt-1 block text-[10px] text-white/65">{t("auth.normalBody")}</span></span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div> : <>
          {mode === "admin" && <div className="mt-5 rounded-2xl border border-[#ded8cf] bg-[#f8f5f0] p-4"><p className="text-[11px] leading-5 text-[#71685f]">{t("auth.ownerOnly")}</p><button type="button" onClick={continueAsOwner} className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-[#1d1a17] px-4 py-3 text-left text-white transition hover:bg-black active:scale-[.99]"><span><span className="block text-sm font-semibold">{t("auth.ownerSubmit")}</span><span className="mt-1 block text-[10px] text-white/65">{t("auth.ownerBody")}</span></span><ArrowRight size={17} aria-hidden="true" /></button></div>}
          <form onSubmit={submitCredentials} className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-[#e2ddd5] bg-[#f8f5f0] p-4"><div className="flex items-center gap-2">{credentialIcon}<p className="text-[10px] font-bold tracking-[.15em] text-[#766b60]">{credentialSubmit}</p></div><p className="mt-2 text-[11px] leading-5 text-[#71685f]">{credentialBody}</p>{mode === "admin" && <p className="mt-2 text-[11px] leading-5 text-[#71685f]">{t("auth.ownerOnly")}</p>}</div>
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.username")}<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          <label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.password")}<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-11 border-[#d8d1c8] bg-white" /></label>
          {message && <p role="alert" className="rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}
          <Button type="submit" disabled={pending} className="mt-2 h-11 rounded-xl bg-[#1d1a17] text-xs font-bold tracking-[.08em] hover:bg-black">{pending ? t("common.loading") : credentialSubmit} <ArrowRight size={15} /></Button>
          </form>
        </>}
        {mode === "normal" && message && <p role="alert" className="mt-4 rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}
      </section>
    </main>
  </MobileScreen>;
}
