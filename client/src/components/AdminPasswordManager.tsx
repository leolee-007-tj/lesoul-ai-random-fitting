import { trpc } from "@/lib/trpc";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type AdminAccount = {
  id: number;
  username: string | null;
  name: string | null;
  isActive: number;
  isPrimaryAdmin?: number | null;
};

export function AdminPasswordManager({ accounts }: { accounts: AdminAccount[] }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const reset = trpc.operations.setAdminPassword.useMutation({
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
      setNotice(t("adminPassword.updated"));
    },
    onError: (error) => setNotice(error.message),
  });
  const primary = accounts.find((account) => Boolean(account.isPrimaryAdmin)) ?? accounts.find((account) => Boolean(account.username));
  useEffect(() => { if (primary?.username) setUsername(primary.username); }, [primary?.username]);
  const mismatch = Boolean(confirmPassword) && newPassword !== confirmPassword;
  const validUsername = /^[A-Za-z0-9._-]{3,64}$/.test(username.trim());
  const canSubmit = Boolean(primary?.id && validUsername && newPassword.length >= 8 && confirmPassword.length >= 8 && !mismatch && !reset.isPending);

  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
    <div className="flex items-center gap-2"><ShieldCheck size={16} /><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{t("adminPassword.title")}</p></div>
    <p className="mt-3 text-sm leading-6 text-[#675e55]">{t("adminPassword.body")}</p>
    {primary ? <>
      <div className="mt-4 rounded-xl bg-[#f7f4ef] p-3"><p className="text-[10px] font-bold tracking-[.12em] text-[#766b60]">{t("adminPassword.account")}</p><p className="mt-1 text-sm font-semibold">{primary.username || primary.name || t("adminPassword.primary")}</p><p className="mt-1 text-[10px] text-[#776e65]">{primary.isActive ? t("adminPassword.active") : t("adminPassword.inactive")}</p></div>
      <form onSubmit={(event) => { event.preventDefault(); setNotice(""); if (!canSubmit || !primary) return; reset.mutate({ userId: primary.id, username: username.trim(), newPassword }); }} className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="sm:col-span-2 text-[10px] font-bold text-[#655c53]">{t("adminPassword.username")}<input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={64} autoComplete="username" className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" required /><span className="mt-1 block font-normal leading-4 text-[#776e65]">{t("adminPassword.usernameHelp")}</span></label>
        <label className="text-[10px] font-bold text-[#655c53]">{t("adminPassword.newPassword")}<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" required /></label>
        <label className="text-[10px] font-bold text-[#655c53]">{t("adminPassword.confirmPassword")}<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" required /></label>
        {!validUsername && Boolean(username) && <p role="alert" className="sm:col-span-2 text-[11px] text-[#8b3d25]">{t("adminPassword.usernameInvalid")}</p>}{mismatch && <p role="alert" className="sm:col-span-2 text-[11px] text-[#8b3d25]">{t("adminPassword.mismatch")}</p>}
        <button type="submit" disabled={!canSubmit} className="sm:col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black text-[11px] font-bold text-white disabled:opacity-50"><KeyRound size={13} />{reset.isPending ? t("common.loading") : t("adminPassword.save")}</button>
      </form>
    </> : <p className="mt-4 rounded-xl bg-[#f7f4ef] p-3 text-sm text-[#746a61]">{t("adminPassword.noAccount")}</p>}
    {notice && <p role="status" className="mt-3 rounded-xl bg-[#f5f1eb] p-2 text-[11px] text-[#655c53]">{notice}</p>}
  </section>;
}
