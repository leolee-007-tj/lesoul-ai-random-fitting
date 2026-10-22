# China Mainland AI Composition API Research

Research date: 2026-08-17

## Recommended order for LESOUL

| Priority | Provider / capability | Why it fits LESOUL | Integration impact |
|---|---|---|---|
| 1 | Alibaba Cloud Model Studio `aitryon` / `aitryon-plus` (OutfitAnyone) | Purpose-built virtual try-on. Accepts a public full-body model image plus top/bottom/dress garment images, can preserve face, and supports separate image segmentation/finishing helpers. | Replace `InternalImageFashionProvider` with asynchronous task submit + polling. Store returned result in the existing S3 flow because source result URLs expire. |
| 2 | Volcengine Image Outfit V2 | Better choice where the product needs more varied model poses or both top and bottom in one request. Official docs describe support for full/half/portrait people, complex pose, and upper+lower inputs in V2. | Add signed Volcengine request adapter and image-output persistence; account for documented per-call billing and low initial concurrency. |
| 3 | Tencent Hunyuan `ChangeClothes` | Straightforward cloud API for a model image plus one garment image, with Node SDK support. Useful when Tencent Cloud / COS / WeChat stack is already selected. | Add TC3 request signing or Tencent Node SDK. Map each call to upper, lower, or dress; persist temporary URL output immediately. |
| 4 | Baidu Qianfan generic image generation | Useful as a creative editorial fallback, but not the first choice for strict garment shape preservation because the official generic API is not a purpose-built try-on contract. | Keep only as an optional image-to-image fallback adapter. |

## Key implementation constraints

- Alibaba `aitryon` documentation specifies China Mainland (Beijing) credentials, public HTTP/HTTPS image URLs, an asynchronous task lifecycle, and a 24-hour result URL. It supports upper, lower, dress, and upper/lower combinations.
- Tencent `ChangeClothes` accepts a model URL and one clothing URL, categorised as upper-body, lower-body, or dress. It returns either base64 or a URL with a one-hour validity period; its default output adds an AI-generated-image mark unless configured otherwise.
- Volcengine Outfit V2 can accept upper and lower garments together. Its product page lists 200 free trial calls, a listed price of RMB 1 per call, and one concurrent task; confirm commercial terms in console before launch.
- The production China path should move user-uploaded images and generated outputs to Chinese object storage/CDN and use a China-hosted API server. Do not send client-side API keys.

## Official sources

1. Alibaba Cloud Model Studio, AI Try-on base API: https://help.aliyun.com/zh/model-studio/outfitanyone-api
2. Alibaba Cloud Model Studio, OutfitAnyone overview: https://www.alibabacloud.com/help/zh/model-studio/outfitanyone/
3. Tencent Cloud Hunyuan Image, ChangeClothes API: https://cloud.tencent.com/document/product/1668/108532
4. Volcengine Image Outfit product overview: https://www.volcengine.com/docs/86081/1660170
5. Baidu Qianfan generic image generation API: https://cloud.baidu.com/doc/qianfan-api/s/8m7u6un8a
