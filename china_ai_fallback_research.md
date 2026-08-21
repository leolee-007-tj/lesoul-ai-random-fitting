# China-Domestic AI Fallback Research

## Alibaba Cloud Model Studio / Qwen Image Edit

Source: <https://www.alibabacloud.com/help/en/model-studio/qwen-image-edit-api> (accessed 2026-08-21).

Alibaba's Qwen Image Edit API supports image editing with one to three supplied images plus one textual instruction. It accepts public HTTPS URLs or Base64 source images, supports JPG, JPEG, PNG, BMP, TIFF, WEBP, and GIF input, and documents a 10 MB input limit. Its `qwen-image-2.0` family supports customized output sizing and one to six output images; the documentation lists natural-language object removal, detail enhancement, multi-image input/output, and edit operations.

For China-local operation, the documentation identifies a Beijing endpoint of the form `https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/...`; Beijing and Singapore use separate endpoints and API keys. Responses contain temporary image URLs that are retained for only 24 hours, so LESOUL must download and persist accepted or reviewable output to its own storage before URL expiry.

This makes Qwen Image Edit a technically plausible secondary provider for LESOUL's white-background image-edit flow. It requires a Model Studio workspace, a China-region API key, and controlled integration testing against real front/back merchandise images before automatic fallback is enabled.

## Alibaba Qwen Image Generation and Editing 3.0

Source: <https://www.alibabacloud.com/help/en/model-studio/qwen-image-generation-and-editing-api-reference> (accessed 2026-08-21).

Qwen Image Generation and Editing 3.0 documents text-to-image and image-to-image editing with one to three reference images and an instruction. The cited documentation says this model is in limited preview and requires access application through the Model Gallery. It also documents the same China (Beijing) / Singapore endpoint and API-key separation, an input image best-practice range of 384–2048 pixels per dimension, and a 10 MB file limit.

For LESOUL, this is a candidate only after access approval. Its public documentation does not itself certify garment-fidelity or background-removal quality for retail catalog use, so it must be benchmarked with the same original-versus-result approval workflow already implemented in the app.

## Alibaba Qwen-MT for administrator text translation

Source: <https://www.alibabacloud.com/help/en/model-studio/machine-translation> (accessed 2026-08-21).

Qwen-MT is a dedicated translation model that documents automatic source detection through `source_lang: "auto"`, supports Chinese, English, and Korean among its documented languages, and exposes an OpenAI-compatible endpoint. Its documentation identifies `qwen-mt-flash` as appropriate for website and product-description use, and supports a glossary/term-intervention feature that could protect the LESOUL brand name, style labels, and garment terminology. This is a strong candidate for the existing automatic EN/KO/ZH administrator-copy translation fallback.

## Baidu Qianfan for text / reasoning fallback

Sources: <https://intl.cloud.baidu.com/doc/qianfan/index.html> and <https://intl.cloud.baidu.com/en/product/qianfan.html> (accessed 2026-08-21).

Baidu's Qianfan documentation describes API-key authentication, a unified REST interface at `https://api.baiduqianfan.ai/v1/chat/completions`, and OpenAI-compatible SDK use for text/model calls. Its public product page describes text and multimodal model access through a unified API. This makes Qianfan a plausible secondary fallback for text translation, metadata extraction, and recommendation-copy tasks. The reviewed English documentation does not establish an image-edit endpoint that meets LESOUL's merchandise-fidelity requirement, so it should not be selected as the primary product-image-edit fallback without an additional API and quality validation.

## Recommended LESOUL fallback architecture

### Provider roles

| Capability | Current provider | China-domestic primary fallback | Secondary fallback | Adoption rule |
| --- | --- | --- | --- | --- |
| Product white-background image edit | Manus internal ImageService / GPT Image 2 | Alibaba Model Studio Beijing Qwen Image Edit | None until quality benchmarked | Always require the existing original-versus-result review and administrator approval. |
| EN/KO/ZH administrator-copy translation | Manus internal LLM | Alibaba Qwen-MT Flash in Beijing | Baidu Qianfan text model | Preserve source text, translate explicitly into the two other locales, and return a clear failure rather than silently replacing content. |
| Product/recommendation metadata or copy | Manus internal LLM | Baidu Qianfan or Qwen text model | Alternate approved text provider | Validate JSON schema and preserve existing customer data on any failure. |

### Adapter and fallback policy

LESOUL should introduce a small server-only `AiProvider` adapter with separate `editProductImage` and `translateCustomerText` contracts. The Product Manager and existing product-image review page must call only this adapter, never a provider SDK directly. Provider settings should distinguish `FORGE`, `QWEN_BEIJING`, and `AUTO` modes for image and text workloads separately.

In `AUTO` mode, use the configured primary provider first and fall back only for transport failures, timeouts, explicit rate-limit responses, or provider 5xx responses. Do not fall back for a content-safety rejection, an invalid source image, prompt validation failure, or an administrator's quality rejection. Every generated image should retain provider and request metadata in the admin audit record; image outputs must still pass the current side-by-side review and final approval gate.

### Operational prerequisites before activation

The initial build should leave Chinese-provider fallback disabled. Activation requires a China-region Alibaba Model Studio workspace and key, the correct Beijing workspace endpoint, and a managed secret entry. Qwen generated-image URLs are temporary according to the documentation, so the adapter must download generated output to LESOUL-controlled storage immediately before presenting it for approval. A 10–20 SKU benchmark spanning dark/light garments, logos, prints, fine textures, and front/back images should be approved by the owner before `AUTO` fallback is enabled.

Replacing an AI API does not itself guarantee that the whole public website will be reachable or fast from mainland China. Site hosting, domain, CDN, and any mainland-hosting registration requirements should be evaluated separately with the chosen China cloud/CDN provider before a China-local launch.
