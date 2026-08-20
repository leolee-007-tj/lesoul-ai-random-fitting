import MobileScreen from "@/components/MobileScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"normal" | "vip" | "admin">("normal");
  const [message, setMessage] = useState("");
  const [visitorId] = useState(() => getVisitorId());
  const testLogin = trpc.auth.testLogin.useMutation();
  const vipLogin = trpc.auth.vipLogin.useMutation();
  const adminLogin = trpc.auth.adminLogin.useMutation();
  const next = new URLSearchParams(window.location.search).get("next") || "/";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "normal") {
        const result = await testLogin.mutateAsync({ username, password, visitorId });
        if (!result.success) return setMessage(t("auth.invalid"));
      } else if (mode === "vip") {
        const result = await vipLogin.mutateAsync({ username, password });
        if (!result.success) return setMessage(result.reason === "inactive" ? t("auth.vipInactive") : t("auth.vipInvalid"));
      } else {
        const result = await adminLogin.mutateAsync({ username, password });
        if (!result.success) return setMessage(result.reason === "inactive" ? t("auth.adminInactive") : t("auth.adminInvalid"));
      }
      await utils.auth.testSession.invalidate();
      await utils.auth.me.invalidate();
      navigate(mode === "admin" ? "/operations" : next.startsWith("/") ? next : "/");
    } catch {
      setMessage(t("auth.unavailable"));
    }
  }

  const pending = testLogin.isPending || vipLogin.isPending || adminLogin.isPending;
  return <MobileScreen><main className="mx-auto flex min-h-[72svh] w-full max-w-md items-center px-5 pb-14"><section className="w-full rounded-[2rem] border border-[#dfd9cf] bg-[#fffdf9] p-6 shadow-[0_18px_60px_rgba(37,30,24,.09)]"><span className="grid size-11 place-items-center rounded-full bg-[#1d1a17] text-white"><LockKeyhole size={18} /></span><p className="mt-5 text-[10px] font-bold tracking-[.2em] text-[#786f65]">{t("auth.eyebrow")}</p><h1 className="mt-2 font-serif text-4xl text-[#201c18]">{t("auth.title")}</h1><p className="mt-3 text-sm leading-6 text-[#71685f]">{t("auth.body")}</p><div className="mt-6 grid grid-cols-3 rounded-xl bg-[#f1ede6] p-1"><button onClick={() => { setMode("normal"); setMessage(""); }} className={`h-9 rounded-lg text-[11px] font-bold ${mode === "normal" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.normalTab")}</button><button onClick={() => { setMode("vip"); setMessage(""); }} className={`h-9 rounded-lg text-[11px] font-bold ${mode === "vip" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.vipTab")}</button><button onClick={() => { setMode("admin"); setMessage(""); }} className={`h-9 rounded-lg text-[11px] font-bold ${mode === "admin" ? "bg-white shadow-sm" : "text-[#74695e]"}`}>{t("auth.adminTab")}</button></div><p className="mt-3 text-[11px] leading-5 text-[#71685f]">{mode === "normal" ? t("auth.normalBody") : mode === "vip" ? t("auth.vipBody") : t("auth.adminBody")}</p><form onSubmit={submit} className="mt-5 grid gap-3"><label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.username")}<Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-11 border-[#d8d1c8] bg-white" /></label><label className="grid gap-1.5 text-[11px] font-bold tracking-[.08em] text-[#5f574f]">{t("auth.password")}<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-11 border-[#d8d1c8] bg-white" /></label>{message && <p role="alert" className="rounded-xl bg-[#f9eee8] px-3 py-2 text-xs text-[#8b3d25]">{message}</p>}<Button type="submit" disabled={pending} className="mt-2 h-11 rounded-xl bg-[#1d1a17] text-xs font-bold tracking-[.08em] hover:bg-black">{pending ? t("common.loading") : <>{mode === "vip" ? t("auth.vipSubmit") : mode === "admin" ? t("auth.adminSubmit") : t("auth.submit")} <ArrowRight size={15} /></>}</Button></form>{mode === "normal" && <p className="mt-5 rounded-xl bg-[#f5f1ea] p-3 text-[11px] leading-5 text-[#71685f]">{t("auth.note")}</p>}<p className="mt-4 text-center text-[11px] text-[#8a8177]">{t("auth.admin")}</p></section></main></MobileScreen>;
}
