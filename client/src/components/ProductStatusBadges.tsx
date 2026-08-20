import { isNewArrival, normaliseAvailabilityStatus } from "@shared/productAvailability";
import { useTranslation } from "react-i18next";

export function hasVisibleProductStatusBadge(showAvailability: boolean, isNew?: number | boolean | null) {
  return showAvailability || isNewArrival({ isNew });
}

export function ProductStatusBadges({ availabilityStatus, legacyStatus, isNew, className = "", showAvailability = true }: { availabilityStatus?: "AVAILABLE" | "PREORDER" | "IN_STOCK" | "SOLD_OUT" | "PRE_ORDER" | null; legacyStatus?: string | null; isNew?: number | boolean | null; newArrivalAt?: Date | string | null; className?: string; showAvailability?: boolean }) {
  const { t } = useTranslation();
  const availability = normaliseAvailabilityStatus(availabilityStatus, legacyStatus);
  const copy = { inStock: t("product.status.inStock"), sold: t("product.status.soldOut"), preorder: t("product.status.preOrder"), fresh: t("product.newArrival") };
  const showNew = isNewArrival({ isNew });
  const statusLabel = availability === "SOLD_OUT" ? copy.sold : availability === "PRE_ORDER" ? copy.preorder : copy.inStock;
  if (!hasVisibleProductStatusBadge(showAvailability, isNew)) return null;
  return <div className={`pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-1 ${className}`}>{showAvailability && <span className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-[.1em] shadow-sm ${availability === "SOLD_OUT" ? "bg-[#211b17] text-white" : availability === "PRE_ORDER" ? "border border-[#6d5c4c] bg-[#f6f0e7] text-[#4f4033]" : "bg-white/95 text-[#312820]"}`}>{statusLabel}</span>}{showNew && <span className="ml-auto rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#312820] shadow-sm">{copy.fresh}</span>}</div>;
}
