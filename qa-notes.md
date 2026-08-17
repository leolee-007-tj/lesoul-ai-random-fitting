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

## 2026-08-17 LESOUL AI LOOK v2 mobile review

At 390px, the global language control exposes EN, KO, and 中文 without wrapping after the mobile header was condensed. The brand lockup, language switcher, compact create button, and menu icon fit on one line. The home hero and studio upload surface remain readable and retain their editorial hierarchy; the studio progress row scrolls horizontally by design to preserve the full five-step sequence on narrow screens.

## 2026-08-17 mobile-first responsive release

At 390×844, Home keeps the brand, circular START CTA, feature summary, and bottom navigation inside the opening viewport. Studio preserves a square upload zone, visible photo guidance, and Back/Continue actions above the navigation. Measurements exposes required inputs before optional scrolling while its Skip and Continue controls remain persistent. The Product Manager add-product editor retains its product-view and studio-cut controls above the mobile navigation.

At 744×1133, the personal journey remains centered with expanded breathing room. Studio and Measurements preserve their mobile interaction order while using wider framed content; History remains intentionally narrow and readable; Product Manager exposes a 3-column product-view row and two independent detail slots without clipping above the centered action/navigation area.

At 375×667, the Home CTA stays centered and all four navigation destinations remain visible. The compact Studio upload preview yields space to the persistent action dock, and Measurements retains accessible defaults/continue actions. At 430×932, the additional vertical space expands naturally without changing the CTA, upload, or history visual hierarchy.

At 440×956, the same mobile hierarchy remains stable and the Product Manager editor exposes its studio-cut controls without action overlap. At 820×1180, 834×1194, and 1024×1366, Studio and Measurements stay intentionally centered while Product Manager expands its front/back/side and two-detail image controls into tablet-appropriate multi-column layouts. The desktop-style header replaces the mobile bottom navigation at these widths.

## Responsive release verification

The auto-published release at https://lesoulai-xabhv8qd.manus.space returned the LESOUL AI LOOK home document with the brand, language switcher, top navigation, Create Your AI Fashion Look headline, and primary flow copy. Direct browser navigation encountered a local TLS protocol error, so the public response was confirmed through a fresh text extraction instead. The live `/products?editor=new` response also contains the current Product Manager’s Product Views panel, Detail 1/Detail 2 controls, per-view studio-cut controls, and mobile Home/History/Create Look/Products navigation, confirming the published responsive build includes the newest feature set.
