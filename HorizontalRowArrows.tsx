import { ArrowLeft, ArrowRight } from "lucide-react";
import type { RefObject } from "react";

export default function HorizontalRowArrows({
  rowRef,
  previousLabel,
  nextLabel,
}: {
  rowRef: RefObject<HTMLDivElement | null>;
  previousLabel: string;
  nextLabel: string;
}) {
  const move = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    const distance = Math.max(220, Math.round(row.clientWidth * 0.82));
    row.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => move(-1)}
        className="absolute left-2 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/30 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/50 active:scale-95 sm:left-3 sm:size-11"
        aria-label={previousLabel}
        title={previousLabel}
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        className="absolute right-2 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/30 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/50 active:scale-95 sm:right-3 sm:size-11"
        aria-label={nextLabel}
        title={nextLabel}
      >
        <ArrowRight size={20} strokeWidth={2.5} />
      </button>
    </>
  );
}
