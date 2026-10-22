import { BarChart3, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { localizedProductName } from "@shared/productCommerce";
import { customerProductImage } from "@shared/productImages";

export function ProductShareAnalyticsPanel() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("zh") ? "zh" : i18n.language.startsWith("ko") ? "ko" : "en";
  const analytics = trpc.operations.productShareAnalytics.useQuery();
  const copy = locale === "ko" ? { title: "WeChat 공유 유입", total: "총 WeChat 유입", empty: "아직 WeChat 공유 링크 유입이 없습니다.", visits: "방문" } : locale === "zh" ? { title: "微信分享访问", total: "微信总访问", empty: "暂时没有来自微信分享链接的访问。", visits: "次访问" } : { title: "WECHAT SHARE VISITS", total: "Total WeChat visits", empty: "No WeChat share-link visits yet.", visits: "visits" };
  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><BarChart3 size={16} /><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{copy.title}</p></div><p className="rounded-full bg-[#f0ece5] px-2.5 py-1 text-[10px] font-bold text-[#473f37]">{copy.total} · {analytics.data?.total ?? 0}</p></div>{analytics.isLoading ? <div className="mt-3 h-20 animate-pulse rounded-xl bg-[#f2eee8]" /> : analytics.data?.products.length ? <div className="mt-3 space-y-2">{analytics.data.products.map((item) => <div key={item.product.id} className="flex items-center gap-3 rounded-xl bg-[#f7f4ef] p-2"><img src={customerProductImage(item.product.imageViews?.front, item.product.imageUrl ?? undefined)} alt="" className="size-10 rounded-lg bg-[#e8e1d7] object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{localizedProductName(item.product, locale)}</p><p className="mt-0.5 text-[10px] text-[#776e65]">{item.visits} {copy.visits}</p></div><a href={`/catalog?product=${item.product.id}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-[#665d54]" aria-label={localizedProductName(item.product, locale)}><ExternalLink size={14} /></a></div>)}</div> : <p className="mt-4 text-sm text-[#746a61]">{copy.empty}</p>}</section>;
}
