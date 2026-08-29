import MobileScreen from "@/components/MobileScreen";
import { trpc } from "@/lib/trpc";
import { VipAccountManager } from "@/components/VipAccountManager";
import CategoryManagementPanel from "@/components/CategoryManagementPanel";
import { CircleDollarSign, Ruler, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function OperationsDashboard() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko" ? { eyebrow: "OWNER OPERATIONS", title: "운영 대시보드", subtitle: "상품, 계정, 매장 운영 정보를 관리합니다. 이미지 생성 기능은 사용하지 않습니다.", categories: "종류 · 치수 관리", users: "계정 현황", vip: "VIP", normal: "일반", none: "등록된 계정이 없습니다." } : locale === "zh" ? { eyebrow: "OWNER OPERATIONS", title: "运营仪表盘", subtitle: "管理商品、账户与店铺运营信息。此处不使用图片生成功能。", categories: "分类 · 尺寸管理", users: "账户概览", vip: "VIP", normal: "普通用户", none: "暂无已注册账户。" } : { eyebrow: "OWNER OPERATIONS", title: "OPERATIONS DASHBOARD", subtitle: "Manage products, accounts, and store operations. No image-generation service is used.", categories: "CATEGORIES & FIT FIELDS", users: "ACCOUNT OVERVIEW", vip: "VIP", normal: "NORMAL", none: "No registered accounts yet." };
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const people = trpc.operations.users.useQuery({ locale }, { retry: 2, refetchOnMount: "always", refetchOnWindowFocus: true });
  const managedCategories = trpc.admin.productCategories.useQuery();
  const vipAccounts = (people.data?.accounts ?? []).filter((account) => account.user.role === "vip");
  const listedPeople = [...(people.data?.accounts ?? []), ...(people.data?.visitors ?? [])];
  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-12 pt-3 sm:px-6"><header><p className="text-[10px] font-bold tracking-[.16em] text-[#766b60]">{copy.eyebrow}</p><h1 className="mt-1 font-serif text-3xl">{copy.title}</h1><p className="mt-2 max-w-2xl text-sm leading-5 text-[#71685f]">{copy.subtitle}</p></header><div className="mt-4 flex flex-wrap gap-2"><Link href="/sale-settings" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-xs font-bold text-white"><CircleDollarSign size={15} />{locale === "ko" ? "세일 설정" : locale === "zh" ? "促销设置" : "SALE SETTINGS"}</Link><button type="button" onClick={() => setCategoryPanelOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#171717] bg-white px-4 text-xs font-bold text-[#171717]"><Ruler size={15} />{copy.categories}</button></div><CategoryManagementPanel locale={locale} categories={(managedCategories.data ?? []) as any} open={categoryPanelOpen} onOpenChange={setCategoryPanelOpen} /><VipAccountManager accounts={vipAccounts} onChanged={() => void people.refetch()} includeRelatedManagers={false} /><section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4"><div className="flex items-center gap-2"><UsersRound size={16} /><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{copy.users}</p></div><div className="mt-3 space-y-2">{listedPeople.length ? listedPeople.map((person) => <div key={person.visitorId} className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f4ef] px-3 py-2"><div className="min-w-0"><p className="truncate text-xs font-semibold">{person.displayName || person.user?.name || person.user?.email || copy.normal}</p><p className="text-[10px] text-[#776e65]">{person.isVip ? copy.vip : copy.normal}</p></div></div>) : <p className="text-sm text-[#746a61]">{copy.none}</p>}</div></section></main></MobileScreen>;
}
