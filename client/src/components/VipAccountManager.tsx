import { AiProviderPanel } from "@/components/AiProviderPanel";
import { ProductShareAnalyticsPanel } from "@/components/ProductShareAnalyticsPanel";
import { LiyingReferenceModelManager } from "@/components/LiyingReferenceModelManager";
import { trpc } from "@/lib/trpc";
import { KeyRound, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type VipAccount = {
  displayName?: string;
  user: {
    id: number;
    username: string | null;
    name: string | null;
    isActive: number;
    lastSignedIn: Date;
    role?: string;
  };
  aiRequestCount: number;
  usageByFeature?: Record<string, number>;
  latestAiRequestAt: Date | null;
};

export function VipAccountManager({ accounts, onChanged, includeRelatedManagers = true }: { accounts: VipAccount[]; onChanged: () => void; includeRelatedManagers?: boolean }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notice, setNotice] = useState("");
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const create = trpc.operations.createVipAccount.useMutation({
    onSuccess: () => {
      setUsername("");
      setPassword("");
      setDisplayName("");
      setNotice(t("vipAdmin.created"));
      onChanged();
    },
    onError: (error) => setNotice(error.message.includes("VIP_ID_ALREADY_EXISTS") ? t("vipAdmin.duplicate") : error.message),
  });
  const update = trpc.operations.updateVipAccount.useMutation({
    onSuccess: () => {
      setResettingId(null);
      setResetPassword("");
      setNotice(t("vipAdmin.updated"));
      onChanged();
    },
    onError: (error) => setNotice(error.message),
  });
  const pending = create.isPending || update.isPending;

  return <>
    {includeRelatedManagers && <><AiProviderPanel /><ProductShareAnalyticsPanel /></>}
    <LiyingReferenceModelManager />
    <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
      <div className="flex items-center gap-2"><UserPlus size={16} /><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{t("vipAdmin.title")}</p></div>
      <form onSubmit={(event) => { event.preventDefault(); setNotice(""); create.mutate({ username, password, displayName: displayName || undefined }); }} className="mt-4 grid gap-2 sm:grid-cols-3">
        <label className="text-[10px] font-bold text-[#655c53]">{t("vipAdmin.id")}<input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
        <label className="text-[10px] font-bold text-[#655c53]">{t("vipAdmin.password")}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
        <label className="text-[10px] font-bold text-[#655c53]">{t("vipAdmin.displayName")}<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
        <button disabled={pending} className="sm:col-span-3 h-10 rounded-xl bg-black text-[11px] font-bold text-white disabled:opacity-50">{t("vipAdmin.save")}</button>
      </form>
      {notice && <p className="mt-3 rounded-xl bg-[#f5f1eb] p-2 text-[11px] text-[#655c53]">{notice}</p>}
      <div className="mt-4 space-y-2">
        {accounts.length ? accounts.map((account) => <article key={account.user.id} className="rounded-xl bg-[#f7f4ef] p-3">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-semibold">{account.displayName || account.user.name || t("vipAdmin.title")}</p><p className="mt-1 text-[10px] text-[#776e65]">{account.user.isActive ? t("vipAdmin.active") : t("vipAdmin.inactive")}</p><p className="mt-1 text-[10px] text-[#776e65]">{t("vipAdmin.usage")}: {account.aiRequestCount} · {Object.entries(account.usageByFeature ?? {}).map(([feature, count]) => `${feature}: ${count}`).join(" · ") || "—"}</p></div>
            <button onClick={() => update.mutate({ userId: account.user.id, isActive: !Boolean(account.user.isActive) })} disabled={pending} className="rounded-lg border border-[#cdbfb1] px-2.5 py-1.5 text-[10px] font-bold">{account.user.isActive ? t("vipAdmin.inactive") : t("vipAdmin.active")}</button>
          </div>
          {resettingId === account.user.id ? <div className="mt-3 flex gap-2"><input type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} minLength={8} className="h-9 min-w-0 flex-1 rounded-lg border border-[#ddd6cc] px-2 text-xs" /><button onClick={() => update.mutate({ userId: account.user.id, newPassword: resetPassword })} disabled={resetPassword.length < 8 || pending} className="rounded-lg bg-black px-3 text-[10px] font-bold text-white">{t("vipAdmin.save")}</button></div> : <button onClick={() => setResettingId(account.user.id)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#655c53]"><KeyRound size={12} />{t("vipAdmin.resetPassword")}</button>}
        </article>) : <p className="text-sm text-[#746a61]">{t("vipAdmin.noAccounts")}</p>}
      </div>
    </section>
  </>;
}
