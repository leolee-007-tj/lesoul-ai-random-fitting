import { isNewArrival, normaliseAvailabilityStatus } from "@shared/productAvailability";
import { useTranslation } from "react-i18next";

export function ProductStatusBadges({ availabilityStatus, legacyStatus, isNew, newArrivalAt, className = "" }: { availabilityStatus?: "AVAILABLE" | "SOLD_OUT" | "PREORDER" | null; legacyStatus?: string | null; isNew?: number | boolean | null; newArrivalAt?: Date | string | null; className?: string }) {
  const { i18n } = useTranslation(); const language = i18n.language;
  const availability = normaliseAvailabilityStatus(availabilityStatus, legacyStatus);
  const copy = language.startsWith("ko") ? { sold: "SOLD OUT", preorder: "예약", fresh: "NEW" } : language.startsWith("zh") ? { sold: "售罄", preorder: "预约", fresh: "NEW" } : { sold: "SOLD OUT", preorder: "PREORDER", fresh: "NEW" };
  const showNew = isNewArrival({ isNew, newArrivalAt });
  if (availability === "AVAILABLE" && !showNew) return null;
  return <div className={`pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-1 ${className}`}>{showNew && availability !== "SOLD_OUT" && <span className="rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#312820] shadow-sm">{copy.fresh}</span>}<span className={`ml-auto rounded-full px-2 py-1 text-[9px] font-bold tracking-[.1em] shadow-sm ${availability === "SOLD_OUT" ? "bg-[#211b17] text-white" : availability === "PREORDER" ? "border border-[#6d5c4c] bg-[#f6f0e7] text-[#4f4033]" : "hidden"}`}>{availability === "SOLD_OUT" ? copy.sold : copy.preorder}</span></div>;
}
