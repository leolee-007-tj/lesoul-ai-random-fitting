import { useEffect, useRef, useState } from "react";

function distance(first: Touch, second: Touch) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

/** Lets a tab strip compact or expand with a two-finger pinch without hijacking page zoom elsewhere. */
export function usePinchCompactTabs() {
  const ref = useRef<HTMLElement | null>(null);
  const [compact, setCompact] = useState(false);
  const startDistance = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) startDistance.current = distance(event.touches[0], event.touches[1]);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || startDistance.current === null) return;
      const currentDistance = distance(event.touches[0], event.touches[1]);
      const ratio = currentDistance / startDistance.current;
      if (ratio < 0.88) setCompact(true);
      else if (ratio > 1.12) setCompact(false);
    };
    const onTouchEnd = () => {
      if (startDistance.current !== null) startDistance.current = null;
    };

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return { ref, compact };
}
