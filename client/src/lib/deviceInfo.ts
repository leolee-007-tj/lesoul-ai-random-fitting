import { usableViewport, type SafeAreaInsets } from "@shared/deviceViewport";

function cssPixel(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return Number.parseFloat(value) || 0;
}

export function getDeviceInfo() {
  const insets: SafeAreaInsets = { top: cssPixel("--safe-area-top"), right: cssPixel("--safe-area-right"), bottom: cssPixel("--safe-area-bottom"), left: cssPixel("--safe-area-left") };
  return usableViewport(window.innerWidth, window.visualViewport?.height ?? window.innerHeight, insets);
}
