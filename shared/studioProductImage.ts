export type StudioProductView = "front" | "back";
export const colorCorrectionStrengths = ["off", "subtle", "standard", "strong"] as const;
export type ColorCorrectionStrength = (typeof colorCorrectionStrengths)[number];

export function buildStudioProductImagePrompt(view: StudioProductView, colorCorrectionStrength: ColorCorrectionStrength = "standard"): string {
  const viewLabel = view === "front" ? "front" : "back";
  const colorInstruction = colorCorrectionStrength === "off"
    ? "Do not change white balance, exposure, hue, saturation, contrast, print inks, or any garment color information."
    : colorCorrectionStrength === "subtle"
      ? "Apply only a very subtle neutralization of obvious warm/cool white-balance cast. Do not adjust exposure unless strictly necessary. Preserve the intended garment hue, saturation, contrast, print inks, and material appearance."
      : colorCorrectionStrength === "strong"
        ? "More firmly neutralize obvious warm/cool white-balance cast and noticeable exposure bias caused by source lighting, but do not creatively recolor or retouch the garment. Preserve the intended garment hue, saturation, contrast, print inks, and material appearance."
        : "Conservatively neutralize only obvious warm/cool white-balance casts and minor exposure bias caused by the source lighting. Preserve the intended garment hue, saturation, contrast, print inks, and material appearance; do not creatively recolor or retouch the garment.";
  return `Edit the supplied ${viewLabel}-view garment product photograph. Keep the uploaded image's exact framing, camera angle, garment orientation, scale, placement, and full-length crop unchanged. Change only the hanger and visible background: remove the hanger and replace the entire background with a flat, solid, pure white (#FFFFFF) backdrop. ${colorInstruction} Preserve the exact garment without reinterpretation: original silhouette, proportions, material texture, weave, color, print, logo, labels, buttons, pockets, seams, neckline, sleeves, hem, and design details. Do not add a person, mannequin, body, jewelry, another garment, text, watermark, branding, floor, props, gradient, lighting effect, retouching style, or any shadow. This must look like the uploaded front/back product photograph with only a clean plain white background, not a staged studio photograph.`;
}

export function hasStudioSourceImage(url: string | null | undefined, placeholderUrl: string): boolean {
  return Boolean(url?.trim() && url !== placeholderUrl);
}
