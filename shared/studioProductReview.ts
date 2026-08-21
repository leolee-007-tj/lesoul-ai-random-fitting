import type { StudioProductView } from "./studioProductImage";

export const studioReviewCheckKeys = ["framing", "material", "details"] as const;
export type StudioReviewCheckKey = (typeof studioReviewCheckKeys)[number];
export type StudioReviewChecks = Record<StudioProductView, Record<StudioReviewCheckKey, boolean>>;

export function createStudioReviewChecks(): StudioReviewChecks {
  return {
    front: { framing: false, material: false, details: false },
    back: { framing: false, material: false, details: false },
  };
}

export function resetStudioReviewViews(current: StudioReviewChecks, views: readonly StudioProductView[]): StudioReviewChecks {
  const next = { ...current, front: { ...current.front }, back: { ...current.back } };
  for (const view of views) next[view] = { framing: false, material: false, details: false };
  return next;
}

export function canApproveStudioReview(checks: StudioReviewChecks, hasFrontCandidate: boolean, hasBackCandidate: boolean): boolean {
  return hasFrontCandidate && hasBackCandidate && (["front", "back"] as const).every((view) => studioReviewCheckKeys.every((key) => checks[view][key]));
}
