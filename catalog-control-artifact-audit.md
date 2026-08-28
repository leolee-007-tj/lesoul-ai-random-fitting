# Catalog Card Control Artifact Audit

The supplied tablet screenshot showed grey semicircle-like marks under some customer catalog images. The card renderer and status-badge renderer contain no such image-edge controls. A matching uploaded original product image was inspected and contained no grey semicircle artifact.

Customer catalog rendering had preferred the legacy `studioCut` derivative before the approved uploaded original. Since some legacy derivatives may contain visual remnants, customer product cards and details now prefer `imageViews.front.original`; a studio cut remains an explicit fallback only when the original URL is unavailable.
