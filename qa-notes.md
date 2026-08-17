# QA Notes

## 2026-08-17 visual verification

Desktop and mobile captures confirmed that the landing page displays the exact required hero headline, maintains legible warm-neutral contrast, and keeps the primary call to action within the opening viewport. The mobile upload screen also rendered its full-body guide, file-upload action, camera action, preview area, and enabled/disabled primary progression state without visible clipping.

The screenshot session reached the authenticated upload state, so account-aware routing is active. Full camera capture, an end-to-end uploaded-image generation call, and administrator-only operations remain account- and device-dependent flows that should be exercised by the project owner in the preview after publication.

The verified visual system uses a recurring "CURATED BY CHANCE" editorial stamp, numbered chapters, restrained fashion-magazine typography, and warm ivory/taupe/charcoal materials across the public and onboarding surfaces.

## 2026-08-17 mobile refinement

After inspecting the authenticated mobile routes for upload, gallery, and administration, the header action was narrowed to a non-wrapping "새 룩" label below the small breakpoint. A follow-up 390px capture confirmed the corrected one-line header and retained visible progress indicators and full-body photo guide.

## 2026-08-17 revised LESOUL AI LOOK MVP

Mobile captures confirmed the new English LESOUL AI LOOK homepage and no-auth private look-session entry render correctly at 390px. The revised flow begins directly with full-body upload and visibly provides camera and file-upload actions. The final review removed residual MVP terminology from user-facing upload copy while preserving the explicit private-browser-session data handling message.

## 2026-08-17 product image management

Mobile and desktop Product Manager captures confirmed the responsive catalog-management shell and prominent Add Product action. The catalog request completes successfully with no network error; it takes approximately 2.5 seconds because the server initializes and reads the full catalog, so the temporary loading indicator in the automated capture is expected rather than a failed request.
