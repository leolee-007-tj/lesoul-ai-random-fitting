# LESOUL AI LOOK — Customer UX Cleanup Report

**Version:** `18649292`  
**Scope:** Customer-facing UX cleanup and product-first flow refinement  
**Release status:** Checkpoint saved and automatically published

## 1. Executive summary

The customer journey has been simplified from a feature- and process-led experience to a **fashion → styling → try-on → products → purchase** experience. Existing product, generation, entitlement, QR purchase, recommendation, and fixed-model systems were retained. The work focused on eliminating repeated UI, removing public-facing technical and test information, reducing mandatory decisions, enforcing output-language consistency, and putting the selected LESOUL products immediately after every generated result.

| Area | Before | After |
|---|---|---|
| Home | Two primary entries plus competing feature boxes | Two clear primary entries: **AI FITTING** and **QUICK FIT** |
| Model entry | Fixed-model flow was the main visible route | **Create My AI Model** is primary; HANA/MIRA/SEO are a separate quick path |
| Pose and background | Exposed as sequential workflow stages | Natural Standing and Minimal Studio are automatic defaults; change controls are optional |
| Stylist | Score and calculation-led presentation | Product-led Top 3 LOOK cards with one localized reason and one selection action |
| Result | More than one save/presentation treatment could compete | Generated LOOK → Editorial/Products → QR BUY → one Save LOOK action → two alternatives |
| Public UI | Test, provider, and progress-detail copy could appear | Customer UI excludes provider, prompt, debug, sample, test, and exact-percent language |

## 2. Customer flow before and after

### Previous emphasis

The prior journey exposed more intermediate choice and internal recommendation detail. A customer could encounter model/test terminology, pose and background steps, score information, and more than one result action before reaching the actual LESOUL products.

### Current customer flow

```text
HOME
  ├─ AI FITTING
  │    ├─ CREATE MY AI MODEL
  │    └─ USE QUICK MODEL (HANA / MIRA / SEO)
  │          ↓
  │       STYLE → AI STYLIST LOOK → GENERATE → RESULT
  │
  └─ QUICK FIT
       STYLE → AI STYLIST LOOK → GENERATE → RESULT

Optional at review: Change Pose / Change Background
```

Natural Standing and Minimal Studio are supplied automatically, so the shortest AI Fitting flow reaches generation without explicitly visiting the pose or background selector.

## 3. Duplicate UI removed or reduced

The following presentation elements were removed, reduced, or moved below the primary customer action.

| Item | Customer-facing treatment |
|---|---|
| Home feature-icon trio | Removed; replaced with one quiet supporting promise line |
| Repeated model summary | Removed; quick models now use compact image/name/check cards |
| Pose catalogue | Four core poses are shown first only when customization is requested; additional poses are behind **More poses** |
| Background catalogue | No longer required for generation; available through **Change Background** |
| AI Match score and score breakdown | Hidden from customer Stylist cards; scoring remains in the recommendation engine/admin data |
| Multiple save actions | Result now presents one **Save LOOK** image-save action |
| Product layouts | Result and Quick Fit use one horizontal, swipeable product-card treatment |
| Result technical copy | Provider, validation, prompt, and progress-detail presentation removed from customer result flow |

## 4. Test and development information hidden from customers

The public Studio path no longer contains the previous unreachable-but-retained test-model/photo-upload/test-composite block. Customer pages do not show provider branding, prompts, generation IDs, validation state, sample triggers, debug actions, score breakdowns, or artificial percentage values.

Administrator management destinations remain gated by the signed-in `admin` role in the hamburger menu. The bottom navigation is customer-focused: Home, My Looks, Create, and Quick Fit.

## 5. Pose and background treatment

| Decision | Implementation |
|---|---|
| Default pose | `Natural Standing` is selected when catalog data becomes available; the first catalog pose is a fallback only if that record is unavailable |
| Default background | `미니멀 스튜디오` / Minimal Studio is selected automatically; the first background is a safe fallback |
| Optional pose change | Review screen exposes **Change Pose**; the selector shows four core poses before the full list |
| Optional background change | Review screen exposes **Change Background**; the full existing background dataset remains unchanged |
| Generation preservation | Existing pose/background locks and generation prompts remain in place |

## 6. AI Stylist customer UI and Locale Lock

The AI Stylist continues to use the existing active-inventory recommendation engine and Top 3 validation. It now accepts an explicit `locale` input (`en`, `ko`, or `zh`) on `stylist.recommend`. Customer-visible recommendation reasons are generated from locale-specific templates without product-name interpolation, preventing mixed Korean, Chinese, and English prose.

Product names still use the existing localized product-field helper and safe source-language fallback. This preserves real product identity when a product is intentionally named in its source language while keeping generated explanation copy in the selected UI language.

The customer card contains only the LOOK identifier, selected product previews, one localized explanation, and **Choose This Look**. Detailed score calculations and feedback controls are no longer shown to customers.

## 7. Result-page order and purchase UX

### AI Fitting result

```text
YOUR LESOUL LOOK
Large generated image
EDITORIAL PREVIEW
SHOP THIS LOOK
Selected product horizontal cards
BUY → current product lookup → QR Purchase Card
SAVE LOOK
TRY ANOTHER LOOK → two unselected Stylist recommendations
```

Only product IDs from the selected generation are rendered as customer purchase cards. Each card retains localized product name, short description, size recommendation where present, CNY price, and the existing QR BUY behavior. BUY continues to query the latest product state before opening the screenshot-first Purchase Card; no new checkout system was introduced.

### Quick Fit result

Quick Fit retains its product-only generation contract and uses the same product-first order: editorial image, horizontal Editorial Products, QR BUY actions, and the two remaining Stylist alternatives. No person, model, or body is introduced by the customer UI.

## 8. Identity, usage, and failure protection retained

| Policy | Retained behavior |
|---|---|
| Persistent personal model | Approved `bodyModelId`, model image, and profile measurements are passed into AI Fitting generation when a personal model is selected |
| Quick models | HANA/MIRA/SEO continue to pass their selected fixed-model reference and measurements |
| Alternative LOOK | Retains the selected model, pose, background, and measurements; changes only the recommended product IDs |
| Beta allowance | BETA_PUBLIC allowance remains **three successful Fashion LOOK generations in total**, not three per day |
| Failed generation | Provider errors and unverified output are not presented as a successful LOOK and do not consume the successful-generation allowance |
| VIP | Existing account-bound VIP redeem entitlement remains unlimited while global safety limits continue to apply |
| Body-model creation | Kept separate from Fashion LOOK allowance accounting |

## 9. Mobile and WeChat-oriented verification

The following customer screens were visually checked at **390 × 844**: Home, model entry, AI Fitting/Stylist, and Quick Fit. The two primary CTAs remain prominent, customer bottom navigation does not cover the flow CTA, and product-result components use horizontal overflow to support touch swiping. Existing safe-area, mobile purchase-card, responsive viewport, QR purchase, and access-policy tests remain in the suite.

## 10. Regression results

| Check | Result |
|---|---|
| TypeScript | Passed |
| Vitest | **56 tests passed** across 20 test files |
| Production build | Passed |
| Customer UX contract tests | Passed for Home focus, model priority, optional pose/background, public cleanup, product-first result UI, and admin-menu gating |
| Stylist locale tests | Passed for EN, KO, and ZH explanation output |

## 11. Changed files and API surface

### Customer UI

| File | Change |
|---|---|
| `client/src/pages/Home.tsx` | Kept the two CTA hierarchy; removed competing feature-box navigation emphasis |
| `client/src/pages/BodyModel.tsx` | Restored primary personal-model creation flow and separated quick-model selection |
| `client/src/pages/Studio.tsx` | Added personal model handoff, automatic pose/background defaults, optional change paths, and removed public test controls |
| `client/src/components/StylistPanel.tsx` | Product-led Top 3 cards, locale-aware style labels, no customer score breakdown |
| `client/src/components/LookResultPanel.tsx` | One Save LOOK action and product-first horizontal result cards |
| `client/src/components/EditorialPurchaseBar.tsx` | Horizontal Quick Fit product cards with existing QR BUY flow |
| `client/src/components/AppHeader.tsx` | Management destinations restricted to administrators |
| `client/src/components/MobileBottomNav.tsx` | Customer-facing Quick Fit destination replaces Product Manager shortcut |
| `client/src/components/GenerationProgress.tsx` | Removed provider composite branding and numeric progress percentage |

### Server and contracts

| File | Change |
|---|---|
| `server/routers/stylist.ts` | Added backward-compatible `locale` input with default `en` |
| `server/stylistEngine.ts` | Locale-locked customer explanation templates; scoring output retained internally |
| `server/stylistEngine.test.ts` | Added EN/KO/ZH explanation locale regression tests |
| `server/lesoul.contract.test.ts` | Added customer UX cleanup regression contracts |

No product database table, payment system, redeem system, recommendation architecture, or AI generation provider was replaced.

## 12. Operational next steps

1. Replace any remaining seed-product imagery with final LESOUL front/back/detail product images, then review the Top 3 Stylist presentation using live catalog content.
2. Have a customer account complete the three-look BETA journey and one QR purchase-card save in a real WeChat in-app browser.
3. If public traffic rises, add a private administrator-only generation-failure summary so operations can distinguish timeout, invalid-reference, and unverified-output events without exposing them to customers.
