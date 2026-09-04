import { trpc } from "@/lib/trpc";
import { KeyRound, MonitorPlay, Power } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type StoreDisplayAccount = {
  cameraActive?: boolean;
  cameraEnabled?: boolean;
  displayName?: string;
  user: { id: number; username: string | null; name: string | null; isActive: number };
};

export function StoreDisplayAccountManager({ accounts, onChanged }: { accounts: StoreDisplayAccount[]; onChanged: () => void }) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko"
    ? { title: "매장 디스플레이 계정", body: "이 계정은 큰 상품 보기와 방문 알림 전용입니다. 아래 초록불은 최근 2분 안에 카메라가 켜진 디스플레이를 뜻합니다.", id: "디스플레이 ID", password: "비밀번호", name: "표시 이름 (선택)", create: "디스플레이 계정 저장", created: "디스플레이 계정이 생성되었습니다", active: "활성", inactive: "비활성", reset: "비밀번호 재설정", save: "저장", noAccounts: "아직 디스플레이 계정이 없습니다.", duplicate: "이미 사용 중인 디스플레이 ID입니다.", idLabel: "ID", error: "요청을 처리하지 못했습니다. 다시 시도해 주세요.", online: "카메라 켜짐", offline: "카메라 꺼짐", detectionOn: "감지 허용 ON", detectionOff: "감지 허용 OFF", cameraError: "카메라 설정을 저장하지 못했습니다." }
    : locale === "zh"
      ? { title: "店铺展示账户", body: "该账户仅可大图浏览商品和使用到店提醒。绿色指示表示最近 2 分钟内摄像头处于开启状态。", id: "展示 ID", password: "密码", name: "显示名称（可选）", create: "保存展示账户", created: "展示账户已创建", active: "启用", inactive: "停用", reset: "重设密码", save: "保存", noAccounts: "暂无展示账户。", duplicate: "该展示 ID 已被使用。", idLabel: "ID", error: "无法完成请求，请稍后重试。", online: "摄像头已开启", offline: "摄像头已关闭", detectionOn: "允许识别 ON", detectionOff: "允许识别 OFF", cameraError: "无法保存摄像头设置。" }
      : { title: "STORE DISPLAY ACCOUNTS", body: "This account only shows large products and the visitor alert. A green indicator means its camera was active within the last two minutes.", id: "DISPLAY ID", password: "PASSWORD", name: "Display name (optional)", create: "SAVE DISPLAY ACCOUNT", created: "Display account created", active: "Active", inactive: "Inactive", reset: "Reset password", save: "Save", noAccounts: "No display accounts yet.", duplicate: "This display ID is already in use.", idLabel: "ID", error: "We couldn't complete the request. Please try again.", online: "Camera on", offline: "Camera off", detectionOn: "Detection ON", detectionOff: "Detection OFF", cameraError: "We couldn't save the camera setting." };
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notice, setNotice] = useState("");
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const create = trpc.operations.createStoreDisplayAccount.useMutation({ onSuccess: (result) => { setUsername(""); setPassword(""); setDisplayName(""); setNotice(`${copy.created}: ${result.username}`); onChanged(); }, onError: (error) => setNotice(error.message.includes("STORE_DISPLAY_ID_ALREADY_EXISTS") ? copy.duplicate : copy.error) });
  const update = trpc.operations.updateStoreDisplayAccount.useMutation({ onSuccess: () => { setResettingId(null); setResetPassword(""); setNotice(copy.save); onChanged(); }, onError: () => setNotice(copy.error) });
  const cameraUpdate = trpc.operations.updateStoreDisplayCamera.useMutation({ onSuccess: () => onChanged(), onError: () => setNotice(copy.cameraError) });
  const pending = create.isPending || update.isPending || cameraUpdate.isPending;
  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
    <div className="flex items-center gap-2"><MonitorPlay size={16} /><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{copy.title}</p></div>
    <p className="mt-3 text-xs leading-5 text-[#675e55]">{copy.body}</p>
    <form onSubmit={(event) => { event.preventDefault(); setNotice(""); create.mutate({ username, password, displayName: displayName || undefined }); }} className="mt-4 grid gap-2 sm:grid-cols-3">
      <label className="text-[10px] font-bold text-[#655c53]">{copy.id}<input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
      <label className="text-[10px] font-bold text-[#655c53]">{copy.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
      <label className="text-[10px] font-bold text-[#655c53]">{copy.name}<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#ddd6cc] px-3 text-sm" /></label>
      <button disabled={pending} className="h-10 rounded-xl bg-black text-[11px] font-bold text-white disabled:opacity-50 sm:col-span-3">{copy.create}</button>
    </form>
    {notice && <p className="mt-3 rounded-xl bg-[#f5f1eb] p-2 text-[11px] text-[#655c53]">{notice}</p>}
    <div className="mt-4 space-y-2">{accounts.length ? accounts.map((account) => <article key={account.user.id} className="rounded-xl bg-[#f7f4ef] p-3">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{account.displayName || account.user.name || copy.title}</p><p className="mt-1 text-[10px] font-semibold tracking-[.08em] text-[#6d6258]">{copy.idLabel} · {account.user.username}</p><p className="mt-1 text-[10px] text-[#776e65]">{account.user.isActive ? copy.active : copy.inactive}</p></div><button type="button" onClick={() => update.mutate({ userId: account.user.id, isActive: !Boolean(account.user.isActive) })} disabled={pending} className="rounded-lg border border-[#cdbfb1] px-2.5 py-1.5 text-[10px] font-bold">{account.user.isActive ? copy.inactive : copy.active}</button></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2"><span className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#62574e]"><span className={`size-2.5 rounded-full ${account.cameraActive ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.15)]" : "bg-[#b9b0a6]"}`} />{account.cameraActive ? copy.online : copy.offline}</span><button type="button" onClick={() => cameraUpdate.mutate({ userId: account.user.id, enabled: !Boolean(account.cameraEnabled) })} disabled={pending || !account.user.isActive} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${account.cameraEnabled ? "bg-emerald-600 text-white" : "bg-[#e8e1d9] text-[#655b52]"}`}><Power size={12} />{account.cameraEnabled ? copy.detectionOn : copy.detectionOff}</button></div>
      {resettingId === account.user.id ? <div className="mt-3 flex gap-2"><input type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} minLength={8} autoComplete="new-password" className="h-9 min-w-0 flex-1 rounded-lg border border-[#ddd6cc] px-2 text-xs" /><button type="button" onClick={() => update.mutate({ userId: account.user.id, newPassword: resetPassword })} disabled={resetPassword.length < 8 || pending} className="rounded-lg bg-black px-3 text-[10px] font-bold text-white">{copy.save}</button></div> : <button type="button" onClick={() => setResettingId(account.user.id)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#655c53]"><KeyRound size={12} />{copy.reset}</button>}
    </article>) : <p className="text-sm text-[#746a61]">{copy.noAccounts}</p>}</div>
  </section>;
}
