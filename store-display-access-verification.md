# Store Display Access Verification

## Browser check

On 2026-08-28, a normal browser-bound customer session attempted to open both `/store-display` and `/camera-greeting` directly. Both routes redirected to the regular customer home instead of exposing the large display catalogue, camera permission prompt, sound configuration, or visitor alert.

## Intended separation

Only an active `store_display` password session may access `/store-display`, `catalog.storeDisplayProducts`, and `catalog.presenceAlertConfig`. The display surface omits purchase-list controls, customer profile, VIP early access, curation, and administration.
