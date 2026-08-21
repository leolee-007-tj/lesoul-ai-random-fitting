# Share Card and WeChat Referral Verification

- **2026-08-21:** The WeChat-attributed catalog URL resolved through the current owner session; role-based routing correctly retained the owner in Operations rather than exposing the customer catalog.
- **2026-08-21:** The 390px Operations screenshot rendered the new **WECHAT SHARE VISITS** card in the operations stack, with a total counter and the localized empty state. It appeared above the VIP account manager and below the AI provider configuration without layout overlap.
- The browser state contained no attributed product visit at verification time, so the panel correctly showed zero rather than seeded or fabricated analytics data.
- Automated coverage confirmed the share URL source parameter, card price formatting, daily unique schema, public tracking mutation, and owner-only aggregation procedure.
