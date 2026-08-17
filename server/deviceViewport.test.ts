import { describe, expect, it } from "vitest";
import { usableViewport } from "../shared/deviceViewport";

describe("Safe Area viewport helper", () => {
  it("computes iPhone notch and home-indicator space", () => {
    const info = usableViewport(390, 844, { top: 59, right: 0, bottom: 34, left: 0 });
    expect(info).toMatchObject({ isPhone: true, usableWidth: 390, usableHeight: 751, hasNotch: true, hasHomeIndicator: true });
  });

  it("classifies iPad and landscape side insets", () => {
    const info = usableViewport(1024, 768, { top: 24, right: 20, bottom: 20, left: 20 });
    expect(info).toMatchObject({ isDesktop: true, usableWidth: 984, usableHeight: 724, hasHomeIndicator: true });
  });

  it("accounts for Android gesture-bar height without a notch", () => {
    const info = usableViewport(412, 915, { top: 32, right: 0, bottom: 24, left: 0 });
    expect(info).toMatchObject({ isPhone: true, usableHeight: 859, hasNotch: true, hasHomeIndicator: true });
  });

  it("keeps iPad Split View widths in the phone-sized adaptive layout", () => {
    const info = usableViewport(600, 1024, { top: 24, right: 0, bottom: 20, left: 0 });
    expect(info).toMatchObject({ isPhone: true, usableWidth: 600, usableHeight: 980, hasHomeIndicator: true });
  });
});
