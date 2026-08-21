import { invokeLLM } from "./_core/llm";
import { embeddedImageReference } from "./fashionProvider";
import type { StudioProductView } from "../shared/studioProductImage";
import { normaliseStudioImageQuality, type StudioImageQuality } from "../shared/studioProductQuality";

function dataUrl(reference: { b64Json: string; mimeType?: string }) {
  return `data:${reference.mimeType ?? "image/jpeg"};base64,${reference.b64Json}`;
}

/** Returns a conservative warning, never a silent pass, if an automated visual check cannot finish. */
export async function assessStudioProductImageQuality(input: { view: StudioProductView; sourceUrl: string; resultUrl: string }): Promise<StudioImageQuality> {
  try {
    const [source, result] = await Promise.all([embeddedImageReference(input.sourceUrl), embeddedImageReference(input.resultUrl)]);
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are a strict fashion-commerce image quality inspector. Compare the ORIGINAL product photo and its EDITED white-background result. Assess only visible evidence. Flag a warning if the background is not a flat clean white, the garment's silhouette/material/color/logo/print/seams/details changed, framing or crop changed, or visible artifacts/incomplete hanger removal remain. Do not invent defects. Return only the required JSON." },
        { role: "user", content: [
          { type: "text", text: `View: ${input.view}. Image 1 is the ORIGINAL. Image 2 is the EDITED RESULT.` },
          { type: "image_url", image_url: { url: dataUrl(source), detail: "high" } },
          { type: "image_url", image_url: { url: dataUrl(result), detail: "high" } },
        ] },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "studio_product_image_quality",
          strict: true,
          schema: {
            type: "object",
            properties: {
              confidence: { type: "integer", minimum: 0, maximum: 100 },
              warningCodes: { type: "array", items: { type: "string", enum: ["BACKGROUND_NOT_PURE_WHITE", "GARMENT_DETAILS_CHANGED", "FRAMING_CHANGED", "OUTPUT_ARTIFACTS"] }, maxItems: 4 },
            },
            required: ["confidence", "warningCodes"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices[0]?.message.content;
    if (typeof content !== "string") throw new Error("STUDIO_QUALITY_EMPTY_RESPONSE");
    return normaliseStudioImageQuality(JSON.parse(content));
  } catch (error) {
    console.warn("[StudioProductImage] Automated quality assessment unavailable", error instanceof Error ? error.message : error);
    return normaliseStudioImageQuality({ confidence: 0, warningCodes: ["ASSESSMENT_UNAVAILABLE"] });
  }
}
