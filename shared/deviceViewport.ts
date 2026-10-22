export type SafeAreaInsets = { top: number; right: number; bottom: number; left: number };

export function classifyViewport(width: number) {
  return { isPhone: width < 744, isTablet: width >= 744 && width < 1024, isDesktop: width >= 1024 };
}

export function usableViewport(width: number, height: number, insets: SafeAreaInsets) {
  return {
    ...classifyViewport(width),
    width,
    height,
    usableWidth: Math.max(0, width - insets.left - insets.right),
    usableHeight: Math.max(0, height - insets.top - insets.bottom),
    hasNotch: insets.top > 24,
    hasHomeIndicator: insets.bottom > 0,
    insets,
  };
}
