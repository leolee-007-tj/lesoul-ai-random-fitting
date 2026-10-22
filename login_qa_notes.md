# Login QA — 2026-09-01

The mobile preview was opened at 390px width. The credential-free NORMAL action navigated from `/login` to `/` after the guest login mutation, and the home screen remained available after a refresh. When the already-authenticated browser navigated to `/login`, the new Login guard immediately routed back to the customer home screen instead of rendering the login form. The preview service was restarted once after a temporary sleep state. No new browser-console error was observed in the checked logs.
