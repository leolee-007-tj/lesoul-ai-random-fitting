export type StudioProductView = "front" | "back";

export function buildStudioProductImagePrompt(view: StudioProductView): string {
  const viewLabel = view === "front" ? "front" : "back";
  return `Edit the supplied ${viewLabel}-view garment product photograph for premium e-commerce use. Remove only the hanger and existing background. Preserve the exact garment without reinterpretation: original silhouette, proportions, full length, viewing angle, material texture, weave, color, print, logo, labels, buttons, pockets, seams, neckline, sleeves, hem, and design details. Do not add a person, mannequin, body, jewelry, another garment, text, watermark, or branding. Center the fully visible garment on a clean pure-white seamless studio background with a very soft natural grounding shadow. High-fidelity photorealistic fashion catalog photography.`;
}

export function hasStudioSourceImage(url: string | null | undefined, placeholderUrl: string): boolean {
  return Boolean(url?.trim() && url !== placeholderUrl);
}
