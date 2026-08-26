import { isNewArrival, normaliseAvailabilityStatus } from "@shared/productAvailability";
import { isNewArrivalExcludedFromSale, type PricingMode } from "@shared/pricingPolicy";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";

export function hasVisibleProductStatusBadge(showAvailability: boolean, isNew?: number | boolean | null) {
  return showAvailability || isNewArrival({ isNew });
}

export function shouldShowRegularPriceBadge(options: { mode?: PricingMode | null; isNew?: number | boolean | null; excludeNewArrivalsFromSale?: number | boolean | null }) {
  return isNewArrivalExcludedFromSale(options);
}

export function ProductStatusBadges({ availabilityStatus, legacyStatus, isNew, pricingMode, excludeNewArrivalsFromSale, className = "", showAvailability = true }: { availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "SOLD_OUT" | "PRE_ORDER" | null; legacyStatus?: string | null; isNew?: number | boolean | null; newArrivalAt?: Date | string | null; pricingMode?: PricingMode | null; excludeNewArrivalsFromSale?: number | boolean | null; className?: string; showAvailability?: boolean }) {
  const { t } = useTranslation();
  const pricingConfig = trpc.purchase.config.useQuery();
  const effectivePricingMode = pricingMode ?? pricingConfig.data?.pricingMode;
  const effectiveExcludeNewArrivals = excludeNewArrivalsFromSale ?? pricingConfig.data?.excludeNewArrivalsFromSale;
  const availability = normaliseAvailabilityStatus(availabilityStatus, legacyStatus);
  const copy = { inStock: t("product.status.inStock"), sold: t("product.status.soldOut"), preorder: t("product.status.preOrder"), fresh: t("product.newArrival"), regularPrice: t("product.regularPrice") };
  const showNew = isNewArrival({ isNew });
  const showRegularPrice = shouldShowRegularPriceBadge({ mode: effectivePricingMode, isNew, excludeNewArrivalsFromSale: effectiveExcludeNewArrivals });
  const statusLabel = availability === "SOLD_OUT" ? copy.sold : availability === "PRE_ORDER" ? copy.preorder : copy.inStock;
  if (!hasVisibleProductStatusBadge(showAvailability, isNew)) return null;
  return <div className={`pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap items-start justify-end gap-1 ${className}`}>{showAvailability && <span className={`mr-auto max-w-[58%] truncate whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold tracking-[.1em] shadow-sm ${availability === "SOLD_OUT" ? "bg-[#211b17] text-white" : availability === "PRE_ORDER" ? "border border-[#6d5c4c] bg-[#f6f0e7] text-[#4f4033]" : "bg-white/95 text-[#312820]"}`}>{statusLabel}</span>}{showNew && <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-extrabold tracking-[.08em] shadow-sm ${showRegularPrice ? "bg-[#1f1712] text-white ring-2 ring-[#d6a85f]" : "bg-white/95 text-[#312820]"}`}>{copy.fresh}</span>}{showRegularPrice && <span className="whitespace-nowrap rounded-full bg-[#b4532e] px-2 py-1 text-[9px] font-extrabold tracking-[.06em] text-white shadow-sm ring-1 ring-white/80">{copy.regularPrice}</span>}</div>;
}
