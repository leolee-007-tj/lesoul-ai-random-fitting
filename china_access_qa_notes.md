# China iPhone access QA

- Checked published domain: `https://lesoulai-xabhv8qd.manus.space/` on 2026-09-01.
- DNS resolved to Cloudflare IPv4 `104.19.168.112` / `104.19.169.112` and IPv6 addresses from the sandbox vantage point.
- HTTPS returned `200`, `content-type: text/html`, HSTS enabled, and the HTML shell was 369,322 bytes.
- Browser navigation loaded the LESOUL LOOK home shell and the app completed its initial loading in the sandbox browser.
- The initial HTML had render-blocking Google Fonts links to `fonts.googleapis.com` and `fonts.gstatic.com`. These hosts may be unreachable on some China networks. The app also has a deferred analytics script, which should not block first paint.
- Sandbox checks cannot prove reachability from every Chinese carrier or province. A local China Mobile/China Unicom/China Telecom iPhone check remains necessary for carrier-specific DNS or routing blocks.
- Applied compatibility mitigation: removed render-blocking external Google Fonts and switched EN/KO/ZH typography to iOS/system CJK fallbacks; app APIs and static assets remain on the published domain.
- After the change, TypeScript checks, 93 test files / 274 tests, and the production build passed. The preview home rendered at 390px with no browser console output.
- The published domain still returns HTTP 200 for HTML, JS, CSS, manifest, and the branding API from the sandbox/Singapore vantage point. This does not prove every mainland China carrier can reach the Cloudflare-backed `manus.space` domain.
