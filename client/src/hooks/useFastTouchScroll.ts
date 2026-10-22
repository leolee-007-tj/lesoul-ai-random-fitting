import { useEffect } from "react";

const BOOST = 0.2;
const MAX_EXTRA_SCROLL = 22;
let subscribers = 0;
let removeListeners: (() => void) | null = null;

function isScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
  return canScrollY && element.scrollHeight > element.clientHeight + 2;
}

function getScrollTarget(start: EventTarget | null) {
  const element = start instanceof HTMLElement ? start : null;
  if (!element) return null;
  const nested = element.closest<HTMLElement>("[data-fast-scroll], .lesoul-safe-modal, [data-sidebar=content]");
  return nested && isScrollable(nested) ? nested : null;
}

function installListeners() {
  if (removeListeners || !window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  let startX = 0;
  let startY = 0;
  let previousY = 0;
  let active = false;
  let target: HTMLElement | null = null;

  const onStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const origin = event.target instanceof HTMLElement ? event.target : null;
    if (origin?.closest("button, a, input, textarea, select, [role=button], [data-no-scroll-boost]")) {
      active = false;
      target = null;
      return;
    }
    startX = touch.clientX;
    startY = touch.clientY;
    previousY = touch.clientY;
    target = getScrollTarget(event.target);
    active = false;
  };

  const onMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if (!active) {
      if (Math.abs(deltaY) < 4 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.15) return;
      active = true;
    }
    const step = previousY - touch.clientY;
    previousY = touch.clientY;
    if (!step) return;
    const extra = Math.max(-MAX_EXTRA_SCROLL, Math.min(MAX_EXTRA_SCROLL, step * BOOST));
    if (target) target.scrollTop += extra;
    else window.scrollBy(0, extra);
  };

  const reset = () => {
    active = false;
    target = null;
  };

  document.addEventListener("touchstart", onStart, { passive: true, capture: true });
  document.addEventListener("touchmove", onMove, { passive: true, capture: true });
  document.addEventListener("touchend", reset, { passive: true, capture: true });
  document.addEventListener("touchcancel", reset, { passive: true, capture: true });
  removeListeners = () => {
    document.removeEventListener("touchstart", onStart, true);
    document.removeEventListener("touchmove", onMove, true);
    document.removeEventListener("touchend", reset, true);
    document.removeEventListener("touchcancel", reset, true);
    removeListeners = null;
  };
}

/** Adds a small, native-feeling vertical boost on coarse touch devices. */
export function useFastTouchScroll() {
  useEffect(() => {
    subscribers += 1;
    installListeners();
    return () => {
      subscribers = Math.max(0, subscribers - 1);
      if (subscribers === 0) removeListeners?.();
    };
  }, []);
}
