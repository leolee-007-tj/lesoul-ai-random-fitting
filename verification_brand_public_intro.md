# Brand settings and public introduction verification

## Visual checks

- **Desktop, `/about`, 1280×900:** The public introduction renders a clear editorial hero, existing login/catalog CTAs, private-access explanation, live product cards, and the owner-safe monetization readiness section. The configured fallback store name is visible in the global header and hero card.
- **Mobile, `/about`, 390×844:** The hero, both CTAs, three-step journey, access explanation, live collection cards, and final CTA stack cleanly without clipped text or horizontal overflow.

## Functional checks

- The public route is outside customer gating and directs visitors into the existing sign-in flow before customer-only catalog or styling use.
- Store name is owner-managed in Release Control, stored in `releaseSettings.storeName`, exposed through a minimal public branding query, and reused by the shared header and introduction page.
- Pure-white image generation uses the faster medium-quality provider setting; a real single-front-image generation completed and returned a structured quality warning for manual review.
