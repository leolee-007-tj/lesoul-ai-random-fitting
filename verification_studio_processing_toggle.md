# Pure-white studio processing switch verification

Migration `0039_far_mephistopheles.sql` adds `releaseSettings.studioImageProcessingEnabled` as a non-null integer with a default value of `1`. The active settings row was verified at `1`, so the existing pure-white workflow remains available immediately after release.

The Product Manager requests the owner release configuration and renders the AI plain-white cleanup section only when `studioImageProcessingEnabled === 1`. Turning the switch off in Release Control removes that menu, its generation button, image comparison, review checklist, regeneration controls, and approval actions from the product editor. The server independently rejects any stale or direct processing request with `STUDIO_IMAGE_PROCESSING_DISABLED`, so hidden controls cannot be bypassed.
