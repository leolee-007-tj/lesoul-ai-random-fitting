# WeChat Moments Beta Integration Notes

## Verified constraints

WeChat website login requires an approved Weixin Open Platform website application, an AppID and AppSecret, and an authorized redirect domain. The documented website login flow uses `snsapi_login` and server-side authorization-code exchange; secrets and user tokens must remain server-side. [WeChat Website Login Guide](https://developers.weixin.qq.com/doc/oplatform/en/Website_App/WeChat_Login/Wechat_Login)

The WeChat JS-SDK requires an eligible service account, a verified JS security domain, and server-side signature generation for the exact page URL. Its current share-data APIs can set data for the official WeChat share menu, but a normal web button must not claim to force a Moments share. The product should therefore retain honest fallback actions: **Save Image** and **Copy Share Text**. [WeChat JS-SDK Guide](https://developers.weixin.qq.com/doc/service/en/guide/h5/jssdk.html)

## Current project decision

There is no configured WeChat connector or supplied WeChat credential in this task. The initial Beta implementation must therefore be WeChat-browser friendly without calling WeChat OAuth or JS-SDK APIs: mobile-safe upload controls, Chinese sharing copy, saved-result image download, and copied text. A separate WeChat OAuth/JS-SDK release can be enabled only after the owner supplies an approved AppID, AppSecret, official-account/service-account details, and verified production domain.

## Access-layer direction

The LESOUL Core should receive only an access decision and visible product list. `PRIVATE`, `BETA_PUBLIC`, and `REDEEM_CODE` policies belong in a separate entitlement service that returns `allow`/`deny`, a catalog tier, and remaining generation allowance.
