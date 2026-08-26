import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getOriginalPrice, toProductLocale, type LocalizedProduct } from "@shared/productCommerce";
import { formatCentralDiscount, resolveCentralPrice } from "@shared/pricingPolicy";
import { useTranslation } from "react-i18next";

type PriceProduct = LocalizedProduct & { price: number; normalDiscountPercent?: number | null; vipDiscountPercent?: number | null; isNew?: number | boolean | null; availabilityStatus?: string | null; status?: string | null };

function cny(value: number) {
  return `¥${Math.max(0, Math.round(value)).toLocaleString("en-US")}`;
}

export default function ProductPrice({ product, className = "" }: { product: PriceProduct; className?: string; detail?: boolean }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const config = trpc.purchase.config.useQuery();
  const pricing = resolveCentralPrice(getOriginalPrice(product), { mode: config.data?.pricingMode, tier: user?.role === "vip" ? "VIP" : "NORMAL", normalDiscountPercent: product.normalDiscountPercent, vipDiscountPercent: product.vipDiscountPercent, isNew: product.isNew, excludeNewArrivalsFromSale: config.data?.excludeNewArrivalsFromSale });
  const unavailable = product.availabilityStatus === "SOLD_OUT" || product.status === "sold_out";
  if (unavailable || pricing.discountPercent <= 0) return <span className={`font-semibold text-[#25211d] ${className}`}>{cny(pricing.original)}</span>;
  const saleLabel = formatCentralDiscount(pricing.discountPercent, toProductLocale(i18n.language));
  return <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}><span className="text-[#8b847a] line-through decoration-[#8b847a]">{cny(pricing.original)}</span><span className="text-[#9a332c]">→</span><b className="font-bold text-[#8f2f28]">{cny(pricing.unitPrice)}</b><span className="rounded-full bg-[#f4e3df] px-2 py-0.5 text-[10px] font-bold tracking-[.08em] text-[#8f2f28]">{saleLabel}</span></span>;
}
