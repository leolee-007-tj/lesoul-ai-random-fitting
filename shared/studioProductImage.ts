export type StudioProductView = "front" | "back";

export function buildStudioProductImagePrompt(view: StudioProductView): string {
  const viewLabel = view === "front" ? "front" : "back";
  return `Edit the supplied ${viewLabel}-view garment product photograph. Keep the uploaded image's exact framing, camera angle, garment orientation, scale, placement, and full-length crop unchanged. Change only the hanger and visible background: remove the hanger and replace the entire background with a flat, solid, pure white (#FFFFFF) backdrop. Preserve the exact garment without reinterpretation: original silhouette, proportions, material texture, weave, color, print, logo, labels, buttons, pockets, seams, neckline, sleeves, hem, and design details. Do not add a person, mannequin, body, jewelry, another garment, text, watermark, branding, floor, props, gradient, lighting effect, retouching style, or any shadow. This must look like the uploaded front/back product photograph with only a clean plain white background, not a staged studio photograph.`;
}

export function hasStudioSourceImage(url: string | null | undefined, placeholderUrl: string): boolean {
  return Boolean(url?.trim() && url !== placeholderUrl);
}
