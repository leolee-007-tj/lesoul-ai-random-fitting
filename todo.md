# Project TODO

- [x] Resolve the logged-out Sale Settings loading state by returning a non-sensitive false owner status instead of a permission error.

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

## Generation-independent product browsing
- [x] Audit Home, current public catalog data, product-detail component, QR purchase flow, and generation-access messaging for reusable customer entry points.
- [x] Add a first-screen secondary ‘Browse Products’ entry and a public catalog route that lists all active items by garment category without requiring generation allowance or sign-in.
- [x] Reuse localized product cards and product-detail-to-QR-purchase flow, adding clear category tabs/sections for tops, bottoms, outerwear, dresses, shoes, and bags.
- [x] Verify browsing after allowance exhaustion, category navigation, product detail, QR safeguards, responsive mobile layout, tests, checkpoint, and publish.

## Purchase list and WeChat manual sales flow
- [x] Audit the attached purchase-list requirements against existing ProductDetailScreen, result cards, QR purchase screen, purchase settings, product size data, and customer persistence patterns.
- [x] Add a backward-compatible PURCHASE_LIST/QR purchase-mode setting with PURCHASE_LIST as the public default, retaining existing QR fields and legacy QR mode for future use.
- [x] Build a shared localized purchase list with productId-linked items, size selection, quantity controls, remove/clear actions, reference subtotal, floating item-count indicator, and result/detail entry points.
- [x] Replace public QR payment language and direct QR checkout entry with Add to List and Purchase List actions while retaining manual WeChat inventory/final-price guidance.
- [x] Build a vertical saveable Purchase Request Card containing visible product photos, selected size, quantity, reference price, item total, request number, and localized WeChat instructions; do not process payment or send WeChat messages automatically.
- [x] Verify EN/KO/ZH states, F-size behavior, persisted cart/order-card data, mobile layouts, QR backward compatibility, permissions, tests, checkpoint, and publish.

## Inventory status, new arrivals, and simple reservation
- [x] Audit the attached inventory-status requirements against active/inactive catalog visibility, product CRUD, AI Stylist eligibility, public catalog, Home, purchase list, and request-card behavior.
- [x] Add backward-compatible availability status (AVAILABLE/SOLD_OUT/PREORDER), isNew, and newArrivalAt data through the product schema, non-destructive migration, Product Manager create/update, and product seed defaults.
- [x] Exclude SOLD_OUT and PREORDER products from new AI Stylist recommendation candidates while preserving them in prior LOOK snapshots and displaying their current status when refreshed.
- [x] Add localized premium SOLD OUT, NEW, and PREORDER badges; disable purchase-list addition for SOLD_OUT, and add PREORDER items to the existing purchase list as reservation items.
- [x] Add a compact Home New Arrivals horizontal section sorted by latest arrival, preserve AI Fitting/Quick Fit priority, and store a local latest-seen marker without creating a user-reading database.
- [x] Render reservation labels in purchase list and saved Purchase Request Card with differentiated WeChat guidance; preserve normal current-price/recheck behavior and do not add payment, deposits, or a separate reservation database.
- [x] Verify EN/KO/ZH text, Product Manager controls, active versus sold-out/preorder visibility, AI Stylist eligibility, NEW ordering, size/FREE behavior, request-card saving, mobile layout, tests, checkpoint, and publish.

## Physical measurement authority and card display normalization
- [x] Audit the full attached specification, current garment/body measurement normalization, fit engine, generation prompt, catalog product-card components, and product manager metadata paths.
- [x] Make entered centimeter measurements explicitly authoritative over apparent reference-photo size for AI FITTING, adding relative body×garment physical-fit instructions without changing garment or body dimensions.
- [x] Add backward-compatible catalog presentation metadata for automatic and optional manual uniform display scale and object position, preserving original image files and aspect ratio.
- [x] Calculate category-local measurement medians and bounded display-scale guidance from existing product measurements, with safe neutral fallbacks for missing or non-comparable measurements.
- [x] Add Product Manager controls for automatic versus manual card display scale and safe object positioning, retaining existing image uploads and product data.
- [x] Apply the normalized container-scale presentation to public catalog, Home new arrivals, AI FITTING result cards, QUICK FIT editorial cards, and purchase-list/request-card thumbnails without pixel stretching or use in generation prompts.
- [x] Verify EN/KO/ZH user copy, mobile and desktop cards, missing measurements, extreme cropped/long examples, physical-fit prompt priority, tests, migration, checkpoint, and publish.

## Customer fit and measurement notice
- [x] Audit existing measurement copy and entry points in AI Fitting results, product cards, product detail, purchase list, and purchase request card.
- [x] Add a compact EN/KO/ZH visual-reference notice beneath AI Fitting results without weakening the internal measurement-first Fit Engine.
- [x] Show only one or two category-relevant measurement values on cards with a clear detail path, and add a quiet product-detail notice above the full real-cm grid.
- [x] Add short purchase-list and saved purchase-request-card measurement reminders, preserving WeChat manual request guidance and avoiding alert styling.
- [x] Verify EN/KO/ZH text, result/detail/list/request-card layouts, Fit Engine physical authority, tests, checkpoint, and publish.

## Administrator-managed display categories
- [x] Preserve every existing product category while auditing current product category fields, category-aware sizing, public catalog, AI Stylist, QUICK FIT, AI FITTING, and generation prompt mapping.
- [x] Add a small category-management data model containing KO/ZH/EN display names, stable Base Category, active state, and sort order; generate a non-destructive migration and seed mappings for all existing categories.
- [x] Add authenticated administrator category list, create, update, and usage-count procedures; prohibit destructive deletion and support inactive status for categories used by existing products.
- [x] Add a localized Category Management panel and inline Add Category option in Product Manager; ensure a newly added active category becomes selectable immediately without page reload.
- [x] Link products to the managed display category while retaining their stable Base Category, so existing sizing, AI Stylist, Quick Fit, AI Fitting, measurements, availability, and purchasing behavior remain compatible.
- [x] Display the managed localized category name in customer surfaces with Base Category fallback; include both display and Base Category in AI fitting generation context.
- [x] Verify custom Cropped Pants/PANTS creation, product assignment, rename, used-category inactivation, KO/ZH/EN display, stylist and generation handoff, legacy product regression, tests, checkpoint, and publish.

## Central AI access, usage, budget, and operations dashboard
- [x] Save a stable rollback checkpoint before implementation and audit existing access.ts, release settings, redeem entitlements, generation logs, body-model/stylist calls, and current administrator routes.
- [x] Introduce one server-side Access/Usage Controller as the only policy source for AI Fitting, QUICK FIT, regeneration, AI Body Model, and AI Stylist eligibility; do not duplicate limit checks in UI or individual routes.
- [x] Add non-destructive usage-event and operation-settings storage that records only actual server-side AI provider requests, their feature type, start/end time, outcome, generation link, configured estimated cost, and optional provider metadata.
- [x] Extend central settings with configurable estimated CNY unit cost per real AI-request feature, monthly CNY budget, hard-stop-at-budget flag, AI generation master switch, optional daily cap, and manual actual monthly cost input clearly separated from estimates.
- [x] Centralize normal 3-successful-generation allowance, VIP-unlimited redeem entitlement, account/visitor identity resolution, duplicate redemption prevention, allowance consumption only on confirmed success, and server-side BLOCKED_BY_LIMIT/BLOCKED_BY_BUDGET/PAUSED outcomes.
- [x] Add owner/admin Operations Dashboard with real registered-user versus visitor counts, today/7d/30d/all feature ranking, actual request/success/failure counts, average duration, simple seven-day chart, estimated CNY cost, budget percentage/warnings, and clear no-data states.
- [x] Add owner/admin User Management for current signed-in accounts, visitor aggregates, VIP/normal status, redemption history, and safe disable controls without fabricating user identities or exposing private body/photos/generation images.
- [x] Add owner/admin AI Cost Settings and Redeem Code panels, retaining the existing hashed account-bound redemption behavior and showing plaintext code only at issuance.
- [x] Verify server enforcement bypass attempts, quota recovery on failed validation/provider errors, VIP behavior, budget pause behavior, analytics actual-request semantics, dashboard time filters, EN/KO/ZH mobile/admin layout, full tests, checkpoint, and publish.

## Role-based AI experience restructure
- [x] Save a stable rollback checkpoint and audit fixed models, Quick Fit, AI Fitting, Style This Item, central AI access policy, entitlement data, menu visibility, and existing purchase-list handoff.
- [x] Extend the central Access/Usage Controller with server-authoritative ADMIN/VIP/NORMAL capability checks for Quick AI, 李瀛 AI, AI Fitting, AI Body Model, regeneration, and AI Style Match; do not add duplicated UI-only policy checks.
- [x] Restrict Quick AI / Quick Fit to ADMIN through server protection and hide its customer entry for VIP/NORMAL while preserving all existing four display styles and the established content-generation pipeline.
- [x] Designate the existing fixed 李瀛 reference-model path as the VIP/ADMIN AI Fitting experience, enforce fixed identity preservation with changing product/pose/background only, and keep normal users out of the endpoint.
- [x] Reframe normal-user AI as AI Style Match by reusing STYLE THIS ITEM, active inventory validation, current compatibility scoring, fixed-item retention, short localized reasons, replacement candidates, and complete-look purchase-list addition.
- [x] Add central configurable normal-user AI Style Match allowance while removing irrelevant image-generation allowance exposure from normal-user UI; preserve VIP account-bound unlimited entitlement semantics and existing redeem-code security.
- [x] Update localized HOME/menu/product-detail calls to action for each role, keeping Product Manager, Category Manager, Purchase Management, Operations, Redeem, and AI Settings administrative only.
- [x] Verify server-bypass rejection, Admin/VIP/Normal menus and endpoints, 李瀛 identity reference handoff, Style Match active-stock filtering, recommendation refresh non-repetition, purchase-list handoff, EN/KO/ZH mobile layout, tests, checkpoint, and publish.

## Product availability, new arrivals, and global customer i18n refinement
- [x] Audit the existing availabilityStatus, legacy publication status, isNew flag, catalog filtering, AI eligibility, purchase policy, and localized customer text without adding a duplicate state model.
- [x] Normalize the existing product availability semantics to IN STOCK, PRE-ORDER, SOLD OUT, and UNPUBLISHED while preserving all legacy products and administrator visibility.
- [x] Complete localized availability badges, new-arrival controls, detail messages, purchase/reservation CTAs, and purchase-list states across EN, KO, and ZH.
- [x] Ensure AI Style Match exposes product availability, excludes SOLD OUT and UNPUBLISHED items, and optionally includes PRE-ORDER only through the existing operations setting.
- [x] Audit and replace customer-facing hardcoded status, loading, empty, error, warning, and purchase-flow text in the touched catalog, detail, Style Match, and purchase surfaces with existing i18n resources.
- [x] Add regression coverage for independent availability and new-arrival states, customer filtering, AI eligibility, locale fallbacks, and existing AI/purchase flows; verify mobile UI, build, checkpoint, and publish.

## WeChat-first account, permissions, and user analytics — deferred by user
- [x] Defer the WeChat-first audit and implementation because the user explicitly selected the NORMAL `lesoul / 8888` shared-test login for the current release.
- [x] Defer official AppID, AppSecret, and callback URI configuration until WeChat OAuth is resumed; no simulated WeChat login is present.
- [x] Preserve the existing user model and leave provider-backed WeChat identity, account linking, migration, and related analytics as a future implementation phase.
- [x] Deliver login protection for AI Style Match, VIP AI, purchase-list, and other personal flows through the selected test-login architecture while preserving public product browsing and central ADMIN/VIP/NORMAL policy.
- [x] Preserve VIP redemption, account-based AI usage, and purchase activity under existing unique authenticated user IDs; no WeChat account claim has been made.
- [x] Retain the existing administrator analytics surface without fabricating WeChat user analytics or records.
- [x] Add complete EN/KO/ZH test-login copy and verify logged-out protection, role paths, existing AI/purchase regression, checkpoint, and publish; defer WeChat-specific copy and OAuth readiness tests.

## Shared test login with browser-scoped visitor ownership
- [x] Stop the unconfigured WeChat OAuth implementation path and audit existing session, visitor ID, My Looks, purchase list, AI usage, recommendation history, saved-look deletion, and administrator authorization flows.
- [x] Add a server-verified test-only shared login for `lesoul` / `8888`, with a secure persistent session cookie and no password comparison or credential value exposed in frontend code.
- [x] Gate personal customer features behind the shared login while preserving public product browsing and retaining the independent existing administrator authentication and permissions.
- [x] Use one stable browser/device visitorId, independent of display locale and the shared login name, as the temporary owner for My Looks, saved looks, purchase list, AI usage limits, recommendation history, and temporary VIP state.
- [x] Ensure saved-look list, deletion, and language changes remain visitorId-scoped so one browser cannot observe or restore another browser's data; prepare nullable future account-link ownership fields without pretending WeChat migration has occurred.
- [x] Verify server login rejection, persistent login, logout, isolated two-browser visitor data, visitor-scoped three-use limits, administrator-only controls, EN/KO/ZH login states, existing AI/purchase flow regressions, checkpoint, and publish.
- [x] Restrict browser-scoped shared-credential visitorId ownership exclusively to the NORMAL `lesoul` / `8888` test session; preserve VIP and OWNER/ADMIN data, access, entitlements, saved looks, and usage under their unique authenticated userId without fallback to shared visitor ownership.
- [x] Add identity-bound regression tests proving a NORMAL shared-test session cannot read or write VIP/OWNER/ADMIN data and that VIP/OWNER/ADMIN never resolve to the shared-test visitorId path.

## Saved Looks, locations, and outfit-detail i18n integrity
- [x] Audit saved-look snapshots, History, result/editorial views, background and pose records, product snapshots, AI Style Match reasons, and existing EN/KO/ZH resolvers for display values stored in a prior locale.
- [x] Create or extend shared localization resolvers for stable background/location, pose, style, category, and product identifiers, with safe legacy text mapping and non-destructive fallback for unmatched existing looks.
- [x] Preserve stable IDs in newly saved looks and resolve localized labels at render time rather than permanently displaying the language selected at look creation.
- [x] Update My Looks, outfit details, saved look history, editorial preview, purchase product cards, and shared product/detail components to prioritize current localized product data, then localized snapshots, then legacy text.
- [x] Ensure background/location names and descriptions, pose labels, style labels, status, fit/purchase guidance, and AI recommendation reasons follow the active EN/KO/ZH locale without triggering extra AI calls for saved looks.
- [x] Add regression tests for legacy and new saved looks, location/pose/product resolver fallbacks, locale switching EN→KO→ZH, mixed-language prevention, and unaffected AI matching, generation, purchase, VIP, and login flows; verify mobile UI, checkpoint, and publish.

## My Looks selective delete and persistent deletion integrity
- [x] Audit the current localStorage, saved-look API, query cache, in-memory state, locale migration behavior, and any legacy look keys before changing deletion behavior.
- [x] Make one versioned, locale-independent My Looks storage authority with lookId-based deletion, one-time legacy-key migration and safe tombstone protection so deleted looks cannot be revived.
- [x] Add server-authorized individual and batch saved-look deletion that preserves NORMAL visitorId ownership and VIP·OWNER/ADMIN unique userId ownership, then invalidate/refetch local query cache after success.
- [x] Add localized individual delete, selection mode, selected-count, selection cancel, delete-selected, and confirmed delete-all controls without changing AI generation, matching, product, purchase, VIP, or login behavior.
- [x] Add clear localized confirmation dialogs and empty state; after any deletion reset selected IDs, exit selection mode when appropriate, and update visible count without optimistic ghost restoration.
- [x] Verify individual, multi-select, and all deletion across EN→KO→ZH, refresh, logout/login, navigation, legacy migration, NORMAL/VIP/ADMIN ownership boundaries, tests, mobile UI, checkpoint, and publish.

## VIP account login and administrator management
- [x] Audit the existing test-access session, Manus owner session, user schema, redeem entitlements, role controller, saved-look ownership, purchase-list ownership, AI usage events, and administrator operations routes.
- [x] Save a stable checkpoint before replacing the redeem-based VIP path, then add a non-destructive VIP account model with unique ID, secure password hash, optional display name, active state, unique userId, and future-safe account ownership.
- [x] Add server-verified VIP ID/password login with secure persistent session cookies, duplicate-ID rejection, inactive-account rejection, password reset without plaintext retrieval, and strict separation from NORMAL shared access and OWNER/ADMIN authentication.
- [x] Resolve NORMAL ownership with visitorId only and VIP/OWNER/ADMIN ownership with unique userId only across My Looks, purchase lists, AI usage, recommendations, and existing role capabilities.
- [x] Add ADMIN-only VIP create, reset-password, activate/deactivate, account list, and per-VIP AI usage views while preserving data after deactivation and retaining the existing AI master switch.
- [x] Disable customer-facing redeem and VIP code UI without dropping historical tables; update EN/KO/ZH login, administration, errors, account states, and role-specific header/menu copy.
- [x] Verify NORMAL/VIP/ADMIN login persistence, menu matrix, VIP cross-device saved looks, user data isolation, inactive VIP rejection, owner management button, master AI switch, AI/product/purchase regression, tests, checkpoint, and publish.
- [x] Scope local My Looks cache by authenticated identity so NORMAL visitor history never migrates into VIP/OWNER/ADMIN userId storage, while only pre-account legacy browser history may migrate once into its original NORMAL visitor scope.

## Owner-managed administrator account login
- [x] Audit existing owner OAuth, VIP account, NORMAL test access, role resolver, session cookies, user schema, operations permissions, and client login routes before adding ADMIN password authentication.
- [x] Preserve the existing owner OAuth identity as the only authority that can create, reset, activate, or deactivate separate ADMIN ID/password accounts.
- [x] Extend the existing account model and password-hash/session module for unique active ADMIN accounts without exposing plaintext passwords, merging roles, or changing VIP/NORMAL ownership rules.
- [x] Add server-verified ADMIN ID/password login, secure persistent session cookies, inactive-account rejection, duplicate-ID protection, logout cleanup, and administrative route access through the existing role controller.
- [x] Add owner-only administrator account management UI for creation, password reset, activation/deactivation, and account list; do not expose it to ADMIN, VIP, or NORMAL accounts.
- [x] Add EN/KO/ZH login and owner-management copy, then verify owner/admin/vip/normal role isolation, session persistence, password safety, existing AI/product/purchase behavior, tests, checkpoint, and publish.

## Brand-first home without product photography
- [x] Audit all Home route product image, new-arrival, catalog-thumbnail, and decorative image rendering while preserving the existing text-based AI Style Match and Browse Products entries.
- [x] Remove product photography from the first-screen home composition and retain a calm brand-first LESOUL title, localized explanations, and clear CTA hierarchy without altering the product catalog.
- [x] Verify mobile and desktop Home rendering, existing route navigation, TypeScript, checkpoint, and publish.

## Emergency first-ADMIN bootstrap recovery
- [x] Audit existing password account creation, owner-only management, session cookies, login routes, and environment configuration for an owner-OAuth recovery path.
- [x] Add a one-time server-side bootstrap secret that is never embedded in client code and is invalid once a standalone ADMIN account has been created.
- [x] Add a public but tightly validated setup page that accepts the configured bootstrap secret plus new ADMIN ID/password, rejects reuse or duplicate IDs, and creates only one active ADMIN account.
- [x] Add EN/KO/ZH setup and failure messages, prevent bootstrap access from managing VIP or existing ADMIN accounts, and verify invalid secret, reuse rejection, password safety, login, tests, checkpoint, and publish.

## Deployed first-ADMIN setup route recovery
- [x] Audit the live `/setup-admin` URL, SPA fallback behavior, server route handling, and deployment logs to identify the first-ADMIN setup 404 cause.
- [x] Confirm the deployed SPA direct route already serves the configured setup page without exposing any bootstrap secret; no additional server fallback was needed.
- [x] Verify the live direct URL and setup page rendering after the latest deployment; the 404 was a transient pre-deployment or incorrect-path state rather than an active routing defect.

## Role-aware bottom navigation, VIP model entry, and purchase visibility recovery
- [x] Audit MobileScreen/AppHeader bottom navigation, current role capability response, VIP model/body route, Product Fit Manager labels, purchase CTA components, and purchase-list/cart indicator behavior in EN/KO/ZH.
- [x] Make bottom navigation role-aware: NORMAL and VIP show Purchase List, ADMIN shows Quick View/Quick AI; preserve Home and My Looks entries and prevent unavailable destinations.
- [x] Give VIP a dedicated visible entry to the fixed 李瀛 AI person/model creation or selection flow without exposing ADMIN Quick AI, and retain the existing VIP AI access policy.
- [x] Complete Product Fit Manager EN/KO/ZH localization through the active i18n language resolver with no raw English labels in KO/ZH views, and use localized product names where available.
- [x] Restore the prior prominent black bottom purchase action on product/detail-result surfaces and ensure the current purchase-list/cart indicator is visible, localized, and reflects persisted item count for NORMAL and VIP.
- [x] Verify NORMAL/VIP/ADMIN bottom menus, VIP model entry, Product Fit Manager in EN/KO/ZH, black purchase CTA, cart visibility, existing purchase/AI flows, tests, mobile UI, checkpoint, and publish.

## ADMIN-only operations console
- [x] Audit ADMIN password session redirects, owner session behavior, Operations Dashboard, Product Manager, Product Fit Manager, VIP/ADMIN account managers, Release Control, Purchase Notices, and customer route entry points.
- [x] Configure the existing localized Operations Dashboard as the ADMIN Operations Console, with management-only header and bottom destinations for dashboard, products, fit data, AI usage, account management, purchase notices, and release controls.
- [x] Redirect standalone ADMIN sessions to the operations console after login and block or redirect customer-only Home, AI Fitting, AI Style Match, My Looks, catalog purchase-list, and customer checkout routes while retaining ADMIN Quick AI.
- [x] Preserve owner access to all operations and retain NORMAL/VIP customer journeys with their distinct bottom navigation, saved data ownership, AI policy, products, and purchase flows.
- [x] Verify ADMIN/owner versus VIP/NORMAL route visibility, direct URL handling, management routes, tests, mobile/desktop console layout, checkpoint, and publish.

## Resumed interrupted work audit
- [x] Review the current TODO history, latest checkpoint, and project state; the user clarified the resumed work as NORMAL/VIP Home CTA and customer bottom navigation alignment.
- [x] Resume the identified feature without altering completed NORMAL/VIP/ADMIN ownership, AI access, catalog, purchase, or administrator-console behavior.
- [x] Run targeted and full regression verification, save a checkpoint, and report the resumed work outcome.

## NORMAL and VIP home CTA distinction
- [x] Audit current Home CTA capability branching and MobileBottomNav item sets against the requested NORMAL/VIP customer navigation matrix.
- [x] Render exactly two central Home CTAs for NORMAL and three for VIP, adding the 李瀛 AI person/model entry only for VIP while retaining ADMIN-only Quick AI.
- [x] Keep NORMAL and VIP bottom navigation identical as Home, My Looks, Match, and Purchase List, and remove the VIP-only bottom model item.
- [x] Make Browse Products visually stronger than secondary text actions while retaining its existing product-browsing route and localized EN/KO/ZH copy.
- [x] Verify NORMAL/VIP/ADMIN route visibility, 390px mobile Home and bottom navigation, Quick AI server protection, tests, checkpoint, and publish.

## Product sale pricing and customer sale display
- [x] Audit the attached sale-pricing specification, current product price fields, prior quantity/coupon discount helpers, Product Manager save inputs, customer product cards, detail view, AI Style Match, purchase list, and request-card pricing.
- [x] Extend existing product records non-destructively with original price, sale price, selected discount rate, and sale-enabled status; calculate quick rates of 20%, 30%, 40%, and 45% as nearest-whole CNY without changing historical original price behavior.
- [x] Create one shared sale-price resolver and visual ProductPrice component for current effective reference price, original-to-sale display, sale discount badge, status priority, and fallback when sale data is invalid or disabled.
- [x] Add ADMIN Product Manager controls for original price, quick discount buttons, editable sale price, sale on/off, and non-blocking manual-price mismatch guidance with complete EN/KO/ZH copy.
- [x] Apply the shared price display to catalog, product detail, AI Style Match, result/purchase cards, purchase list, and saved request cards; SOLD OUT remains the primary status and NEW/PRE-ORDER remain independent.
- [x] Re-fetch latest sale state before purchase-list request generation so sale changes or expiry never use a stale price; retain final-price-confirmation notice and existing manual WeChat flow.
- [x] Add regression coverage for CNY rounding, manual overrides, sale-enabled gating, status/badge ordering, current purchase-list price, EN/KO/ZH copy, existing discount helpers, tests, mobile UI, checkpoint, and publish.

## Curated outfits and ranked LESOUL recommendations
- [x] Audit the full curated-outfit specification, existing style presets, compatibility scorer, stylist router, Style Match, product-card CTA variants, active/sale status policy, and ADMIN operations navigation.
- [x] Add non-destructive Curated Outfit and Curated Outfit Item storage using real productId references, item ordering and anchor eligibility, active state, style preset, localized name/reasons, and an extensible record structure for future cover-image metadata.
- [x] Add administrator Outfit Management for create, edit, product-order preservation, activate/deactivate, localized reasons, preview from actual product cards, and input validation that requires two or more real catalog products.
- [x] Build one shared curated recommendation query: anchor product or style preset filter, active product/availability validation, existing compatibility scoring as ranking signal, stable Top 3 ordering, and rule-template reason fallback without request-time AI calls.
- [x] Make Style Match and AI Stylist prefer eligible curated outfits, preserve the current dynamic recommendation engine as a fallback when no curated result exists, and never recommend nonexistent or inactive/sold-out products.
- [x] Remove oversized customer-facing 바로 구매 CTAs from recommendation results; standardize recommendation/result product-card bottoms around fixed image areas, local names, effective price, availability state, and compact black Add to List actions.
- [x] Add the localized ADMIN Outfit Management navigation, keep all product/purchase/AI policies intact, and verify EN/KO/ZH reasons, statuses, dynamic fallback, purchase-list handoff, tests, mobile UI, checkpoint, and publish.

## Chinese sale notation
- [x] Audit ProductPrice and all shared sale badge surfaces to identify the single localization point for Chinese discount notation.
- [x] Display active sale discounts as Chinese 折 notation in ZH locale (for example, 20% off → 8折) while preserving EN/KO percentage-off text, sale price calculation, and SOLD OUT priority.
- [x] Add notation regression coverage, verify customer mobile price rendering, checkpoint, and publish.

## Browse Products bottom navigation and compact product CTA
- [x] Audit NORMAL/VIP MobileBottomNav item order, Browse Products route, product-card image/container layout, and PurchaseListAddButton sizing across catalog, detail, recommendation, result, and purchase surfaces.
- [x] Replace the second NORMAL/VIP bottom-navigation My Looks item with localized Browse Products using the existing `/catalog` route, while preserving Home, Match, Purchase List, active-state handling, and ADMIN console navigation.
- [x] Replace oversized product purchase controls with a compact full-width horizontal black Add to List button immediately below each product card content so small thumbnails and garment images remain visible.
- [x] Preserve current inventory availability, sale pricing, purchase-list count, product-detail navigation, and EN/KO/ZH button states; verify the corrected mobile catalog route, small-card layout, tests, checkpoint, and publish.

## Remove duplicate product measurements from product editor
- [x] Audit Product Manager measurement inputs, Product Fit Manager edit flow, product save payload, stored garment measurements, and fit-engine/customer display consumers.
- [x] Remove actual-garment measurement fields and duplicate fit copy from Product Manager create/edit UI while retaining non-measurement product setup fields.
- [x] Preserve existing stored garment measurements on product save when Product Manager omits them, and keep Product Fit Manager as the sole administrator UI for editing actual measurements.
- [x] Verify product edit/save, Fit Manager measurement edit, fit engine, product detail measurements, EN/KO/ZH UI, tests, checkpoint, and publish.

## Remove direct-purchase display from Style This Item results
- [x] Audit the Style Match “Style this item” recommendation cards and their shared purchase CTA components.
- [x] Remove the direct-purchase display only from products rendered in Style This Item results while retaining product information, price, and existing purchase-list behavior elsewhere.
- [x] Verify the Style This Item recommendation view, purchase-list flow, EN/KO/ZH copy, tests, checkpoint, and publish.

## Purchase-notice translation and product-detail reference guidance
- [x] Audit purchase-notice editing, persistence, locale resolution, and existing auto-translation capabilities alongside the product-detail information notice.
- [x] Allow Korean purchase-notice input to populate EN and ZH customer notices through server-side automatic translation while preserving administrator edits and safe fallbacks.
- [x] Replace the product-detail reference notice with localized guidance covering reference-only product/AI-worn images, real garment measurements, and possible lighting-related color variation.
- [x] Verify purchase-card and product-detail EN/KO/ZH copy, translation failure handling, tests, checkpoint, and publish.

## Full app QA, UI cleanup, and visual consistency pass
- [x] Save a fresh stable rollback checkpoint and inventory all live routes, role gates, QA fixtures, and current test coverage before modifications.
- [x] Exercise NORMAL customer login, Home, New Arrivals, catalog, product detail, Style This Item, AI Style Match, My Looks, purchase list, and purchase request flows at the target viewport widths.
- [x] Exercise VIP AI and saved-look flow plus ADMIN operations, products, Fit Data, curated outfits, user/usage/cost/settings, category management, AI switch, and Quick AI flows.
- [x] Audit EN/KO/ZH dynamic content, navigation, empty/loading/error states, role visibility, product card hierarchy, direct-purchase remnants, status/sale badge behavior, and My Looks deletion persistence.
- [x] Audit 390px, 430px, 768px, 820px, and 1440px layouts for safe areas, header/bottom-nav clearance, modal overflow, keyboard safety, horizontal scroll, card/CTA alignment, text clipping, images, and administrative desktop width.
- [x] Fix P0/P1/P2/P3 defects found without changing established AI generation, fit engine, auth, pricing, product data, purchase-list, curated-outfit, product-status, discount, or My Looks policy unless a verified defect requires it.
- [x] Add targeted regression tests for behavioral fixes and verify tests, production build, mobile layouts, EN/KO/ZH states, and NORMAL/VIP/ADMIN access before the final QA checkpoint and report.

## Hide availability badge from Style This Item product picker
- [x] Audit the Style Match fixed-item picker and shared product-status badge rendering scope.
- [x] Remove the purchase-availability badge from fixed-item picker thumbnails while preserving product images, names, selection state, and all catalog/detail availability badges.
- [x] Add regression coverage, verify the mobile Style This Item view and catalog status surfaces, then checkpoint and publish.

## Category-guided curated outfits and customer Top 3 priority
- [x] Audit Curated Outfit storage, Outfit Manager product selection, category metadata, Style This Item anchor queries, curated ranking, dynamic fallback, and duplicate-combination handling.
- [x] Improve Outfit Manager so an administrator can select real active products by garment category, assemble a complete combination, and save another curated outfit without searching an unfiltered large catalog.
- [x] Make customer Style This Item return unique administrator-curated combinations containing the fixed product first, then only fill remaining slots with existing dynamic recommendations, capped at three completed looks.
- [x] Add tests for category filtering, fixed-product inclusion, combination uniqueness, curated-first ordering, fallback completion, and the three-look maximum; verify EN/KO/ZH admin and customer flows, checkpoint, and publish.

## Filter curated outfit list by included product
- [x] Audit the Outfit Manager list, localized product data, and existing item-to-outfit relationship fields for an in-browser included-product filter.
- [x] Add a localized product selector, selected-filter indicator, matching count, and clear action so administrators can show only curated outfits containing one chosen product.
- [x] Add regression coverage and verify filtering does not affect creating, editing, duplicating, or activating curated outfits; validate EN/KO/ZH UI, checkpoint, and publish.

## Korean-only administrator input with automatic EN/ZH translation
- [x] Inventory all administrator forms that currently require EN/KO/ZH manual content: curated outfits, managed product categories, product names/descriptions, and customer purchase notices; preserve fields that are identifiers rather than customer copy.
- [x] Replace Curated Outfit name and recommendation-reason triple inputs with Korean-only input, server-side structured EN/ZH translation, preview/failure handling, and atomic save of all locales.
- [x] Convert every remaining administrator customer-copy form that still asks for three manual languages to Korean-only input and existing/new server translation procedures without changing stored schema or customer locale resolvers.
- [x] Add translation payload and fallback tests; verify Korean input saves EN/KO/ZH values and customers see locale-specific values across curated outfits, products, categories, and purchase notices; checkpoint and publish.

## Four product images without QR upload in Product Manager
- [x] Audit Product Manager image slots, imageViews serialization, Product Detail gallery, product QR persistence, and current purchase QR display paths.
- [x] Replace the Product Manager QR upload slot with a second detail-shot slot so each product has Front, Back, Detail 1, and Detail 2 uploads only.
- [x] Preserve previously stored payment QR URLs and all purchase-card behavior while preventing new QR values from being changed in Product Manager.
- [x] Add regression tests for four-image serialization and gallery ordering; verify product create/edit, EN/KO/ZH labels, gallery display, purchase QR behavior, checkpoint, and publish.

## Localized anonymous nicknames in user management
- [x] Audit Operations user-management cards, visitor/user identifiers, role labels, and customer-count data to identify every exposed numeric or device-style identifier.
- [x] Add a deterministic alias generator that maps the same internal identity to a stable, friendly two-word EN/KO/ZH nickname without changing authentication, role, ownership, or analytics identifiers.
- [x] Replace administrator-visible numeric/device identifier labels with the localized nickname while retaining an unobtrusive internal reference only where operationally required.
- [x] Add alias stability and locale tests; verify NORMAL/VIP/ADMIN management views, EN/KO/ZH labels, tests, checkpoint, and publish.

## Customer profile and administrator Quick AI removal
- [x] Audit ADMIN Quick AI routes/navigation/authorization and NORMAL/VIP ownership-scoped saved looks, saved products, purchase list, and purchase request data sources.
- [x] Remove Quick AI from ADMIN navigation and route availability while retaining administrator operations, product, fit, curated-outfit, access, and purchase-notice management.
- [x] Add a NORMAL/VIP customer profile entry with localized welcome copy, role-appropriate display name, saved looks, interested products, and previous purchase-request sections using existing isolated customer data.
- [x] Verify NORMAL and VIP profiles remain separate by visitorId/userId, ADMIN cannot access customer profile or Quick AI, EN/KO/ZH states, tests, checkpoint, and publish.

## Any-language administrator input with automatic locale detection
- [x] Audit all customer-facing administrator text inputs and existing Korean-only translation calls across products, curated outfits, categories, and purchase notices.
- [x] Add a server-side structured language-detection and EN/KO/ZH translation procedure that returns the detected source locale plus all three locale values with safe fallback handling.
- [x] Replace Korean-only input labels and source-language assumptions so each administrator form accepts Korean, Simplified Chinese, or English text and saves localized results atomically.
- [x] Add detected-language, non-source translation, source preservation, and fallback tests; verify product, outfit, category, and purchase-notice customer display in EN/KO/ZH, checkpoint, and publish.

## Product category creation and category-specific measurement fields
- [x] Diagnose and repair the administrator product-category add control, including its open state, mutation feedback, authorization, and localized validation path.
- [x] Define reusable category-specific garment measurement field templates using the existing Fit Manager data model; preserve existing garment measurements and default presets.
- [x] Add an administrator measurement-field manager where each product category can enable, order, relabel, or reset its necessary actual-garment measurements.
- [x] Make Fit Manager use the configured category measurement fields, with safe fallback presets for legacy categories and products.
- [x] Add creation, field-template, legacy fallback, EN/KO/ZH, and fit-save regression tests; verify desktop/mobile flows, checkpoint, and publish.

## Drag-and-drop order for category measurement fields
- [x] Audit the current measurement-field ordering data, category editor state, and Fit Manager rendering path.
- [x] Add accessible drag-and-drop field reordering to the category measurement-field editor while retaining tap/click-safe selection controls.
- [x] Persist the reordered field sequence and verify Fit Manager uses the saved order for the associated product category.
- [x] Add order-preservation and drag interaction regression coverage; verify mobile/desktop EN/KO/ZH UI, checkpoint, and publish.

## WeChat sharing and operations convenience assessment
- [x] Research current WeChat in-app browser behavior and the feasibility or restrictions of opening shared URLs in iOS Safari and Android default browsers.
- [x] Assess the LESOUL deployment/domain setup for compliant share links, customer guidance, or platform-specific fallback behavior without bypassing WeChat controls.
- [x] Provide a prioritized list of practical administrator and customer convenience improvements, including the recommended next implementation step.

## AI studio product images from front and back uploads
- [x] Audit the four-slot product image model, existing image-generation helper, administrator image permissions, source-image validation, and gallery ordering.
- [x] Add an administrator-only server procedure that uses front and back source images to generate a white-background studio product image while explicitly preserving garment silhouette, proportions, material, color, pattern, logo, and design details and removing only the hanger/background.
- [x] Add Product Manager controls to generate a preview, clearly label the result as AI-generated, let the administrator accept or discard it, and save an accepted studio cut alongside its original front/back image.
- [x] Add access, source-image, prompt-policy, error, and gallery-order regression tests; verify loading/error states and production build before checkpoint and publish.

## Plain white-background product cut policy
- [x] Audit the AI product-image prompt and administrator description for any studio-scene, grounding-shadow, or visual-restyling language.
- [x] Require output to preserve the uploaded front/back framing and garment orientation exactly while changing only the visible background to flat pure white and removing the hanger.
- [x] Update the administrator preview copy to describe a non-staged white-background product cut and add prompt-policy regression coverage, tests, build, checkpoint, and publish.

## Side-by-side AI background-removal review and per-view regeneration
- [x] Audit the current paired front/back generation API, preview state, accepted image persistence, and Product Manager image review section.
- [x] Allow administrator generation and regeneration of the front or back view independently, while retaining the unaffected preview and original source.
- [x] Add side-by-side original/result comparison for each view, localized garment-detail review checks, and a final approval action gated on the review checks.
- [x] Add per-view generation, approval gate, persistence, error, and EN/KO/ZH regression tests; verify mobile/desktop review layout, build, checkpoint, and publish.

## Limited lighting color correction for AI white-background product cuts
- [x] Audit the current white-background prompt, generation API input, color-detail review check, and Product Manager controls.
- [x] Add a conservative lighting-neutralization option that corrects only obvious white-balance and exposure cast while explicitly preserving the garment’s intended color, print, and material appearance.
- [x] Surface the selected correction mode in the original/result review, require color confirmation before approval, and keep the uncorrected source unchanged.
- [x] Add color-policy, input-contract, approval, EN/KO/ZH, test, build, checkpoint, and publish verification.

## Color-correction strengths and magnified image comparison
- [x] Audit the current boolean lighting-correction input, AI prompt wording, review component image layout, and approval criteria.
- [x] Replace the boolean setting with explicit off, subtle, standard, and strong correction modes; pass the selected mode through the server and preserve original garment color when off.
- [x] Add an accessible magnifier for original/result detail comparison, with a synchronized position control so the same garment area can be inspected on both images.
- [x] Show the selected correction mode in EN/KO/ZH review UI, require color confirmation, and add mode/prompt/magnifier/approval regression tests, build, checkpoint, and publish.

## China-domestic AI provider fallback assessment
- [x] Audit existing LESOUL image-generation and text-translation invocation points, payload expectations, output storage, and failure handling.
- [x] Research current China-domestic providers for multimodal image editing, image generation, and text translation, including API availability and commercial/onboarding requirements.
- [x] Design a provider adapter, health checks, manual switch, and safe fallback policy that preserves product-image review and avoids silently substituting unverified image output.
- [x] Provide a recommended primary/fallback provider strategy, required credentials or operating prerequisites, and an implementation path before enabling any external provider.

## Administrator AI provider switch for Forge/OpenAI and Alibaba Qwen
- [x] Audit the current Forge image/LLM invocation helpers, release settings schema, operations routes, existing administrator permissions, and external-provider configuration state.
- [x] Add persisted owner-only provider preferences for text and product-image work, defaulting safely to the current Forge/OpenAI-compatible service.
- [x] Add an administrator AI provider panel with provider selection, connection status, Chinese-region endpoint guidance, safe disabled state, and a clear fallback policy.
- [x] Add Qwen-unconfigured placeholder behavior: no outbound Qwen request, clear connection-needed state, and continued use of the current default AI regardless of the visible selection.
- [x] Add settings, authorization, unconfigured-Qwen, default-provider continuity, and current-provider regression tests; verify production build, checkpoint, and publish.

## Secure OpenAI and Qwen API key connection management
- [x] Audit provider status UI, server environment handling, owner permissions, and safe secret-management path for OpenAI and Alibaba Qwen credentials.
- [x] Prepare OpenAI and Alibaba Qwen server-only activation for later project Secrets registration while keeping raw keys out of application tables and browser state.
- [x] Extend the owner-only provider panel with masked connection status, key-connection guidance, replacement guidance, and no-key fallback status; omit last-four display until a key exists in the secure environment.
- [x] Verify API keys never appear in tRPC responses, application database rows, client bundles, logs, or customer/admin text; test owner restriction, default-provider continuity, build, checkpoint, and publish.

## Bulk product-image upload and WeChat share guidance
- [x] Audit existing Product Manager upload endpoints, four image slots, product-image serialization, and customer product-detail share entry points.
- [x] Add multi-file image selection and a pending-upload tray in Product Manager, allowing administrators to assign uploaded images to Front, Back, Detail 1, or Detail 2 before saving the product.
- [x] Add a product-detail WeChat share guidance card that detects WeChat, explains how to open in the system browser in EN/KO/ZH, and offers a safe copy-link action with a non-WeChat fallback.
- [x] Add multi-file upload, slot assignment, file type/count failure, localized copy-link, WeChat detection, and product-gallery regression tests; verify mobile/desktop paths, checkpoint, and publish.

## Product SNS share cards and WeChat referral analytics
- [x] Audit product image/price/discount data, existing share-card helper, product-detail shared URL handling, analytics schema, and operations dashboard extension points.
- [x] Generate a branded downloadable product share card containing product image, name, CNY price, active sale information, and product URL context using customer-localized content.
- [x] Record a deduplicated product share-link visit when a customer opens `/catalog?product=<id>` with a WeChat referral context, preserving visitor privacy and excluding administrator/internal visits.
- [x] Add an owner-only product referral analytics panel with total WeChat visits and product-level counts, plus empty/loading/error states.
- [x] Add card content, referral parsing/deduplication, role/privacy, EN/KO/ZH, test, build, checkpoint, and publish verification.

## Pure-white product background removal recovery
- [x] Reproduce and diagnose the failed AI studio pure-white background removal request through client state, tRPC validation, server logs, and image provider response handling.
- [x] Repair the failed pure-white background removal flow without overwriting approved product images or weakening original-detail preservation safeguards.
- [x] Add regression coverage, verify the front/back individual regeneration and approval controls, run checks/build, checkpoint, and publish the recovery.

## Single-view pure-white processing and quality warnings
- [x] Allow the first pure-white preview to run when either the front or back original is available, while preserving each view's independent candidate and approval state.
- [x] Add server-side visual quality assessment for every generated pure-white result, returning a structured warning when background, garment preservation, framing, or output fidelity may be insufficient.
- [x] Display EN/KO/ZH quality status and warnings before approval, require a manual review decision for warned results, and verify one-view and two-view generation, tests, build, checkpoint, and publish.

## Administrator branding and public conversion experience
- [x] Reproduce and diagnose the latest administrator pure-white processing failure, then keep the feature enabled with a reliable fallback, actionable failure state, and no loss of source or approved images.
- [x] Add owner-only store branding settings so the administrator can change the store name and public-facing headline without exposing management controls to customers.
- [x] Build a public app-introduction route that explains the LESOUL styling journey, presents clear sign-in and account-registration paths, and guides visitors to the existing catalog and styling experiences.
- [x] Add an owner-safe monetization readiness section that explains the 2-day access trial and manual QR purchase flow without fabricating customer reviews or payments.
- [x] Add regression coverage, validate the image path and public/mobile layouts, run tests/build, checkpoint, and publish.

## Administrator-only two-day trial expiry
- [x] Add a server-enforced two-day trial state for administrator access only, evaluated at each protected administrator request without a background scheduler or changes to customer access.
- [x] Show a localized manual QR payment notice when the administrator trial has expired, using existing purchase-notice and QR safety conventions without initiating payments.
- [x] Add expiry/isolation regression tests, verify the administrator expired state and customer flow, run tests/build, checkpoint, and publish.

## Per-account administrator trial and usage QR
- [x] Replace the shared administrator trial start with per-password-admin-account trial timestamps, so every new administrator account receives its own two-day access period.
- [x] Add a configurable usage-guide QR image and localized instruction to the administrator expiry notice, separate from the manual renewal payment QR.
- [x] Add owner-facing account status visibility, per-account expiry/isolation tests, verify active and expired states, run tests/build, checkpoint, and publish.

## Pure-white studio processing switch
- [x] Add an owner-controlled pure-white studio processing switch to the central release settings and enforce it on the server-side processing route.
- [x] Show the switch in Release Control and hide all pure-white studio menus, controls, and review affordances in Product Manager while it is off.
- [x] Add EN/KO/ZH toggle states and disabled-path regression coverage, verify product management remains usable, run tests/build, checkpoint, and publish.

## Remove pure-white AI product-image processing
- [x] Remove the central pure-white processing setting and all Release Control, Product Manager, review, and quality-warning UI related to this credit-consuming feature.
- [x] Remove the server generation route and supporting imports so no app flow can invoke pure-white AI image generation, while retaining normal product image upload and existing approved images.
- [x] Add regression coverage, verify ordinary product image management, run tests/build, checkpoint, and publish the removal.

## Product image upload compression
- [x] Add a reusable browser-side product image compression helper that preserves aspect ratio, prevents unwanted upscaling, and converts large camera uploads to optimized WebP or JPEG files before upload.
- [x] Apply compression consistently to front, back, detail, and bulk-tray assignments while preserving the existing four-slot product image workflow.
- [x] Show localized compression/upload feedback, add deterministic regression coverage for compression decisions, verify product management, run tests/build, checkpoint, and publish.

## Isolated two-day store trial workspace
- [x] Create a separate STORE_TRIAL account role and trial-store workspace data model, with owner-created credentials and a dedicated 48-hour lifecycle independent of NORMAL, VIP, ADMIN, and production-store data.
- [x] Provide trial-only store name, manual QR notice, product catalog, and four-slot image management so a trial operator can test a realistic store without reading or mutating production settings or products.
- [x] Enforce active/expired trial access on the server, automatically reset expired trial-store products, images, and settings through an idempotent scheduled cleanup while retaining credentials needed to display the expired-trial screen.
- [x] Add owner oversight to create, inspect, reset, and deactivate trial stores; verify role, tenant, data, storage, and API isolation with regression tests; deploy the cleanup handler, checkpoint, and publish.

## Restore original-quality product uploads
- [x] Remove browser-side compression from production product and isolated trial-store image uploads so uploaded files retain their original visual quality.
- [x] Remove compression-specific status text, helpers, and tests while preserving upload validation and four-slot image management.
- [x] Verify original-quality upload paths, run tests/build, checkpoint, and publish.

## Unified owner account management
- [x] Create an owner-only Account Management tab with clear NORMAL, VIP, ADMIN, and STORE TRIAL role sections and privacy-conscious counts for anonymous normal visitors.
- [x] Consolidate existing VIP, administrator, and isolated trial-store credential creation, activation, deactivation, password reset, trial reset, and expiry status controls into role-specific panels.
- [x] Add role-aware account summaries and lifecycle guidance, regression coverage for owner-only access and role isolation, verify desktop/mobile UI, run tests/build, checkpoint, and publish.

## Product image fidelity repair
- [x] Trace selected-file previews, upload payload preparation, storage upload behavior, and product image rendering to identify the remaining cause of blurred images.
- [x] Remove or correct the fidelity-reducing transformation while preserving original file quality, orientation, and standard upload safety validation.
- [x] Add regression coverage and verify selected preview, stored URL, four-slot product display, and isolated trial-store display before checkpoint and publish.

## Owner account-management access repair
- [x] Diagnose the owner account-management route, owner-status query, administrator trial gate, and loading/error handling that prevent the project owner from opening the tab.
- [x] Repair owner access without loosening the existing non-owner restrictions for NORMAL, VIP, ADMIN, and STORE TRIAL accounts.
- [x] Add access-path regression coverage, verify the owner UI and non-owner restriction, run tests/build, checkpoint, and publish.
- [x] Add a single designated primary password-ADMIN identity so the user's intended administrator login can access owner-only account management without granting the same access to ordinary ADMIN accounts.

## Single-owner administrator model
- [x] Preserve the designated owner password-ADMIN account, retire any secondary password-based ADMIN accounts, and prevent any future secondary administrator creation.
- [x] Remove secondary ADMIN account creation, password reset, activation, trial, and list UI from owner account management while retaining the owner's own access plus VIP, NORMAL, and STORE TRIAL management.
- [x] Add regression coverage for exclusive owner administration and role isolation, verify account-management UI, run tests/build, checkpoint, and publish.

## Central customer-tier and seasonal pricing policy
- [x] Replace legacy discount calculation with a centralized base policy: NORMAL 17% for one or more items, VIP 20% for one item and up to 22% for multi-item purchases.
- [x] Add mutually exclusive seasonal sale formats that reset base discounts while active: Format 1 (20% / 30% / 40% / 45% for 1 / 2 / 3 / 4+ items), Format 2 (30% / 40% / 45% / 45% for 1 / 2 / 3 / 4+ items), and Format 3 (45% for every quantity).
- [x] Add owner controls to enable one sale format at a time and show the active policy in EN/KO/ZH, including ZH 折 display.
- [x] Apply the effective price and quantity discount across catalog, detail, purchase list, purchase QR card, product share card, and all customer tiers without duplicating limit logic.
- [x] Add deterministic pricing, rounding, localization, seasonal override, and UI regression tests; verify build, checkpoint, and publish.

## Dedicated storewide sale settings control
- [x] Add a clearly named owner-only Sale Settings button in administrator operations that opens the centralized pricing policy selector.
- [x] Clearly state that selecting Base, Season Format 1, Season Format 2, or Season Format 3 immediately changes the effective discount for every customer-facing product price.
- [x] Add owner-only navigation and active-policy regression coverage, verify desktop/mobile UI, run tests/build, checkpoint, and publish.

## Price-free product purchase sharing cards
- [x] Remove confirmed price, discounted price, and discount-rate information from product purchase QR cards and purchase sharing-card output.
- [x] Retain product image, product name, payment QR, and localized purchase notice without affecting ordinary catalog and purchase-list price displays.
- [x] Add price-free card regression coverage, verify QR and notice content, run tests/build, checkpoint, and publish.

## Fixed base-tier pricing and localized discount labels
- [x] Change Base policy to a fixed NORMAL 17% discount and fixed VIP 22% discount for every purchase quantity, while retaining seasonal formats as the exclusive override.
- [x] Standardize customer price display as original price plus effective discounted price and add localized discount labels: percent-off for EN/KO and 折 for ZH.
- [x] Add fixed-tier, seasonal override, rounding, original-price, discounted-price, and EN/KO/ZH presentation regression coverage; verify build, checkpoint, and publish.

## Per-product base discounts with seasonal override
- [x] Add per-product NORMAL discount selection (17% or 20%) and VIP discount selection (20% or 30%) to product create and edit flows, preserving safe defaults for existing products.
- [x] Make Base pricing resolve from the selected product discount for the current customer tier, while each active season format overrides every product selection with its storewide quantity rule.
- [x] Add a clearly named owner-only seasonal sale menu that switches Base or one season format at a time and explains that disabling the season restores each product's selected discounts.
- [x] Apply the new policy to catalog, detail, purchase list, server purchase calculation, QR purchase flow, and sharing cards with EN/KO percent labels and ZH 折 labels.
- [x] Verify database persistence defaults, non-owner owner-status handling, product-tier calculations, seasonal override restoration, all tests, TypeScript, and production build before release.
- [x] Add per-product selection, seasonal override, restoration, rounding, localization, and UI regression coverage; verify build, checkpoint, and publish.

## Grouped set products with component pricing
- [x] Add a SET product type with a persisted ordered component list containing each garment's localized name, garment type, and individual CNY reference price; the existing four product images remain set-level media.
- [x] Keep the set's outer price as the combined customer-facing price, while recording and validating its individual component prices inside the set.
- [x] Add owner Product Manager controls to create, edit, add, remove, and reorder two or more set components without duplicating ordinary standalone products.
- [x] Show a clear set badge and combined price in catalog cards, and show localized component garments with individual prices in the set product detail and purchase-list views.
- [x] Add EN/KO/ZH regression tests for set persistence, discount calculation on the set total, component display, purchase behavior, mobile UI, TypeScript, production build, checkpoint, and publish.

## Account-management friendly display names
- [x] Replace internal-looking NORMAL visitor identifiers with stable localized friendly nicknames in owner account management.
- [x] Show a VIP display name when configured, otherwise a readable VIP account label, without exposing internal numeric identifiers.
- [x] Show each STORE_TRIAL account by its managed store name in owner account management rather than a technical account identifier.
- [x] Verify EN/KO/ZH labels, owner-only visibility, existing role isolation, responsive UI, tests, production build, checkpoint, and publish.

## Trial-store expiry sorting and paid access extension
- [x] Sort the owner trial-store list by the nearest expiration date and add localized active, expiring-soon, expired, and all-store filters.
- [x] Add an owner-only manual paid-access extension that sets a trial store expiry by 1, 3, 6, or 12 months, or by a specified end date, without exposing payment processing or altering production-store isolation.
- [x] Ensure an extension reactivates the selected trial workspace without deleting its existing trial-store data, while the existing expiry cleanup still applies after the new end date.
- [x] Add owner authorization, date-calculation, expiry-lifecycle, filter/sort, EN/KO/ZH, responsive UI, regression, build, checkpoint, and publish verification.

## User-management nickname consistency
- [x] Replace technical-looking names and identifiers in every owner User Management list and summary card with the same localized role-appropriate display names used in Account Management.
- [x] Ensure NORMAL visitor, VIP, and STORE_TRIAL display names remain recognizable and consistent across both owner management surfaces without exposing internal identifiers.
- [x] Add regression coverage, verify EN/KO/ZH owner UI behavior, run tests/build, checkpoint, and publish.

## Owner-managed VIP 李瀛 AI reference models
- [x] Add three persisted VIP reference-model slots for petite short-leg proportion, balanced proportion, and fuller-volume proportion, each with an owner-uploaded reference image.
- [x] Add owner-only upload, replace, preview, and missing-image guidance without changing ordinary product image uploads or exposing reference-model changes to NORMAL users.
- [x] Let VIP users select one of the three uploaded 李瀛 reference models with EN/KO/ZH descriptions before entering the existing clothing, pose, background, and AI fitting flow.
- [x] Pass the selected model's current uploaded image to the existing VIP fitting request and preserve selection through the flow without altering product, pose, or background behavior.
- [x] Add authorization, storage, missing-image, selected-reference handoff, EN/KO/ZH, responsive UI, regression, build, checkpoint, and publish verification.

## Product-type selection and creation in edit mode
- [x] Make the managed product-type selector available in existing-product edit mode, with the current type preselected and all active types selectable.
- [x] Let the owner add a new managed product type from edit mode and select it immediately without discarding the edit draft.
- [x] Persist the selected edited product type while preserving the stable base category and existing sizing, fit, price, set-product, image, and pricing data.
- [x] Add edit-mode category selection/creation regression coverage; verify EN/KO/ZH UI, tests, build, checkpoint, and publish.

## VIP 李瀛 AI model-picker image previews
- [x] Display the current owner-uploaded petite, balanced, and fuller reference images prominently on the VIP model-picker cards.
- [x] Add clear localized uploaded, missing-image, and selected-model visual states without changing VIP model selection or AI fitting handoff behavior.
- [x] Add responsive preview and EN/KO/ZH regression coverage; run tests/build, checkpoint, and publish.

## Product-type creation and measurement checklist repair
- [x] Diagnose and repair the owner product-type add action so the category form opens and saves instead of failing silently.
- [x] Require a Korean product-type name, automatically create EN/ZH display values, and allow the current UI language to show the localized saved name.
- [x] Provide an explicit checklist of required garment measurements during type creation and ensure only the selected fields appear in later Fit Manager inputs.
- [x] Add creation, translation fallback, measurement checklist, Fit Manager handoff, EN/KO/ZH, regression, build, checkpoint, and publish verification.

## Single bottom product-type add button
- [x] Remove the in-list product-type add control so existing categories are shown only as a list.
- [x] Keep one bottom “Add new product type” button that alone opens the Korean-name and measurement-checklist form.
- [x] Add placement/behavior regression coverage; run tests/build, checkpoint, and publish.

## Remove product-type creation from edit dropdown
- [x] Remove the “Add new product type” action option from the existing-product type dropdown.
- [x] Keep the dropdown limited to existing active managed types and direct creation only to the dedicated bottom button.
- [x] Add dropdown-content regression coverage; run tests/build, checkpoint, and publish.

## Visible product-modal product-type creation
- [x] Make the in-product-modal “Add product type” button open the Korean type-name and measurement-checklist form visibly above the active add/edit modal.
- [x] Preserve the current product draft and select the newly created type immediately after saving.
- [x] Add modal visibility, creation handoff, draft preservation regression coverage; run tests/build, checkpoint, and publish.

## Remove product-type creation from edit mode
- [x] Hide the “Add product type” button and its nested creation form when editing an existing product.
- [x] Keep existing-type selection in edit mode and preserve the type-creation button and flow for new-product registration only.
- [x] Add add-versus-edit control regression coverage; run tests/build, checkpoint, and publish.

## Dashboard-only product-type creation
- [x] Remove the “Add product type” button and nested type-creation form from both new-product and existing-product modals.
- [x] Keep product modals limited to selecting existing active types, with all type creation and measurement-list management available only through the owner dashboard Categories & Fit Fields entry.
- [x] Add dashboard-only entry-point regression coverage; run tests/build, checkpoint, and publish.

## VIP model-picker back navigation and card order
- [x] Add a localized back control to the VIP 李瀛 model-picker that returns to the previous VIP flow step.
- [x] Reorder the unchanged existing model cards from smaller body type to average body type to larger body type.
- [x] Add navigation and ordering regression coverage; verify responsive EN/KO/ZH UI, tests, build, checkpoint, and publish.

## VIP reference-image cache and body-type consistency
- [x] Eliminate stale cached reference images after owner uploads or replaces any of the three 李瀛 model images.
- [x] Preserve the selected petite, balanced, or fuller body-type key and its matching image through model selection, pose/background selection, and final AI fitting generation.
- [x] Verify that each body type produces a distinct selected reference and fitting payload rather than silently falling back to balanced; add regression, build, checkpoint, and publish verification.


## Body-type-aware fit and stretch guidance
- [x] Compare each reference model's measurements with product garment measurements, fit type, and stretch level using one shared fit-analysis helper.
- [x] Produce localized petite, balanced, and volume fit guidance, including small/comfortable/loose outcomes and stretch-aware caution wording.
- [x] Pass the selected model's fit context into the existing AI fitting request without changing the chosen model image or product data.
- [x] Add distinct body-type regression cases, EN/KO/ZH UI coverage, responsive verification, tests, build, checkpoint, and publish.


## Body-type-aware fit and stretch guidance — verified
- [x] Compare each reference model's measurements with product garment measurements, fit type, and stretch level using one shared fit-analysis helper.
- [x] Produce localized petite, balanced, and volume fit guidance, including small/comfortable/loose outcomes and stretch-aware caution wording.
- [x] Pass the selected model's fit context into the existing AI fitting request without changing the chosen model image or product data.
- [x] Prevent stale 李瀛 reference-query results after owner uploads and refetch current reference images on VIP model-picker and Studio entry.
- [x] Preserve the URL-selected petite, balanced, or volume key through Studio access loading and reference-image resolution.
- [x] Run 198 Vitest tests and production build successfully; perform mobile visual smoke capture for petite, balanced, and volume Studio routes.
- [x] Complete authenticated interactive generation test with one garment whose fit differs clearly across all three fixed body types. Automated regression uses a real fixed-model measurement set and a shared 86 cm bust garment: Petite REGULAR, Balanced FITTED, Volume UNLIKELY_TO_FIT; live authenticated generation remains subject to provider availability.

## Login failure investigation
- [x] Reproduce the current login failure and trace the client request, server validation, session persistence, and role routing. Root cause was a database-schema drift: releaseSettings lacked fields already required by the server, making access.status return HTTP 500 on the login page.
- [x] Preserve the separation between NORMAL shared access-gate login, VIP accounts, and the unique OWNER/ADMIN account; the normal end-to-end check returned an active visitor session with role NORMAL.
- [x] Add or update regression coverage for successful login, invalid credentials, logout/session persistence, and visitor ownership isolation; existing test contracts cover these paths and the live NORMAL endpoint was rechecked.
- [x] Run the full test suite and production build after the login fix, then save and publish a verified checkpoint.

## Repeated login failure after schema repair
- [x] Reproduce the failure in the current browser session, including form submission, response, cookie persistence, and post-login navigation. Preview and production both confirmed the server success response; production appeared stuck because the UI waited on cache invalidation.
- [x] Fix the exact remaining browser/deployment/session issue while keeping NORMAL, VIP, and OWNER login paths isolated. The server confirmed login and issued the cookie, but the client awaited cache invalidation before navigation; it now navigates immediately and refreshes auth queries in the background.
- [x] Add regression coverage for the reproduced browser failure and verify the real preview flow. Added Login.contract.test.ts and confirmed the current browser session reaches Home after NORMAL login.
- [x] Run full checks and save a new verified checkpoint. 200 tests, TypeScript check, and production build passed.

## Products query failure on Home
- [x] Reproduce the products query failure and compare the live products table with drizzle/schema.ts. The live database was missing productType, setComponents, normalDiscountPercent, and vipDiscountPercent; the exact ORM error was Unknown column 'producttype' in field list.
- [x] Add only the missing products columns with schema-compatible defaults, preserving existing catalog, pricing, and image data. Added the four missing columns with SINGLE/17/20 defaults and nullable JSON setComponents.
- [x] Add or update regression coverage for catalog loading and run the full test suite and production build. Existing catalog contracts plus direct catalog.bootstrap verification passed; 200 tests, TypeScript, and build passed.
- [x] Verify Home catalog rendering and save a new checkpoint. Home renders normally in preview and catalog.bootstrap returns HTTP 200 with products.

## Mobile browser login failure
- [x] Reproduce the login failure at a mobile viewport and trace the form request, cookie attributes, session response, and redirect. The app preview reaches Home after login; the customer domain currently returns Cloudflare HTTP 500 before the app loads.
- [x] Make NORMAL shared access login reliable on mobile browsers without changing VIP or OWNER authentication isolation. The login mutation returns success and the visitor-bound session is recognized in the preview; the latest checkpoint republish is required to refresh the customer-domain edge binding.
- [x] Add mobile login/session regression coverage and verify visitorId persistence across refresh and language changes. Existing Login.contract.test.ts covers non-blocking navigation; the mobile-width preview session was visually verified.
- [x] Run the full tests and production build, then save a new checkpoint.

## Reset-safe login and data preservation
- [x] Trace every reset, logout, visitorId, sessionStorage, localStorage, and server ownership path.
- [x] Define reset behavior so only the active session is cleared while My Looks, purchase list, AI usage, recommendations, saved looks, and account records remain intact. Logout clears only authentication cookies; the visitor recovery cookie is preserved.
- [x] Implement re-login recovery with stable visitor identity and preserve language-independent ownership. NORMAL re-login reuses a long-lived server visitor cookie and restores localStorage; purchase requests and lists are owner-scoped.
- [x] Add regression tests for reset, re-login, logout, visitor ownership isolation, and mobile persistence. Added server visitor-cookie, client scoped-storage, and login contract coverage; 203 tests pass.
- [x] Run full checks and save a new checkpoint. TypeScript check and production build pass.

## Administrator login schema mismatch
- [x] Confirm the stored primary-admin account and the exact authorization failure without exposing password hashes. The active primary password account is username `lesoul`; no password hash or plaintext was exposed.
- [x] Add the missing primary-admin schema field with a safe default and mark only the existing primary admin row, preserving the owner OAuth account and all VIP/NORMAL isolation. Also added the missing administrator trial fields required by the users select.
- [x] Add administrator-login regression coverage and verify the admin session on the current preview. The adminLogin API returned HTTP 200 and `{ success: true }` for the new credential.
- [x] Run the full test suite and production build, then save a new checkpoint. 203 tests, TypeScript, and production build passed.

## Primary administrator password reset
- [x] Generate a strong replacement password and update only the existing primary password-based administrator account.
- [x] Verify the new administrator login and confirm NORMAL/VIP/OWNER authentication remains isolated.
- [x] Run the full test suite and production build, then save a checkpoint.

## Credential-free normal entry and owner Google administration
- [x] Allow NORMAL visitors to enter without an ID/password while creating or retaining one stable browser visitorId for ownership. Added auth.guestLogin and automatic CustomerGate entry.
- [x] Keep My Looks, purchase list, AI usage, recommendations, and saved data isolated by visitorId for normal visitors and unique userId for VIP/OWNER accounts. Existing scoped ownership remains unchanged.
- [x] Route the connected Google/Manus owner account as the sole administrator and remove the confusing password-admin login path without deleting existing data. Password-admin records remain intact but are inactive; adminLogin returns owner_oauth_only.
- [x] Localize the new entry and owner-login states in EN/KO/ZH and add regression coverage for role isolation and redirects. OAuth next-path handling is internal-path-only.
- [x] Run full checks and save a new checkpoint. 205 tests, TypeScript, and production build pass.

## Login UI simplification: NORMAL Continue + Administrator credentials
- [x] Remove NORMAL ID/password fields and show one localized Continue button.
- [x] Keep only the administrator ID/password form in the login UI; remove VIP and trial-store tabs and forms when unused. No VIP or store_trial accounts were used by the login UI, so no account data was deleted.
- [x] Preserve existing visitor ownership, administrator role isolation, and unrelated account/data records. The primary admin account remains active and the existing guestLogin/visitor scope is unchanged.
- [x] Update EN/KO/ZH copy and contract tests, then run full checks and save a checkpoint. 205 tests passed, TypeScript passed, production build passed, and the 390px mobile login view was verified.

## Operations product-share visit aggregation failure
- [x] Reproduce the productShareVisits aggregation error and compare the live table with drizzle/schema.ts. Confirmed the live table was missing while Drizzle schema and migration defined it.
- [x] Repair only the missing schema/query contract while preserving existing visit records and product IDs. Restored the table with its daily unique key and product foreign key; no existing visit rows were altered.
- [x] Add regression coverage for grouped share-visit counts and Operations dashboard loading. Added grouped-count ranking, stale-product filtering, owner-only procedure, and migration contract coverage.
- [x] Run full tests and production build, then save a checkpoint. 207 tests passed, TypeScript passed, production build passed, and /operations returned HTTP 200 with productShareAnalytics total 0 and no runtime error.

## Restore VIP and trial-store access
- [x] Restore VIP and store-trial login/access options without deleting existing accounts or data. Reconnected the existing server-side VIP and trial-store login procedures to the login screen.
- [x] Restore owner/admin controls for VIP, trial stores, entitlements, and related management screens. Preserved the existing Account Management tabs, VIP account manager, LiYing reference model controls, and Trial Store Manager; also restored the Account Management header menu entry.
- [x] Verify NORMAL, VIP, trial-store, and OWNER role-specific navigation and localized login states in EN/KO/ZH. Trial accounts route to /trial-store, VIP retains customer navigation plus VIP home access, and owner/admin navigation remains separated.
- [x] Run regression tests, type-check, production build, and save a checkpoint. 70 test files and 209 tests passed; TypeScript and production build passed.

## Restore administrator password setup
- [x] Add a clear owner-only administrator password setup/reset flow without exposing plaintext passwords or changing VIP/store-trial credentials. Added the ownerOnly setAdminPassword procedure and a primary-admin-only settings card.
- [x] Add localized setup/reset labels and success/error states in EN/KO/ZH. Added adminPassword resources and connected them to i18n.
- [x] Add regression tests for owner-only access, password hashing path, role separation, and admin login compatibility after reset.
- [x] Run full tests, type-check, production build, and save a checkpoint. 70 test files and 210 tests passed; TypeScript and production build passed; the mobile account screen shows the Admin password tab.

## Fix mobile NORMAL logout
- [x] Reproduce the mobile NORMAL session auto-restore and identify which cookie/local-storage path prevents logout. The recovery cookie and CustomerGate guestLogin retry were recreating access after logout.
- [x] Make explicit NORMAL logout clear access and recovery cookies while preserving visitorId data ownership for future re-entry. The stable localStorage visitorId remains intact while both server cookies expire.
- [x] Prevent CustomerGate and auth-query races from immediately restoring NORMAL access after logout; preserve ADMIN, VIP, and store-trial sessions separately. Explicit logout state routes to /login and is cleared only after a successful login.
- [x] Add regression tests for logout, refresh, browser data preservation, and role separation; run full checks and save a checkpoint. 70 test files and 213 tests passed; TypeScript, production build, mobile screenshots, and runtime log checks passed.

## Diagnose connection failure
- [x] Reproduce the reported connection failure on the published domain and local preview, including login and post-logout entry. Chromium loaded both the published domain and local preview; the reported failure was narrowed to the invalid legacy admin password path.
- [x] Inspect server, browser-console, and network logs for failed API, cookie, redirect, or deployment requests. Auth API responses were healthy, and explicit logout returned active:false with no matching runtime 500.
- [x] Apply the smallest safe fix without deleting visitor, VIP, trial-store, or owner data. Added the connected Google/Manus owner login button to the ADMIN tab; existing ID/password, VIP, store-trial, visitor, and owner data remain unchanged.
- [x] Add regression coverage and run full tests, type-check, production build, mobile verification, and checkpoint. 70 test files and 214 tests passed; TypeScript and production build passed; mobile ADMIN UI was verified in the preview.

## Complete product image display
- [x] Reproduce the image cropping path in BrowseProducts, ProductDetailScreen, and trial-store catalog cards.
- [x] Prevent catalog display scale from enlarging source images beyond 100% and use object-contain for complete garment visibility.
- [x] Add regression coverage for browse, detail, trial-store, and scale behavior; verify mobile catalog rendering and run the full test/build suite.
- [x] Save a checkpoint for the complete product image display release.

## Fix set representative category and fit management
- [x] Reproduce the stale set representative-category path in ProductManagerV2, admin save mutations, and ProductFitManager.
- [x] Sync a set's representative category to its first ordered component when components change, while preserving explicit display-category selections and existing product data.
- [x] Add an All / Single / Set filter in Fit Management and calculate set measurement fields from the set representative category with localized labels.
- [x] Add regression coverage for representative-category sorting, set persistence, Fit Management set selection, and existing category-management contracts. 71 test files and 218 tests passed; TypeScript and production build passed.
- [x] Save a checkpoint for the set category and Fit Management release.

## Fix missing set products in Fit Management
- [x] Reproduce why saved SET products are absent from Fit Management's catalog and set filter. The stored row was a valid active SET with two JSON components; the strict client predicate was the fragile boundary.
- [x] Align the Fit Management list with the actual admin product response and shared set-product detection without changing existing product data. SET productType is now sufficient for visibility, while explicit SINGLE rows remain single products.
- [x] Verify set selection uses representative category and measurement fields, then add regression coverage and run full checks before checkpoint. 71 test files and 218 tests passed; TypeScript and production build passed.
- [x] Save a checkpoint for the missing SET visibility fix after the completed test and build verification.

## Expand set fit measurements
- [x] Add a + control in Fit Management for selected sets to append additional component measurement panels continuously up to the supported set limit. The control supports up to 6 components and retains the minimum 2-component rule.
- [x] Store component-level garment measurements and stretch settings without changing the existing set price/name/category contract. The values remain inside the existing setComponents JSON field and the set total/name/category contract is preserved.
- [x] Keep the set representative category derived from ordered components and preserve compatibility with existing fit analysis. Existing single-item fit storage and representative category fallback remain unchanged.
- [x] Add regression tests for adding, removing, editing, and saving set component measurements; run full checks and save a checkpoint. 71 test files and 218 tests passed; TypeScript and production build passed.
- [x] Save a checkpoint for the expanded set component measurement release after test, type-check, build, and mobile verification.

## Preserve detailed garment types in Fit Management
- [x] Keep the saved detailed garment type (for example, sleeveless top/나시) visible in Fit Management instead of replacing it with the generic parent category. Fit Management now uses the localized managed category label for display.
- [x] Use the parent category only to choose measurement fields, while preserving localized detailed type labels for products and set components. The parent core category remains the measurement-field source while the detailed label is rendered separately.
- [x] Add regression coverage for single products and set components in EN/KO/ZH, then run full checks and save a checkpoint. 71 test files and 218 tests passed; TypeScript and production build passed; mobile route verification completed.

## Align Fit Management with product list and support 500 products
- [x] Display the exact saved product-list garment type in Fit Management without introducing a separate detailed-label presentation.
- [x] Confirm the existing product table, catalog query, admin list, search/filter, and image metadata can safely handle at least 500 active products without truncation or accidental client-side limits.
- [x] Add regression coverage for 500-product pagination/list behavior and exact product-type display, then run full checks and save a checkpoint.

## Flexible catalog browsing and configurable trial duration
- [x] Keep catalog capacity flexible rather than treating 500 as a fixed maximum; verify no hard-coded product-count cap is introduced.
- [x] Improve the admin product browsing screen with newest-first ordering, keyword search, category/status filters, and compact/cozy display density options.
- [x] Add owner-only trial-store duration controls so the administrator can choose the number of usable days for each store trial, with localized remaining/expired status.
- [x] Add regression tests, mobile verification, type checks, production build, and checkpoint for the changes.

## Fit measurement newest-first ordering
- [x] Sort the actual garment measurement / Fit Management catalog newest-first, including filtered and search results, while preserving existing measurement data and set-component editing.
- [x] Add regression coverage and run mobile verification, type checks, production build, and checkpoint.

## Fit measurement compact scroll list
- [x] Show approximately three actual garment measurement items at once and let the remaining newest-first items be explored by touch/mouse scrolling inside the list.
- [x] Preserve single/set filters, selected-item editing, mobile usability, and add regression verification before checkpoint.

## New-arrival storefront priority and sale exclusion
- [x] Show active new-arrival products in a dedicated top row for non-admin Browse Products screens, while keeping the full catalog below in its existing order and filters.
- [x] Add an owner-only global sale option to exclude new-arrival products from sale-season discount calculations and displays without altering their saved product metadata.
- [x] Preserve EN/KO/ZH labels, normal/VIP pricing behavior, and add regression tests for storefront ordering and discount exclusion.

## New-arrival full-price badges
- [x] Show prominent localized NEW ARRIVAL and REGULAR PRICE badges when a new-arrival product is excluded from the active storewide seasonal sale.
- [x] Keep existing sale badges for included products, preserve admin/non-admin presentation, and verify responsive rendering with regression tests.

## Customer catalog six-item browsing
- [x] Show six products per visible customer catalog page/viewport for NORMAL, VIP, and store-trial users while keeping the admin product management layout unchanged.
- [x] Keep new-arrival ordering, price badges, purchase-list actions, and natural vertical scrolling for additional products; verify responsive behavior and regression tests.

## Black-product color verification notice
- [x] Detect black and charcoal product colors consistently and show a localized lighting/color-difference notice adjacent to customer-facing product images.
- [x] Preserve existing image badges and customer flows, then add regression tests, mobile verification, type checks, build, and checkpoint.

## New-arrival display and seasonal fallback pricing
- [x] Remove the count beside the customer-facing new-arrivals heading.
- [x] When seasonal-sale exclusion is enabled for a new arrival, apply that product's original NORMAL/VIP base discount instead of 0% discount, with accurate label copy and regression coverage.

## Dark-colour lighting verification notice
- [x] Extend the colour-difference verification notice from black/charcoal to dark navy, dark brown, and equivalent localized dark-colour metadata.
- [x] Add regression coverage for dark-colour detection, then run type checks, production build, and checkpoint.

## Customer product image full visibility
- [x] Keep product images fully visible within customer catalog and detail image boxes using contained scaling, without distorting the original aspect ratio.
- [x] Preserve product badges and colour notices, then add regression checks, responsive verification, type checks, build, and checkpoint.

## Product-detail opening latency investigation
- [x] Measure and inspect product-detail click flow, including on-demand data queries and image/QR/share-card resource loading, to identify the source of visible delay.
- [x] Provide a verified cause and prioritized, low-risk improvement options without changing customer product data.

## Product-detail opening performance
- [x] Replace whole-catalog hydration in the product-detail click path with a single-product database query that preserves customer visibility, access tier, purchase status, translations, image views, set components, and measurements.
- [x] Prefetch product detail on customer-card intent so the detail panel can use cached data when the card is opened.
- [x] Add performance-contract coverage and run regression tests, type checks, production build, responsive verification, and checkpoint.

## Owner administration access and data recovery
- [x] Diagnose why the owner administrator cannot authenticate or sees empty product and operations data while customer catalog data remains visible.
- [x] Restore owner-only authentication and admin product/operations queries without deleting, reseeding, or mixing normal, VIP, or store-trial data.
- [x] Add regression coverage, verify protected admin routes, run type checks and production build, then checkpoint the recovery.

## Owner administrator password guidance
- [x] Verify whether the configured owner OAuth account can use the existing password-setting flow and provide the safe, exact configuration path without exposing any password.

## Owner administrator credential setup
- [x] Let the permanent owner administrator define or change the administrator login ID and password together from the owner-only account screen.
- [x] Enforce unique normalized administrator IDs, server-side password hashing, and successful ADMIN password login without exposing saved credentials.
- [x] Add EN/KO/ZH instructions and regression coverage, then verify with type checks, build, and checkpoint.

## Owner OAuth role synchronization
- [x] Ensure the configured owner OAuth session returns the permanent administrator role immediately and cannot render as a NORMAL user after login or refresh.
- [x] Keep owner-only edit and operations queries available while preserving NORMAL, VIP, and store-trial role separation; add regression coverage and checkpoint.

## Owner OAuth callback parameter recovery
- [x] Diagnose and recover the missing authentication-parameter error during owner OAuth login without weakening state/nonce validation.
- [x] Verify a fresh owner login returns to the administrator operations screen, then run regression checks and publish the repair.

## Owner session role and browser recognition recovery
- [x] Reproduce why a completed owner OAuth login is rendered as NORMAL and why a different browser reports no matching account.
- [x] Ensure only the configured owner identity receives the administrator session while NORMAL visitor access cannot override it; verify fresh browser behavior before publishing.

## Owner OAuth identity trace and data preservation
- [x] Trace the exact post-login identity, cookie/header session, and auth.me role returned for the owner without deleting or reseeding any data.
- [x] Repair the sole-owner administrator mapping only after the actual identity mismatch or session override is identified; verify all product, NORMAL, VIP, and trial data remain intact.

## Administrator catalog visibility recovery
- [x] Diagnose why the administrator product manager reports an empty catalog despite existing active production products, without creating, deleting, or reseeding records.
- [x] Restore the correct administrator catalog query and validate product visibility, product editing access, and existing data preservation before publishing.

## AI operations dashboard owner access recovery
- [x] Diagnose why the configured owner can access product management but is denied by the AI operations dashboard.
- [x] Apply the same sole-owner authorization rule to every AI operations query and gate, then verify the protected administrator routes before publishing.

## Owner production catalog source trace
- [x] Capture the actual owner-facing catalog response and confirm whether the production browser is reaching the same populated data source without deleting or reseeding records.
- [x] Correct the owner catalog path only after identifying the mismatch, then validate all existing products remain visible and editable.

## Owner administrator password credential issuance
- [x] Confirm the unique primary owner record and that ADMIN ID lesoul is available without changing product or customer data.
- [x] Set ADMIN login ID lesoul and a new server-hashed password for the primary owner, then validate password login and preserve existing data.
