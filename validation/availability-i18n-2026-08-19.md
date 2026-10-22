# Product Availability and i18n Validation

Mobile route captures for `/`, `/catalog`, and `/style-match` rendered without client-side exceptions after the availability migration. The public API returned 16 current `IN_STOCK` records across the catalog and Style Match server list, confirming that both customer paths consume the migrated standard status correctly.

The landing page retains its quiet-luxury hierarchy while exposing AI Style Match and product browsing to a normal visitor. Full-page captures can record initial loading placeholders before asynchronous catalog cards resolve; direct server API verification and automated tests cover the loaded data contract.
