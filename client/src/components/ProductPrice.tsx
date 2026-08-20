import { getSalePriceState, type LocalizedProduct } from "@shared/productCommerce";

type PriceProduct = LocalizedProduct & { price: number; availabilityStatus?: string | null; status?: string | null };

function cny(value: number) {
  return `¥${Math.max(0, Math.round(value)).toLocaleString("en-US")}`;
}

export default function ProductPrice({ product, className = "" }: { product: PriceProduct; className?: string; detail?: boolean }) {
  const calculated = getSalePriceState(product);
  const sale = product.availabilityStatus === "SOLD_OUT" || product.status === "sold_out" ? { ...calculated, enabled: false } : calculated;
  if (!sale.enabled) return <span className={`font-semibold text-[#25211d] ${className}`}>{cny(sale.original)}</span>;
  return <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}><span className="text-[#8b847a] line-through decoration-[#8b847a]">{cny(sale.original)}</span><span className="text-[#9a332c]">→</span><b className="font-bold text-[#8f2f28]">{cny(sale.sale)}</b><span className="rounded-full bg-[#f4e3df] px-2 py-0.5 text-[10px] font-bold tracking-[.08em] text-[#8f2f28]">SALE {sale.rate}%</span></span>;
}
