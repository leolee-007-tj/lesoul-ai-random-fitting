import { storageGetSignedUrl } from "./storage";
import type { BodyMeasurements, ProductImageViews } from "../shared/bodyMeasurements";
import { assessFit, type FitAssessment, type GarmentMeasurements, type StretchLevel } from "../shared/fitEngine";

export const CLOTHING_PRESERVATION_RULES = {
  mustPreserve: ["length", "width", "neckline", "sleeve", "color", "pattern", "fabric", "details"],
  canAdapt: ["pose_fit", "drape_on_body", "lighting_effect"],
  strictMode: true,
} as const;

export const CLOTHING_NEGATIVE_PROMPT = "Do not change clothing design, length, width, silhouette, neckline, sleeve length, fabric, color, pattern, buttons, seams, pleats, or any listed detail. Do not add or remove elements. Do not generate abstract, distorted, fictional, or substituted clothing.";

export type AdjustmentParams = {
  overallFit?: "looser" | "as_is" | "tighter";
  proportion?: "shorter_torso" | "as_is" | "longer_legs";
  lighting?: "darker" | "as_is" | "brighter";
  items?: Record<number, { length?: "shorter" | "as_is" | "longer"; width?: "narrower" | "as_is" | "wider"; color?: "muted" | "as_is" | "vibrant"; details?: "simpler" | "as_is" | "detailed" }>;
};

export type FashionGarment = {
  id: number;
  name: string;
  category: string;
  displayCategoryName?: string | null;
  baseCategory?: string | null;
  imageUrl: string;
  images?: string[] | null;
  imageViews?: ProductImageViews | null;
  description: string;
  color?: string | null;
  fabric?: string | null;
  texture?: string | null;
  fit?: string | null;
  length?: string | null;
  width?: string | null;
  details?: string | null;
  neckline?: string | null;
  sleeve?: string | null;
  garmentMeasurements?: GarmentMeasurements | null;
  stretchLevel?: StretchLevel;
};

const measurementLabels: Record<keyof GarmentMeasurements, string> = {
  shoulderCm: "shoulder",
  bustCm: "garment bust",
  waistCm: "garment waist",
  hipCm: "garment hip",
  sleeveCm: "sleeve",
  totalLengthCm: "total length",
  riseCm: "rise",
  thighCm: "thigh",
  inseamCm: "inseam",
};

function safeCentimeters(value: number | null | undefined, maximum = 300) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= maximum ? Math.round(value * 10) / 10 : null;
}

function formatGarmentMeasurements(measurements: GarmentMeasurements | null | undefined) {
  if (!measurements) return "";
  return (Object.entries(measurements) as Array<[keyof GarmentMeasurements, number | null | undefined]>).map(([key, value]) => {
    const centimeters = safeCentimeters(value);
    return centimeters ? `${measurementLabels[key]} ${centimeters}cm` : null;
  }).filter((value): value is string => Boolean(value)).join(", ");
}

function buildBodyProportionGuide(body: BodyMeasurements | undefined) {
  if (!body) return "";
  const values = [
    ["height", body.height], ["shoulder width", body.shoulderWidth], ["chest", body.chest], ["waist", body.waist], ["hip", body.hip], ["arm length", body.armLength], ["inseam", body.inseam], ["thigh", body.thigh],
  ].map(([label, value]) => {
    const centimeters = safeCentimeters(value as number | null | undefined);
    return centimeters ? `${label} ${centimeters}cm` : null;
  }).filter((value): value is string => Boolean(value));
  return values.length ? `BODY PROPORTION GUIDE: retain the supplied body scale (${values.join(", ")}). Use these values only as visual ratio anchors for torso, arms, waist, hips, and legs; never reshape the person or claim an exact physical fit.` : "";
}

function buildGarmentProportionGuide(clothing: FashionGarment[]) {
  const guidance = clothing.map((garment, index) => {
    const saved = formatGarmentMeasurements(garment.garmentMeasurements);
    if (!saved) return null;
    const placement = garment.category === "bottom"
      ? "Keep the waist, rise, thigh, inseam, and hem proportionate to the fixed hips and legs; preserve the intended leg break and full/cropped length."
      : garment.category === "top" || garment.category === "outer"
        ? "Keep shoulder position, sleeve reach, and hem length proportionate to the fixed torso and arms."
        : garment.category === "dress"
          ? "Keep shoulder, waist, hip, sleeve, and hem placement proportionate to the fixed torso and legs."
          : "Keep the recorded scale proportionate to the fixed body and scene.";
    return `PRODUCT PHYSICAL MEASUREMENTS ${index + 1} (${garment.name}): ${saved}. ${placement}`;
  }).filter((value): value is string => Boolean(value)).join("\n");
  return guidance ? `${guidance}\nPHYSICAL SCALE AUTHORITY: entered centimeter measurements are the fixed physical dimensions of this garment. The reference photo defines design, fabric, colour, pattern, and details only; its crop, camera distance, perspective, resolution, and apparent pixel size never define garment length or width. Do not lengthen, shorten, widen, narrow, or normalize a deliberately cropped, long, oversized, narrow, or unusual garment toward conventional fashion proportions.` : "";
}

function buildRelativePhysicalFitInstructions(body: BodyMeasurements | undefined, clothing: FashionGarment[]) {
  if (!body) return "";
  const height = safeCentimeters(body.height);
  return clothing.map((garment, index) => {
    const measurements = garment.garmentMeasurements;
    const totalLength = safeCentimeters(measurements?.totalLengthCm);
    const inseam = safeCentimeters(measurements?.inseamCm);
    if (garment.category === "bottom" && height && (totalLength || inseam)) {
      const length = totalLength ?? inseam!;
      const ratio = length / height;
      const appearance = ratio < 0.5 ? "intentionally cropped above the ankle" : ratio < 0.57 ? "a visibly shortened / 7/8-length trouser" : ratio > 0.66 ? "a deliberately long trouser" : "the intended regular trouser length";
      return `RELATIVE PHYSICAL FIT ${index + 1}: ${length}cm bottom on a ${height}cm model must read as ${appearance}. Preserve this measured hem placement; do not extend the hem merely because the product photo is close-cropped or aesthetically appears long.`;
    }
    if ((garment.category === "top" || garment.category === "outer" || garment.category === "dress") && height && totalLength) {
      const ratio = totalLength / height;
      const appearance = ratio < 0.31 ? "clearly cropped" : ratio > 0.52 ? "intentionally long" : "the intended regular length";
      return `RELATIVE PHYSICAL FIT ${index + 1}: ${totalLength}cm ${garment.category} on a ${height}cm model must read as ${appearance}. Keep the measured hem position and do not turn it into a conventional length.`;
    }
    return `RELATIVE PHYSICAL FIT ${index + 1}: preserve the recorded garment dimensions against the fixed body dimensions; do not use the apparent scale of the reference photo as a fit input.`;
  }).join("\n");
}

export type FashionLookRequest = {
  generationMode?: "AI_FITTING" | "QUICK_FIT";
  displayStyle?: "studio_flat_lay" | "editorial_flat_lay" | "hanger_display" | "ghost_fit";
  userImage: string;
  pose: { id: number; name: string; promptKeyword: string };
  clothing: FashionGarment[];
  background: { id: number; name: string; promptKeyword: string };
  style: string;
  adjustments?: AdjustmentParams;
  bodyMeasurements?: BodyMeasurements;
  modelReference?: { imageUrl: string; modelKey: string; version: number; appearance?: { hairLength: string; hairStyle: string; hairColor: string; skinTone: string } } | null;
};

export type FashionLookResponse = {
  generatedImage: string;
  generationStatus: "completed" | "processing" | "failed";
  provider: "mock" | "external";
  metadata: { pose: string; background: string; style: string; clothingCount: number; generatedAt: string; preservationPrompt: string; negativePrompt: string };
};

export function describeGarmentForGeneration(garment: FashionGarment) {
  const attributes = [
    garment.fabric ? `${garment.fabric} fabric` : null,
    garment.texture ? `${garment.texture} texture` : null,
    garment.fit ? `${garment.fit} fit` : null,
    garment.length ? `${garment.length} length` : null,
    garment.width ? `${garment.width} width silhouette` : null,
  ].filter(Boolean).join(", ");
  const construction = [garment.details, garment.neckline ? `${garment.neckline} neckline` : null, garment.sleeve ? `${garment.sleeve} sleeves` : null].filter(Boolean).join(". ");
  const views = garment.imageViews;
  const references = [
    views?.front?.original && `Front construction reference: ${views.front.original}`,
    views?.back?.original && `Back construction reference: ${views.back.original}`,
    ...(views?.detail ?? []).map((asset, index) => `Important detail reference ${index + 1}: ${asset.original}`),
  ].filter(Boolean).join(". ");
  const categoryContext = garment.displayCategoryName ? `Customer display category: ${garment.displayCategoryName}. Stable Base Category: ${garment.baseCategory ?? garment.category.toUpperCase()}.` : `Stable Base Category: ${garment.baseCategory ?? garment.category.toUpperCase()}.`;
  return `Wearing ${garment.name}${garment.color ? ` in ${garment.color}` : ""}: ${attributes || garment.description}. ${categoryContext} Features ${construction || garment.description}. ${references || `Reference clothing image: ${(garment.images?.[0] ?? garment.imageUrl)}`}. Treat every supplied view as the same garment, not separate garments.`;
}

export function buildClothingPreservationPrompt(request: FashionLookRequest) {
  const garmentDescriptions = request.clothing.map(describeGarmentForGeneration).join("\n");
  const adjustmentNote = request.adjustments ? `Permitted refinement request: ${JSON.stringify(request.adjustments)}. Preserve all identity-defining garment specifications unless this request explicitly changes a visual rendering nuance.` : "";
  const measurements = request.bodyMeasurements ? `Fixed body measurements: Height ${request.bodyMeasurements.height}cm, Shoulder width ${request.bodyMeasurements.shoulderWidth}cm, Chest ${request.bodyMeasurements.chest ?? "not provided"}cm, Waist ${request.bodyMeasurements.waist ?? "not provided"}cm, Hip ${request.bodyMeasurements.hip ?? "not provided"}cm. Maintain this original body volume and proportions; never slim, reshape, or shrink the body to make a garment fit.` : "";
  const bodyProportionGuide = buildBodyProportionGuide(request.bodyMeasurements);
  const garmentProportionGuide = buildGarmentProportionGuide(request.clothing);
  const relativePhysicalFit = buildRelativePhysicalFitInstructions(request.bodyMeasurements, request.clothing);
  const fitNotes = request.bodyMeasurements ? request.clothing.map((garment) => assessFit({ bustCm: request.bodyMeasurements!.chest, waistCm: request.bodyMeasurements!.waist, hipCm: request.bodyMeasurements!.hip, shoulderCm: request.bodyMeasurements!.shoulderWidth }, garment.garmentMeasurements, garment.category, garment.stretchLevel ?? "low", garment.fit ?? "regular")).map((fit, index) => `Garment ${index + 1} Fit Engine: ${fit.status}. ${fit.visualInstruction}`).join("\n") : "";
  const identity = request.modelReference ? `Base model reference is supplied as the first image. Character lock: keep the same generated woman, facial geometry, ${request.modelReference.appearance?.hairLength ?? ""} ${request.modelReference.appearance?.hairStyle ?? ""} hair, ${request.modelReference.appearance?.hairColor ?? ""} hair color, ${request.modelReference.appearance?.skinTone ?? ""} skin tone, and fixed body proportions from ${request.modelReference.modelKey} v${request.modelReference.version}. Only clothing, pose, and scene may change.` : "";
  const garmentLocks = request.clothing.map((garment, index) => `GARMENT LOCK ${index + 1}: ${garment.displayCategoryName ?? garment.category.toUpperCase()} [BASE CATEGORY: ${garment.baseCategory ?? garment.category.toUpperCase()}] — ${garment.name}. This exact selected item must be visible as its correct layer; do not omit, replace, recolor, crop away, or substitute it.${garment.category === "bottom" ? " Bottom/denim lock: preserve the supplied waist, rise, leg width, inseam, wash, pockets, hem, and silhouette exactly." : ""}`).join("\n");
  return `A photorealistic fashion editorial of a person wearing EXACTLY these selected LESOUL products:\n${garmentDescriptions}\n${garmentLocks}\nPOSE LOCK — non-negotiable: reproduce the selected pose exactly: ${request.pose.name} — ${request.pose.promptKeyword}. Do not substitute a standing pose, crop the pose, or alter the intended body orientation.\nBACKGROUND LOCK — non-negotiable: render the selected background scene: ${request.background.name} — ${request.background.promptKeyword}. Do not replace it with a studio, blank backdrop, unrelated street, or generic scene.\n${identity}\n${measurements}\n${bodyProportionGuide}\n${garmentProportionGuide}\n${relativePhysicalFit}\n${fitNotes}\nABSOLUTE PHYSICAL FIT RULE: BODY MEASUREMENTS are fixed. PRODUCT MEASUREMENTS are fixed. PHOTO SCALE IS NOT PHYSICAL SCALE. Fit appearance must result from these two fixed physical inputs. Never reshape the body to make an item fit, and never alter the garment dimensions to make the outfit conventionally flattering.\nCRITICAL REFERENCE COMPLIANCE: every selected garment must remain visually identifiable from its supplied reference images, especially the selected bottom or denim. Clothing must look identical to the referenced product images. Preserve fabric texture, length, width, neckline, sleeves, color, pattern, buttons, seams, and construction details. ${adjustmentNote}\n${CLOTHING_NEGATIVE_PROMPT}`;
}

export function buildQuickFitPreservationPrompt(request: FashionLookRequest) {
  const garmentDescriptions = request.clothing.map(describeGarmentForGeneration).join("\n");
  const displayStyle = request.displayStyle ?? "studio_flat_lay";
  const displayInstruction = { studio_flat_lay: "Clean warm-white studio flat lay on a floor or table with soft realistic shadows.", editorial_flat_lay: "A refined magazine editorial flat lay with restrained composition and soft premium styling props only.", hanger_display: "A clean boutique hanger and display arrangement. Garments may hang but no human mannequin or body may appear.", ghost_fit: "An invisible-form garment arrangement that suggests a complete outfit while showing no mannequin, body, head, hands, or person." }[displayStyle];
  return `Create one premium LESOUL product editorial for this complete outfit using only the supplied real product reference images.\n${garmentDescriptions}\nDisplay style: ${displayStyle}. ${displayInstruction}\nArrange top and bottom as one coherent outfit; a dress may stand alone. Outerwear, bag, and shoes are optional accessories. NO PERSON, NO HUMAN, NO FACE, NO HANDS, NO BODY, NO AI MODEL, NO MANNEQUIN. The products are the only subject.\nCRITICAL PRODUCT PRESERVATION: retain every referenced product's exact color, pattern, fabric appearance, neckline, sleeves, buttons, pockets, length, width, silhouette, waist design, hem, seams, and major construction details. Do not invent, redesign, replace, merge, distort, or add garments. ${CLOTHING_NEGATIVE_PROMPT}`;
}

export interface FashionProvider {
  generateFashionLook(request: FashionLookRequest): Promise<FashionLookResponse>;
}

export const IMAGE_PROVIDER_TIMEOUT_MS = 45_000;
export const QUICK_FIT_IMAGE_PROVIDER_TIMEOUT_MS = 90_000;
export const AI_FITTING_IMAGE_PROVIDER_TIMEOUT_MS = 150_000;

async function withImageProviderTimeout<T>(operation: Promise<T>, timeoutMs = IMAGE_PROVIDER_TIMEOUT_MS): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => { timeout = setTimeout(() => reject(new Error("IMAGE_PROVIDER_TIMEOUT")), timeoutMs); }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function referenceMimeType(source: string) {
  if (source.startsWith("data:image/png") || /\.png(?:\?|$)/i.test(source)) return "image/png";
  if (source.startsWith("data:image/webp") || /\.webp(?:\?|$)/i.test(source)) return "image/webp";
  return "image/jpeg";
}

export function resolveImageReferenceMimeType(contentType: string | null, source: string) {
  const reported = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  return reported && /^image\/(jpeg|png|webp)$/.test(reported) ? reported : referenceMimeType(source);
}

async function imageReference(source: string) {
  const match = source.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (match) return { b64Json: match[2], mimeType: match[1] };
  if (source.startsWith("/manus-storage/")) {
    return { url: await storageGetSignedUrl(source.slice("/manus-storage/".length)), mimeType: referenceMimeType(source) };
  }
  return { url: source, mimeType: referenceMimeType(source) };
}

export async function embeddedImageReference(source: string) {
  const match = source.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (match) return { b64Json: match[2], mimeType: match[1] };
  const url = source.startsWith("/manus-storage/")
    ? await storageGetSignedUrl(source.slice("/manus-storage/".length))
    : source;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`IMAGE_REFERENCE_FETCH_FAILED:${response.status}`);
  const mimeType = resolveImageReferenceMimeType(response.headers.get("content-type"), source);
  if (!/^image\/(jpeg|png|webp)$/.test(mimeType)) throw new Error(`IMAGE_REFERENCE_INVALID_MIME:${mimeType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.byteLength || bytes.byteLength > 8 * 1024 * 1024) throw new Error("IMAGE_REFERENCE_INVALID_SIZE");
  return { b64Json: bytes.toString("base64"), mimeType };
}

/** One valid front view per selected item avoids remote URL-fetch failures and keeps the provider request below multi-view reference limits. */
export function selectPrimaryProductReferenceUrls(clothing: FashionGarment[]) {
  return Array.from(new Set(clothing.map((garment) => garment.imageViews?.front?.original || garment.imageUrl).filter((source): source is string => typeof source === "string" && source.length > 0))).slice(0, 4);
}

export const selectQuickFitReferenceUrls = selectPrimaryProductReferenceUrls;

function responseMetadata(request: FashionLookRequest, preservationPrompt: string) {
  return { pose: request.pose.name, background: request.background.name, style: request.style, clothingCount: request.clothing.length, generatedAt: new Date().toISOString(), preservationPrompt, negativePrompt: CLOTHING_NEGATIVE_PROMPT };
}

/**
 * UI-safe provider used for this personal MVP. It preserves the uploaded image
 * while returning the same contract an external virtual try-on provider will use.
 */
export class MockFashionProvider implements FashionProvider {
  async generateFashionLook(request: FashionLookRequest): Promise<FashionLookResponse> {
    const preservationPrompt = buildClothingPreservationPrompt(request);
    return {
      generatedImage: request.userImage,
      generationStatus: "completed",
      provider: "mock",
      metadata: responseMetadata(request, preservationPrompt),
    };
  }
}

export class InternalImageFashionProvider implements FashionProvider {
  async generateFashionLook(_request: FashionLookRequest): Promise<FashionLookResponse> {
    throw new Error("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
  }
}

export async function generateQuickFitEditorial(_request: FashionLookRequest): Promise<FashionLookResponse> {
  throw new Error("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
}

let provider: FashionProvider = new InternalImageFashionProvider();

export function setFashionProvider(nextProvider: FashionProvider) {
  provider = nextProvider;
}

export function generateFashionLook(request: FashionLookRequest) {
  return provider.generateFashionLook(request);
}
