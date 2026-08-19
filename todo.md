# Project TODO

- [x] Define Drizzle tables for products, poses, backgrounds, and generations with relationships and product-compatibility fields.
- [x] Add 18 in-stock and sold-out demo products, 8 exact Korean pose records, and 10 curated background records through an idempotent seed routine.
- [x] Implement a tested conditional outfit selector that enforces in-stock, 30/70 dress split, 30% outer skip, season, color, and style compatibility rules.
- [x] Implement public data procedures for poses/products and authenticated procedures for profile-scoped generations.
- [x] Implement secure photo upload and generated-image storage with persisted asset metadata.
- [x] Build premium quiet-luxury landing and global responsive navigation using the exact required hero headline.
- [x] Implement Manus OAuth-aware start experience and post-login upload routing.
- [x] Build camera/file photo upload with a full-body guide, preview, cropping controls, validation, and confirmation.
- [x] Build exact eight-card Korean pose selection with the required random-style trigger label.
- [x] Build the four-reel slot animation with the exact required labels and staged stopping behavior.
- [x] Integrate server-side editorial image generation with a graceful local editorial fallback when generation credentials are unavailable.
- [x] Build result detail view with a generated editorial image, selected product cards, purchase action, retry action, and save action using exact required labels.
- [x] Build an authenticated gallery grid and result-detail navigation for prior saved generations.
- [x] Build an owner-only admin product CRUD and generation-statistics dashboard.
- [x] Add PWA manifest and install metadata for a mobile-testable experience.
- [x] Add Vitest coverage for randomization rules, API contracts, and key result/generation behavior.
- [x] Verify desktop and mobile rendering, TypeScript checks, and test suite; mark completed items accurately.
- [x] Save a completion checkpoint and provide the project preview and publishing instructions.
- [x] Rebrand all public-facing screens as LESOUL AI LOOK with the exact English hero copy: Create Your AI Fashion Look.
- [x] Remove the required-auth dependency from the MVP journey and store personal-session state locally.
- [x] Expand product management and catalog data to TOP, BOTTOM, DRESS, OUTER, SHOES, and BAG with active/inactive status and English style presets.
- [x] Add a direct SELECT MY LOOK experience alongside the curated RANDOM LOOK workflow.
- [x] Add style and background selection steps with random and preset choices before generation.
- [x] Replace the slot-machine journey with a simpler Upload → Pose → Outfit → Background → Generate flow.
- [x] Implement provider-agnostic fashion generation contracts and a usable mock provider mode without client-side secret exposure.
- [x] Rework result and history to use English labels and local-first generated-look records without login.
- [x] Simplify the product manager to a personal MVP workspace without role-gated admin access.
- [x] Retest the revised mobile MVP, save a new checkpoint, and deliver the updated preview.
- [x] Add a public product-image upload endpoint that validates image type and size, then stores product media under a dedicated catalog path.
- [x] Add Product Manager file selection, upload progress, local preview, replacement, and image-URL fallback controls.
- [x] Persist the uploaded product image URL with new and edited product records, then verify responsive Product Manager behavior.
- [x] Add upload validation tests, save a checkpoint, and publish the revised product-image management experience.
- [x] Add English, Korean, and Chinese i18n infrastructure with a persistent header language switcher and locale-aware history migration.
- [x] Extend product records with fabric, texture, fit, length, width, details, neckline, sleeve, purchase platform, and ordered image-gallery metadata.
- [x] Backfill product seed records with material and construction details required for faithful AI clothing descriptions.
- [x] Extend Product Manager with garment-detail inputs, purchase fields, main/detail image ordering, individual image removal, and CSV preview/import validation.
- [x] Add strict clothing-preservation prompt rules and detailed garment prompt construction to the provider abstraction.
- [x] Add a multilingual result experience with adjustment controls, old/new comparison, regeneration state, and saved adjustment history.
- [x] Add Shop This Look purchase links, mobile Web Share, copy/share actions, download, result OG share-card generation, and share metadata.
- [x] Test all locales, product migrations, visual flows, production build, checkpoint, and updated deployment.
- [x] Save the verified LESOUL AI LOOK v2 checkpoint and publish the updated experience.
- [x] Add local-first body measurements with required height and shoulder fields, optional fit measurements, gender, validation, default values, and persistence.
- [x] Add a body-measurements flow between photo upload and pose selection, including a visual measurement guide and multilingual skip/continue states.
- [x] Validate upload aspect ratio as a likely full-body photo and provide localized, actionable retake guidance.
- [x] Extend the product image model with front, back, side, and detail view metadata plus original/studio-cut/thumbnail URLs under category-scoped storage paths.
- [x] Add deterministic white-background studio-cut preprocessing, front/back/side/detail upload slots, before/after previews, and per-slot studio-cut controls in Product Manager.
- [x] Include user measurements and ordered multi-view product references in the clothing-preservation generation prompt.
- [x] Add a tested measurement-based size recommendation engine and show recommended sizes on each resulting product card.
- [x] Add Noto Sans SC and Inter language font support, localized date/price conventions, and EN/KO/ZH coverage for the new personalisation interfaces.
- [x] Verify responsive personalisation flows, test all additions, save a checkpoint, and publish the updated build.
- [x] Add per-slot studio-cut enable, regenerate, and remove controls for front, back, side, and detail product images.
- [x] Localize measurement-based size recommendation reasons for English, Korean, and Chinese result screens.
- [x] Add independent studio-cut toggle, regenerate, and remove controls for Detail 1 and Detail 2 image slots.
- [x] Verify all front, back, side, Detail 1, and Detail 2 controls in responsive Product Manager QA.
- [x] Wire Detail 1 and Detail 2 studio-cut toggles into slot-specific upload and regeneration processing.
- [x] Target uploads to Detail 1 or Detail 2 rather than appending generic detail assets, then retest per-slot control behavior.
- [x] Run final responsive QA after detail-slot completion, save a new checkpoint, and publish the personalized build.
- [x] Save the verified personalization update checkpoint and publish the new production build.
- [x] Wire each Detail 1 and Detail 2 upload action to set its active slot index before selecting a file.
- [x] Re-verify indexed Detail 1·2 upload, regenerate, and remove controls after the explicit slot-target update.
- [x] Add automated coverage for Detail 1 and Detail 2 asset slot replacement behavior.
- [x] Capture post-update responsive QA evidence for Detail 1 and Detail 2 upload, regenerate, and remove controls.
- [x] Open the Product Manager editor and record explicit Detail 1·2 control QA evidence before final publishing.
- [x] Add the missing localized Product Manager price label and rerun locale checks.
- [x] Add safe-area-aware app shells, fixed mobile headers, and fixed bottom action bars that preserve the primary action above device insets.
- [x] Rework Home, Upload, Measurements, Pose, Outfit, Background, and Generate screens for a 390×844 iPhone-first visual hierarchy with scrollable content and persistent actions.
- [x] Add a mobile bottom navigation pattern for primary Home, History, Create, and Product Manager destinations without conflicting with task actions.
- [x] Optimize photo, pose, outfit, background, result, history, and product cards for 375–440px device widths and touch targets.
- [x] Add tablet breakpoints for centered 744–1024px layouts, constrained content widths, and two-/three-column cards where appropriate.
- [x] Test iPhone SE, iPhone 14, iPhone Pro Max, iPad Mini, iPad Air, and iPad Pro breakpoints; save a checkpoint and publish the responsive release.
- [x] Save a new checkpoint containing the verified iPhone and iPad responsive-layout changes.
- [x] Verify the auto-published responsive release at the live LESOUL AI LOOK domain.
- [x] Save the final responsive-layout checkpoint after all iPhone and iPad QA changes.
- [x] Confirm the new checkpoint is available and reflected by the live LESOUL AI LOOK domain.
- [x] Add an app-level SafeArea layout that uses dynamic viewport units and all four safe-area inset variables without double-padding fixed chrome.
- [x] Update viewport/PWA metadata for viewport-fit cover, interactive keyboard resize behavior, and iOS standalone mode.
- [x] Add keyboard-visible detection so form action docks avoid covering active inputs on mobile devices.
- [x] Apply Safe Area scroll, fixed action, bottom-navigation, and landscape constraints across Home, Studio, Measurements, History, Product Manager, and results.
- [x] Add a device helper and responsive tests covering notch/home indicator, Android gesture bars, iPad split-like widths, and landscape tablet layouts.
- [x] Confirm the device viewport helper files are present in the project and reapply them if needed.
- [x] Verify Safe Area viewport calculations for notch/home indicator, Android gesture bars, iPad split widths, and landscape tablets with automated tests.
- [x] Confirm Android gesture-bar and iPad Split View Safe Area test cases are present in the test file.
- [x] Execute the Safe Area test suite with the Android and Split View scenarios before final release.
- [x] Run the full type-check, test suite, and production build after the Safe Area helper verification.
- [x] Verify Safe Area behavior across the requested device dimensions, save a checkpoint, and publish the release.
- [x] Refine compact landscape action docks so fixed actions consume less vertical space while preserving reachable scroll content.
- [x] Confirm compact-landscape Safe Area CSS is present in the global stylesheet.
- [x] Run type-check, tests, and production build after the compact-landscape dock change.
- [x] Capture a short landscape mobile view to verify dock height and reachable scroll content.
- [x] Explicitly apply the common Safe Area page shell to Product Manager and verify its mobile spacing in code.
- [x] Capture and verify the result panel’s portrait and landscape Safe Area behavior, including its adjustment modal.
- [x] Provide a deterministic generated-result preview route for Safe Area QA without requiring a live image upload.
- [x] Capture portrait and landscape result screens plus open adjustment modal, then record visual Safe Area and keyboard-spacing evidence.
- [x] Add a deterministic keyboard-open Safe Area QA mode for the result adjustment modal.
- [x] Capture portrait and landscape keyboard-open adjustment modal views and document lower action spacing.
- [x] Reconfirm and record the keyboard-open result adjustment modal QA evidence for portrait and landscape layouts.
- [x] Rerun final checks after result-panel QA and save the Safe Area release checkpoint.
- [x] Save a checkpoint containing the verified Safe Area and result-preview changes.
- [x] Confirm the auto-published live build exposes the Safe Area result-preview route.
- [x] Diagnose why desktop, iPad, and mobile retain overly similar centered sizes despite responsive breakpoints.
- [x] Define visibly distinct mobile, tablet, and desktop layout tokens for frame width, typography scale, spacing, image height, and card columns.
- [x] Update Home, Studio, Measurements, History, Product Manager, and result preview to use the corrected breakpoint tokens.
- [x] Verify 390px mobile, 820px iPad, and 1440px web views visibly differ; test, checkpoint, and publish the fix.
- [x] Move the Studio fixed Back/Continue dock lower with sufficient scroll clearance so it never obscures Upload or Camera controls.
- [x] Replace the default mock-generation path with an internal real AI image-editing attempt that preserves user-photo and garment inputs, with an explicit sample fallback only on service failure.
- [x] Verify the upload controls and real-generation route, then run type checks, tests, build, checkpoint, and publish.
- [x] Display an explicit sample-result notice when the real AI compositor falls back to the uploaded image.
- [x] Exercise the public look-generation procedure with a controlled request and confirm a successful real response or visible fallback handling.
- [x] Exercise the public look.generate tRPC procedure with a controlled payload and confirm it returns the real AI compositor response.
- [x] Remove the remaining fixed Studio action dock and retain compact inline Back/Continue controls.
- [x] Verify the new upload-card action layout at mobile and tablet widths, then test, checkpoint, and publish.
- [x] Place measurement-page Back and Skip controls at the left and right without overlap, with Continue as a centered form CTA.
- [x] Center-align measurement-page heading, guidance, and input content while preserving accessible control labels.
- [x] Verify mobile and tablet measurement layouts, run checks, checkpoint, and publish.
- [x] Create a compact measurements layout that fits the primary controls and fields into one 390×844 mobile viewport without eliminating required inputs.
- [x] Add a modest top inset while reducing guide artwork, card padding, field heights, and vertical spacing.
- [x] Verify compact mobile measurements rendering, run checks, checkpoint, and publish.
- [x] Remove the Studio horizontal Upload/Pose/Outfit/Background progress row.
- [x] Move Studio content upward into the reclaimed top space without reducing upload-card reachability.
- [x] Verify mobile and tablet Studio layouts, run checks, checkpoint, and publish.
- [x] Reduce the upload-step dotted full-body guide and position it beside the Upload and Camera controls.
- [x] Raise and compact the upload action block while retaining the preview state and touch targets.
- [x] Verify the revised upload card at mobile and tablet widths, run checks, checkpoint, and publish.
- [x] Confirm the configured real image-editing model and the public look.generate composition route are ready for a user photo test.
- [x] Confirm the visible loading and fallback messaging guides the user through a real-composite test safely.
- [x] Add a clearly labeled AI test model with a consistent full-body image to the Studio upload step.
- [x] Present test pose titles and short descriptions so a reviewer can select a predictable composition.
- [x] Add a one-click test outfit selection from the existing catalog and guide the reviewer to the real-composite action.
- [x] Verify the complete demo path on mobile and tablet, then run checks, checkpoint, and publish.
- [x] Add a one-click Start Test Composite action that loads the test AI model, a titled pose, a ready-made test outfit, and a background before opening the REAL AI COMPOSITE screen.
- [x] Verify the Start Test Composite flow and generate-ready screen at mobile and tablet widths, then checkpoint and publish.
- [x] Research China-mainland-accessible image composition APIs and recommend a replacement priority for the LESOUL provider adapter.
- [x] Confirm Manus GPT Image 2 remains the default customer-facing composition provider and document the public capability in the Studio UI.
- [x] Improve customer-facing generation progress and result-status messaging without exposing provider credentials.
- [x] Verify the demo-to-generation path and saved result behavior, then test, checkpoint, and publish.
- [x] Add a visible retry action for a sample/fallback result that returns the customer to a ready-to-generate state.
- [x] Add concise blog-ready sharing copy that includes the look code, pose, style, and selected product names.
- [x] Add a customer-photo quality-check checklist and verify the public result/share flow before publishing.
- [x] Create clearly distinct in-app 2D illustrations for every named background scene in the catalog.
- [x] Create clearly distinct in-app 2D pose illustrations for every selectable pose, preserving a consistent editorial art direction.
- [x] Connect the 2D background and pose assets to the Studio cards and verify the visual distinction on mobile and tablet.
- [x] Run checks, checkpoint, and publish the 2D catalog update.
- [x] Replace unavailable generated placeholder assets with reliable in-app SVG 2D pose and background illustrations.
- [x] Extend the existing product metadata model for manual and future Vision-compatible recommendation attributes without replacing current product records.
- [x] Add configurable Style Presets and a persisted recommendation-feedback model while preserving existing catalog and try-on data.
- [x] Implement a deterministic compatibility scorer using active product IDs only for style, color, silhouette, season, material, and formality balance.
- [x] Add validated Top 3 AI Stylist recommendations with score breakdown, reason text, optional fixed product, and persisted GOOD MATCH / BAD MATCH feedback.
- [x] Add a Studio AI Stylist step that supports style selection, STYLE THIS ITEM, recommendation selection, and passes the selected existing products to the unchanged background and Virtual Try-On stages.
- [x] Add unit and integration tests for active-inventory validation, fixed-product retention, score ordering, feedback persistence, and try-on handoff.
- [x] Verify real catalog recommendations on mobile and tablet, then run checks, checkpoint, and publish.
- [x] Compile and deliver a current LESOUL AI LOOK implementation, deployment, verification, and roadmap summary.
- [x] Analyze the latest attached requirements and implement the maximum compatible scope without regressing current Try-On, AI Stylist, catalog, or responsive flows.
- [x] Add a quiet-luxury workflow-stage generation progress screen with localized EN/KO/ZH copy and an honest visual-progress cap before provider completion.
- [x] Persist request-deduplicated generation logs with input references, provider, duration, error, retry, result, and validation-ready status fields.
- [x] Add generation status and average-duration interfaces plus non-duplicating retry guards for the existing Virtual Try-On contract.
- [x] Add a future Vision validation interface for garment and identity preservation without generating fake quality scores.
- [x] Verify progress behavior, timeout messaging, logs, validation-ready state, existing Try-On/Stylist compatibility, tests, build, checkpoint, and publish.
- [x] Localize every Studio pose title and description through the selected EN/KO/ZH system language instead of showing seeded Korean text.
- [x] Simplify body measurements to a women-only fit profile and remove gender selection from the flow and saved data presentation.
- [x] Translate Product Manager and Studio Cut labels through EN/KO/ZH resources, standardize all prices to CNY, and remove side/detail/preview studio-cut controls while preserving the primary product image.
- [x] Verify localizations, women-only measurements, CNY formatting, and simplified Product Manager cuts on mobile and tablet; run checks, checkpoint, and publish.

- [x] Add EN/KO/ZH product name and description columns with legacy-field fallbacks.
- [x] Add source-language selection, one-click translation, and save-time completion for missing localized product fields.
- [x] Add discount-season quantity tiers for 1, 2, 3, and 4+ items with a CNY price preview.
- [x] Add optional Moment coupon code and additional discount calculation after quantity discount.
- [x] Display localized product content in Product Manager, AI Stylist, Studio selection, result cards, and saved look names.
- [x] Verify 28 Vitest tests, TypeScript check, production build, and responsive Product Manager route.
- [x] Save and publish the localized product commerce release checkpoint.

## Product commerce operating notes

- Enter the canonical product name and description in the selected source language (EN, KO, or ZH), then use Auto-translate to populate the other two fields. All fields remain editable before saving.
- Discount Season is configured per product. The four quantity thresholds are 1, 2, 3, and 4+ items; the default seed values are 20%, 25%, 30%, and 35% respectively.
- Moment Coupon is optional and applies an additional percentage after the quantity tier. The code is case-insensitive in the shared calculation helper; the manager normalizes entered codes to uppercase.
- The current release provides management-side calculation and price preview. A customer cart or checkout redemption flow can consume the same shared calculation helper later without changing the product schema.
- The screenshot route was checked at 390px; the Product Manager editor requires an authenticated admin session to load the full catalog data.

- [x] Diagnose why the pose-related entry button or pose-selection controls are no longer visible after the localized product commerce release.
- [x] Restore the existing pose-selection entry point and controls without changing the established pose data or localization flow.
- [x] Verify pose controls on 390px mobile and 820px tablet, run tests/build, save a checkpoint, and publish the fix.

- [x] Add explicit new-product image slots for 1 front, 1 back, and 4 important detail images while preserving legacy product image data.
- [x] Upload and persist all six product reference images with slot-specific validation and responsive Product Manager controls.
- [x] Pass front, back, and detail references into the AI composite adapter with clear garment-preservation instructions.
- [x] Verify multi-view upload, stored payloads, AI generation input, mobile/tablet UI, tests, build, checkpoint, and publish.

- [x] Add a product purchase QR image field and upload/replace control alongside the six garment reference images.
- [x] Show detailed outfit composition in My Looks, including each selected product's localized name, description, reference/detail images, and purchase action.
- [x] Show the product's uploaded purchase QR image when the user selects Buy, with a clear empty state when no QR is configured.
- [x] Require the existing Manus OAuth login before sharing or copying a look link; keep the existing private-browser My Looks storage for the current device.
- [x] Persist generated looks to the signed-in user's account for cross-device access.
- [x] Evaluate WeChat OAuth as an optional provider; preserve it as an unconfigured option until official AppID/AppSecret, redirect URI, and approved China-domain requirements are supplied.
- [x] Add tests, verify mobile/tablet sharing and QR flows, save a checkpoint, and publish.

- [x] Audit the attached AI Body Model, WeChat Moments Beta, and Redeem Code production specification against the existing LESOUL Core without rebuilding stable flows.
- [x] Add one centralized Release Mode configuration for PRIVATE, BETA_PUBLIC, and REDEEM_CODE with entitlement policies kept outside the Core styling and generation pipeline.
- [x] Add a reusable AI Body Model path with minimal height and weight input, optional body measurements and body-shape presentation, transparent consent copy, and cached base-model reuse after creation.
- [x] Add product featured visibility and priority controls so the visible beta catalog feeds both the customer catalog and AI Stylist recommendation eligibility.
- [x] Add configurable per-visitor, global daily, monthly generation protection and a generation kill switch that does not block browsing.
- [x] Add beta entry, consent, anonymous visitor identity, redeem-code access, manual Moments save/copy UX, and WeChat in-app-browser-safe web behavior; keep WeChat OAuth credentials as an external prerequisite.
- [x] Verify the Release Mode matrix, body-model prompt safety, catalog visibility, generation limits, consent UI, and mobile / administrator views; document deployment and operational controls.

## Release Mode operating notes

- `/release-control` is administrator-only. Use it to switch among PRIVATE, BETA_PUBLIC, and REDEEM_CODE; enable or disable generation; control the beta catalog count; and issue hashed redeem codes.
- Redeem code plaintext is shown only when issued. The database stores a SHA-256 hash, plus expiry, use count, allowance, and catalog tier.
- `BETA_PUBLIC` serves an in-stock, category-balanced featured selection. `REDEEM_CODE` requires a redeemed entitlement before generation and deducts only successful external AI generations.
- AI Body Model uses minimum height and weight with optional bust, waist, hip, and body-shape inputs. It produces a non-identifying base model, preserves explicit consent time, and reuses a ready model with the same profile hash.
- WeChat website OAuth remains unconfigured by design. Official AppID/AppSecret, approved website domain, and OAuth redirect URI are required before it can be enabled. The current Moments flow is accurate about its capability: save image and copy Chinese sharing text; it does not claim direct publishing.

## Deferred specification note

- [x] Complete the interrupted signed-in My Looks cross-device synchronization before beginning the Persistent AI Female Model + Fit Engine specification attached on 2026-08-18.
- [x] Keep the Persistent AI Female Model + Fit Engine specification deferred until the existing account-sync and Release Mode stability work is published.

## Persistent AI Female Model + Fit Engine

- [x] Audit the persisted AI Body Model, product schema, studio handoff, and virtual try-on prompt against the new Persistent AI Female Model specification without rebuilding existing Core flows.
- [x] Extend the body profile with hair length, hair style, hair color, and neutral skin-tone choice plus immutable model ID and model version fields.
- [x] Generate an adult female full-body base model from body and appearance profiles, show an honest workflow-based progress state, then require Preview confirmation or Adjust Model before Studio use.
- [x] Persist an approved model reference and pass it to every subsequent virtual try-on so body, hair, skin tone, and facial identity are retained while pose, scene, and garments change.
- [x] Add nullable actual garment measurements to Product Manager by category and implement a configurable Size-Aware Fit Engine with RELAXED, REGULAR, FITTED, TIGHT, VERY_TIGHT, and UNLIKELY_TO_FIT results.
- [x] Display fit status and concise body-versus-garment reasoning in look selection and results without altering the user body to make garments appear to fit.
- [x] Verify model reuse, identity-reference payloads, appearance choices, fit statuses, mobile/tablet/Desktop UI, tests, migrations, checkpoint, and publish.

## AI Body Model localization

- [x] Inventory every customer-facing AI Body Model creation, progress, preview, adjust, consent, and approval string currently rendered in English.
- [x] Add complete EN/KO/ZH locale keys and replace hardcoded AI Body Model UI text with selected-language translations.
- [x] Verify English, Korean, and Chinese AI Body Model screens on mobile, run checks, save a checkpoint, and publish.

## AI Body Model silhouette refinement

- [x] Set the AI Body Model weight input to a minimum of 40kg and keep client and server validation consistent.
- [x] Define clear, respectful East Asian adult-female fashion-model silhouette guidance for slim, straight, curvy, petite, tall, plus, and custom profiles.
- [x] Apply the selected silhouette and East Asian baseline consistently to initial model generation without changing body size to force garment fit.
- [x] Add regression coverage for the 40kg floor and distinct shape prompts; verify mobile UI, checks, checkpoint, and publish.

## AI Body Model realism guidance

- [x] Add a concise EN/KO/ZH AI Body Model creation note explaining that a user-provided full-body photo can produce a more familiar visual likeness while photo-free model creation remains available.
- [x] Verify the realism note on mobile, run checks, save a checkpoint, and publish.

## AI Body Model starting weight

- [x] Change the initial AI Body Model weight value and its empty-input fallback from 55kg to 40kg.
- [x] Verify the 40kg default on mobile, run checks, save a checkpoint, and publish.

## Fixed AI model selection

- [x] Retire the customer-facing personal AI Body Model creation, preview approval, and personal photo guidance flow from the Studio journey.
- [x] Provide exactly three persistent East Asian adult female fashion models: the existing balanced test model, a fuller-volume model, and a petite short-leg-proportion model.
- [x] Add a simple EN/KO/ZH model-picker that explains each fixed model and saves the user’s current choice without asking for body measurements or photo upload.
- [x] Pass the selected fixed model reference to the unchanged Virtual Try-On pipeline and preserve its selected silhouette across pose, scene, and garment changes.
- [x] Verify fixed-model selection and generation handoff on mobile/tablet, run tests/build, save a checkpoint, and publish.

## Product QR purchase card and personal WeChat sharing

- [x] Audit the existing purchase QR upload, result cards, saved-look product snapshots, and current product query APIs against the product-specific Purchase Card specification.
- [x] Treat the administrator-uploaded purchase QR image as the product payment QR and preserve its product ID, price, image, active status, and sold-out state when it is replaced.
- [x] Re-fetch and validate the latest product record on every BUY action; show a purchase screen only for active, in-stock products with a payment QR.
- [x] Add per-product BUY actions to Editorial Products and show an explicit consultation state rather than an empty QR when no payment QR is configured.
- [x] Build a mobile-first, screenshot-ready Purchase Screen and Purchase Card containing LESOUL, product image, localized name, CNY price, original-size payment QR, and Chinese payment instruction.
- [x] Add Save Purchase Card, Save QR, and Copy Message helpers for manual WeChat personal-chat sharing; do not add Moments automation or a fake direct WeChat share button.
- [x] Verify QR replacement, stale product states, no-QR consultation, 390px purchase card UI, mobile download behavior, tests, checkpoint, and publish.

## Screenshot-first purchase card refinement

- [x] Remove all customer-facing external purchase URL opening, including legacy demo `example.com` links.
- [x] Add administrator-editable EN/KO/ZH purchase notice fields with a clear default caution that payment is final and return or exchange is unavailable unless otherwise confirmed.
- [x] Present a dedicated, current-language Purchase Card with only the product photo, localized name, CNY price, original payment QR, editable notice, and no redirect action.
- [x] Add Screenshot / Save Card, Back, and Home actions to the purchase card; preserve manual customer payment after saving and do not automate payment or WeChat/Moments posting.
- [x] Verify external-link removal, editable notices, language switching, screenshot card layout, mobile Back/Home navigation, tests, checkpoint, and publish.

## Result page product-first redesign, alternative looks, and access policy

- [x] Audit the existing result panel, Studio recommendation handoff, saved look data, Release Mode policy, and entitlements against the product-first result page specification.
- [x] Reorder and simplify the result page to show only the generated LESOUL LOOK, one Editorial Preview, one horizontal actual-worn-product purchase section, minimal save actions, and one alternative-looks section.
- [x] Remove duplicate product, technical provider, generation-status, internal validation, prompt, debug, and repeated AI Match presentation from the customer result experience.
- [x] Persist the initially recommended Top 3 look candidates and selected look context so the two unselected alternatives can be rendered on the result page.
- [x] Let a customer choose an alternative LOOK and regenerate with the same selected fixed model, pose, background, and measurements while changing only the actual product IDs.
- [x] Replace Beta Public daily allowance behavior with a total 3-generation visitor allowance while retaining administrator-configurable global daily and monthly protection.
- [x] Add an administrator-issued VIP unlimited entitlement that bypasses the visitor allowance but remains subject to the global generation safety limits.
- [x] Add complete EN/KO/ZH copy for the shopping CTA, product cards, save actions, alternative looks, allowance messages, and VIP states.
- [x] Verify actual-worn product IDs only, horizontal product cards, alternative-look handoff, 3-use/VIP policy, purchase QR flow, mobile/tablet layouts, tests, checkpoint, and publish.

## Image-generation recovery and pose localization

- [x] Diagnose the real server/provider reason for the customer-facing “Image generation is temporarily unavailable” state and restore the primary generation path or provide an actionable retry fallback.
- [x] Audit all pose names, titles, descriptions, selected-pose summaries, result/saved-look labels, and generation prompts for EN/KO/ZH language consistency.
- [x] Replace any remaining seeded or hardcoded pose text with current-language EN/KO/ZH values while preserving stable internal pose IDs and generation keywords.
- [x] Verify a generation request, pose screens and result labels in three languages, tests, checkpoint, and publish.

## QUICK FIT generation mode

- [x] Audit the existing Home entry, Studio, AI Stylist, fashion provider, result screen, purchase card, generation logging, and entitlement flow against the QUICK FIT specification.
- [x] Add a first-class QUICK_FIT generation mode that uses only active existing LESOUL product IDs and product reference images, never customer photos, fixed AI models, people, faces, hands, or bodies.
- [x] Add a simple Home choice between AI FITTING and QUICK FIT with complete EN/KO/ZH copy while preserving the existing AI FITTING entry unchanged.
- [x] Reuse the current Style Presets and AI Stylist Top 3 logic for QUICK FIT, with TOP + BOTTOM or DRESS foundations plus optional OUTER, BAG, and SHOES.
- [x] Add four QUICK FIT display styles: Studio Flat Lay, Editorial Flat Lay, Hanger Display, and Ghost Fit; use Studio Flat Lay by default with product-preservation instructions.
- [x] Generate product-only editorial images with strict preservation of garment color, pattern, fabric appearance, construction, proportions, and major details; forbid newly designed garments and human elements.
- [x] Reuse existing selectedProductIds, result product cards, QR Purchase Card, alternative LOOK cards, access limits, generation logging, and VIP entitlements without creating a parallel catalog or pricing system.
- [x] Support Private/Admin unrestricted testing through existing Release Mode policy while retaining the existing Beta 3-use and VIP unlimited policy for QUICK FIT.
- [x] Verify EN/KO/ZH Home entry, product-only prompt, display styles, alternative look regeneration, QR purchase flow, 390px/820px UI, tests, checkpoint, and publish.

## Complete customer UI localization audit

- [x] Inventory every customer-facing hardcoded string, icon label, accessibility label, status, error, empty state, toast, and browser-language check across Home, Header, Studio, Quick Fit, Stylist, Results, Purchase, History, and fixed-model selection.
- [x] Replace customer-facing hardcoded EN/KO/ZH content with current system-language EN/KO/ZH resources or centralized translation helpers while preserving stable internal IDs and AI prompt keywords.
- [x] Translate all visible icon labels, image alt text, loading and fallback states, navigation labels, purchase actions, save/copy/download actions, and no-data messages for EN/KO/ZH.
- [x] Add regression coverage for locale completeness and eliminate customer UI dependence on `navigator.language`.
- [x] Verify the full customer journey in EN, KO, and ZH at mobile/tablet widths, run checks, save a checkpoint, and publish.

## Product Manager category, sizing, price, and save repair

- [x] Diagnose the current new-product save failure through Product Manager validation, tRPC input, database constraints, and server logs.
- [x] Move the garment category selector to the top of the new-product form and make it the first required merchandising decision.
- [x] Provide category-aware size entry and real garment measurements for TOP, BOTTOM, DRESS, OUTER, SHOES, and BAG without forcing irrelevant fields.
- [x] Allow unrestricted non-negative CNY price entry and editing without hidden default or upper-limit constraints.
- [x] Repair new-product save, preserve the selected category/size/measurements/price, and show localized actionable validation errors.
- [x] Verify a new product can be saved for every garment category with a custom price and relevant sizes on mobile/tablet; run tests, checkpoint, and publish.

## Header navigation clarity

- [x] Audit the current header plus icon, hamburger icon, and existing navigation destinations across mobile and desktop.
- [x] Replace the ambiguous plus action with a clearly labelled New LOOK action that routes to the model picker.
- [x] Add an accessible hamburger menu with named EN/KO/ZH destinations for Home, AI Fitting, Quick Fit, My Looks, Products, and relevant owner tools.
- [x] Verify menu open/close, navigation, accessible labels, mobile/tablet layout, tests, checkpoint, and publish.

## Single hamburger menu correction

- [x] Remove the separate header New LOOK button and place New LOOK as the first named action inside the hamburger menu.
- [x] Keep the header to the language selector and one clearly labelled hamburger menu, with AI Fitting, Quick Fit, My Looks, Products, and owner tools all inside that menu.
- [x] Verify the single-menu behavior, EN/KO/ZH labels, mobile/tablet layout, tests, checkpoint, and publish.

## Product save permission 10002 recovery

- [x] Trace the 10002 response through current session identity, owner configuration, user role, and product-management tRPC middleware.
- [x] Restore product CRUD access for a signed-in workspace user without making catalog mutation public.
- [x] Keep the existing localized owner-login or access-denied state and copyable original error code for unauthenticated sessions.
- [x] Verify signed-in product create/update access and unauthorized rejection behavior through the protected product route, tests, checkpoint, and publish.

## Product price input cleanup

- [x] Remove the automatic visible 0 from the new-product price input while retaining a required non-negative CNY price validation on save.
- [x] Verify blank price entry, custom price entry, mobile form rendering, tests, checkpoint, and publish.

## Product localized-name display recovery

- [x] Trace product registration from source-language input through EN/KO/ZH fields, automatic translation, product API output, and locale display helpers.
- [x] Ensure a Chinese, Korean, or English source name and description completes all three localized fields before product save, with an explicit save error if translation cannot complete.
- [x] Use the current system language for product cards, AI Stylist, Quick Fit, result cards, Purchase Card, and My Looks while retaining a safe source-language fallback.
- [x] Add regression coverage for Chinese registration followed by Korean and English display, run checks, checkpoint, and publish.

## Product save validation clarity

- [x] Audit the new-product required fields and determine which are genuinely required for save versus optional merchandising metadata.
- [x] Replace the combined required-field sentence with field-level EN/KO/ZH validation messages and visible input error states.
- [x] Avoid blocking save for optional season, color, style, or description metadata when the required product identity, category, price, and image fields are complete.
- [x] Verify save validation on mobile, tests, checkpoint, and publish.

## Admin login and redeem reliability

- [x] Audit current session identity, administrator menu gating, Release Control permissions, redeem code issuance, redemption, entitlement persistence, and allowance application.
- [x] Ensure the configured workspace owner can access administrator Release Control and issue standard or VIP-unlimited redeem codes while signed in.
- [x] Ensure a signed-in user can redeem a valid code exactly once per code rules and immediately see the granted allowance or VIP status in the UI.
- [x] Keep invalid, expired, exhausted, and unauthorized cases safely rejected with localized messages and a copyable original error code.
- [x] Add regression coverage for login-bound admin issuance and standard/VIP redemption; verify end-to-end flows, checkpoint, and publish.

## Product input recognition recovery

- [x] Trace why a visibly filled product name or price can still trigger a required-field error on save.
- [x] Normalize text and numeric input at change and save time, clear field errors immediately after valid entry, and avoid stale draft closure validation.
- [x] Verify filled and one-character EN/KO/ZH product names plus a CNY price proceed past client and server validation; run checks, checkpoint, and publish.

## Garment, pose, and background preservation recovery

- [x] Inspect recent generation logs and the current Studio-to-provider payload to identify why selected denim, pose, or background can be lost.
- [x] Send ordered product references with stronger category-specific preservation instructions, prioritizing selected bottoms such as denim, and include selected pose and background as non-negotiable scene constraints.
- [x] Reject misleading fallback treatment when provider output is unavailable or unverified, clearly label the result as a sample and return the user to a retry-ready state.
- [x] Add regression coverage for denim/product references, selected pose, selected background, and fallback messaging; verify the provider path, checkpoint, and publish.

## Administrator product editing and deletion
- [x] Audit the existing Product Manager edit, deletion, authorization, and product-reference cleanup paths.
- [x] Ensure a signed-in administrator can edit any registered product and safely delete one product from its detail or list action.
- [x] Add multi-select product deletion with a localized count-aware confirmation and safe selection reset.
- [x] Add an administrator-only delete-all-products action with a destructive confirmation phrase and localized outcome states.
- [x] Add regression coverage for authorization, individual deletion, selected deletion, delete-all confirmation, and empty-catalog handling; verify responsive UI, checkpoint, and publish.

## QUICK FIT generation failure recovery
- [x] Inspect the latest QUICK FIT request logs, provider response details, product-reference payload, and client error state to identify the actual failure reason.
- [x] Fix the specific failure path without presenting an unverified product reference as a generated QUICK FIT editorial.
- [x] Add localized cause-aware error and retry handling for QUICK FIT, including a copyable original error for support.
- [x] Add regression coverage, verify a real request path and responsive error state, then checkpoint and publish.

## AI FITTING preservation-verification recovery
- [x] Inspect the latest AI FITTING provider failures, request payloads, image references, and preservation-verification error mapping.
- [x] Fix the failing AI FITTING reference or provider path while retaining selected garment, fixed model, pose, and background locks.
- [x] Improve the localized failure guidance and retry path without displaying any unverified composition as a completed LOOK.
- [x] Add regression coverage, verify a real AI FITTING request, then checkpoint and publish.

## Studio generation-status undefined query recovery
- [x] Trace the look.status router, generation-log lookup, and Studio polling lifecycle for missing-record and completed-request states.
- [x] Ensure look.status always returns a typed status object and make Studio polling tolerant of unavailable or terminal states.
- [x] Add regression coverage for unknown, preparing, completed, and failed generation IDs; verify the Studio route does not emit undefined-query errors.
- [x] Run checks, checkpoint, and publish the status-query recovery.

## Customer UX cleanup and product-first redesign
- [x] Save a rollback-safe baseline checkpoint and audit Home, Studio, fixed model, Stylist, Quick Fit, Result, Purchase, header, and bottom navigation against the attached public UX requirements.
- [x] Keep Home's two primary entries while reducing or weakening secondary feature boxes so AI Fitting and Quick Fit remain the clear calls to action.
- [x] Make Create My AI Model the preferred AI Fitting choice, retain HANA/MIRA/SEO as Quick Model choices, remove repeated model descriptions, and hide test shortcuts outside PRIVATE/admin contexts.
- [x] Default pose to Natural Standing and background to Minimal Studio, expose only four core poses initially, and make full pose/background choice an optional customization path.
- [x] Simplify customer AI Stylist cards to product-led Top 3 LOOK choices, hide detailed AI Match calculations, and lock generated explanations to the active EN/KO/ZH locale.
- [x] Keep AI Fitting and Quick Fit results product-first: generated LOOK, immediate editorial/selected-product horizontal cards, existing QR BUY flow, one save action, and only the two unselected Stylist alternatives.
- [x] Hide provider, prompt, IDs, internal validation, sample/testing, and development controls from public and beta customer screens while preserving private/admin access and existing usage/redeem behavior.
- [x] Verify language consistency, successful/failing generation allowance behavior, fixed identity retention, QR purchase cards, alternative LOOK reuse, and 390px mobile CTA/navigation behavior; run tests, checkpoint, publish, and report the required before/after UX changes.

## Product manager access and centered home title
- [x] Audit signed-in administrator menu gating and the current Home title layout at mobile and wide desktop widths.
- [x] Restore a clearly named administrator-only Product Manager / Add Product entry without exposing catalog management to public customers.
- [x] Center the LESOUL start-screen title and two primary CTA cards while preserving mobile spacing and quiet-luxury hierarchy.
- [x] Verify administrator access, customer menu privacy, responsive Home layout, tests, checkpoint, and publish.

## Login, logout, and administrator entry recovery
- [x] Audit the existing OAuth start-login and logout helpers and the header's current authenticated/anonymous menu state.
- [x] Add localized Login, signed-in account status, and Logout actions to the header menu without exposing administrator tools to anonymous or standard users.
- [x] Show a clear administrator-only Product Manager / Add Product entry after owner/admin login and retain the Product Manager route protections.
- [x] Verify anonymous, signed-in user, and administrator menu states alongside the centered Home layout; test, checkpoint, and publish.

## Home title position and product brand/free-size support
- [x] Audit the Home hero vertical spacing and the existing product schema, product manager draft, save route, and size option sources.
- [x] Move the Home title/CTA composition upward while preserving the visible header, safe areas, and mobile bottom navigation clearance.
- [x] Add an optional product brand field through schema, migration, product CRUD, and localized Product Manager inputs/display data.
- [x] Add F (Free Size) as a selectable size option wherever category-relevant product sizes are configured.
- [x] Add regression coverage, verify responsive Home and product save behavior, checkpoint, and publish.

## Product detail before QR purchase
- [x] Audit result-product cards, editorial purchase cards, catalog lookup, and the existing QR purchase route to identify all customer card entry points.
- [x] Add a localized product detail screen with gallery, brand, localized name/description, category, size options, measurements, CNY price, and stock status.
- [x] Make customer product cards open the detail screen first and provide a clear Buy / QR purchase action that preserves the current purchase-card safeguards.
- [x] Add regression coverage and verify mobile product detail, back navigation, and QR purchase behavior; checkpoint and publish.

## QUICK FIT look selection recovery
- [x] Trace the QUICK FIT ‘select this look’ click handler, recommendation state, generation mutation, and visible error/loading transitions.
- [x] Repair the selected-look handoff so a valid recommendation always starts the corresponding product-only editorial generation or exposes a localized actionable error.
- [x] Add regression coverage and verify the mobile selection button moves into a clear generating/result state; checkpoint and publish.

## QUICK FIT selected-look visual state
- [x] Audit how the selected LOOK ID travels from a Stylist recommendation card into the QUICK FIT generation screen.
- [x] Add localized selected and generating states to the recommendation card, including a high-contrast selected border and visible check badge.
- [x] Verify keyboard, touch, mobile layout, and generation state preservation; add regression coverage, checkpoint, and publish.

## QUICK FIT explicit three-step order
- [x] Confirm the selected LOOK state, display-style controls, and generation mutation ordering after the automatic-selection change.
- [x] Preserve the selected-card border and badge while removing automatic generation from LOOK selection.
- [x] Make the expression-style step visibly required before the explicit generate action, then add regression coverage, checkpoint, and publish.

## Measurement-informed AI fitting proportions
- [x] Audit stored product garment measurements, body measurement inputs, fixed-model proportions, request mapping, and current garment-preservation prompt sections.
- [x] Add defensive measurement normalization and a proportion-aware prompt block that uses available garment and body dimensions as visual fit guidance, never as an exact measurement guarantee.
- [x] Preserve existing garment, pose, background, and fixed-identity locks while testing the new measurement guidance for tops, bottoms, dresses, outerwear, and missing-measurement cases.
- [x] Verify generation request payloads, regression tests, and responsive customer copy; checkpoint and publish.
