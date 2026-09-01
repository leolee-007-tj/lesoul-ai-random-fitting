import { useEffect, useRef, useState } from "react";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";

type NormalizedProductImageProps = {
  src: string;
  alt: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  className?: string;
  imageClassName?: string;
};

type AutoMarginNormalization = {
  scale: number;
  originX: number;
  originY: number;
};

const DEFAULT_NORMALIZATION: AutoMarginNormalization = { scale: 1, originX: 50, originY: 50 };
const WHITE_BACKGROUND_THRESHOLD = 245;
const MIN_FOREGROUND_COVERAGE = 0.002;
const MAX_FOREGROUND_COVERAGE = 0.94;
const EDGE_PADDING_RATIO = 0.045;
const MAX_AUTO_SCALE = 1.42;

export type WhiteMarginBoundsInput = {
  sampleWidth: number;
  sampleHeight: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  foregroundPixels: number;
};

export const PRODUCT_IMAGE_SURFACE_CLASS = "bg-white";

export function getContainedImageScale(catalogDisplay?: NormalizedProductImageProps["catalogDisplay"]) {
  const requestedScale = catalogDisplay?.effectiveScale ?? catalogDisplay?.manualScale ?? 1;
  return Math.min(requestedScale, 0.94);
}

export function getProductImageVisibilityClass(isLoaded: boolean, hasError: boolean) {
  return isLoaded && !hasError ? "opacity-100" : "opacity-0";
}

function isBackgroundPixel(data: Uint8ClampedArray, index: number) {
  const alpha = data[index + 3];
  if (alpha < 24) return true;
  return data[index] >= WHITE_BACKGROUND_THRESHOLD && data[index + 1] >= WHITE_BACKGROUND_THRESHOLD && data[index + 2] >= WHITE_BACKGROUND_THRESHOLD;
}

/**
 * Detects the non-white foreground bounds for display-only normalization.
 * It intentionally returns a neutral fallback when the image is not a clean white-background photo.
 */
export function getWhiteMarginNormalization(image: HTMLImageElement): AutoMarginNormalization {
  try {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return DEFAULT_NORMALIZATION;

    const sampleWidth = Math.min(160, width);
    const sampleHeight = Math.max(1, Math.round((height / width) * sampleWidth));
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return DEFAULT_NORMALIZATION;
    context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

    let left = sampleWidth;
    let top = sampleHeight;
    let right = -1;
    let bottom = -1;
    let foregroundPixels = 0;
    for (let y = 0; y < sampleHeight; y += 1) {
      for (let x = 0; x < sampleWidth; x += 1) {
        const index = (y * sampleWidth + x) * 4;
        if (isBackgroundPixel(pixels, index)) continue;
        foregroundPixels += 1;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }

    return normalizeWhiteMarginBounds({ sampleWidth, sampleHeight, left, top, right, bottom, foregroundPixels });
  } catch {
    // Cross-origin images without CORS permission and unusual formats safely keep their source presentation.
    return DEFAULT_NORMALIZATION;
  }
}

export function normalizeWhiteMarginBounds({ sampleWidth, sampleHeight, left, top, right, bottom, foregroundPixels }: WhiteMarginBoundsInput): AutoMarginNormalization {
  if (sampleWidth <= 0 || sampleHeight <= 0) return DEFAULT_NORMALIZATION;
  const coverage = foregroundPixels / (sampleWidth * sampleHeight);
  if (right < 0 || bottom < 0 || coverage < MIN_FOREGROUND_COVERAGE || coverage > MAX_FOREGROUND_COVERAGE) {
    return DEFAULT_NORMALIZATION;
  }

  const detectedWidth = right - left + 1;
  const detectedHeight = bottom - top + 1;
  const paddedWidth = Math.min(sampleWidth, detectedWidth * (1 + EDGE_PADDING_RATIO * 2));
  const paddedHeight = Math.min(sampleHeight, detectedHeight * (1 + EDGE_PADDING_RATIO * 2));
  const widthScale = sampleWidth / paddedWidth;
  const heightScale = sampleHeight / paddedHeight;
  const scale = Math.min(MAX_AUTO_SCALE, Math.max(1, Math.min(widthScale, heightScale)));
  const originX = ((left + right) / 2 / sampleWidth) * 100;
  const originY = ((top + bottom) / 2 / sampleHeight) * 100;

  return { scale, originX, originY };
}

/** UI-only normalization: source pixels and aspect ratio always remain untouched. */
export default function NormalizedProductImage({ src, alt, catalogDisplay, className = "", imageClassName = "" }: NormalizedProductImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [normalization, setNormalization] = useState<AutoMarginNormalization>(DEFAULT_NORMALIZATION);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setNormalization(DEFAULT_NORMALIZATION);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    const image = imageRef.current;
    if (image) setNormalization(getWhiteMarginNormalization(image));
  };

  const manualScale = getContainedImageScale(catalogDisplay);
  const scale = Math.min(manualScale * normalization.scale, MAX_AUTO_SCALE);
  const x = catalogDisplay?.objectPositionX ?? 50;
  const y = catalogDisplay?.objectPositionY ?? 50;
  const visibilityClass = getProductImageVisibilityClass(isLoaded, hasError);
  const originX = normalization.scale > 1 ? normalization.originX : x;
  const originY = normalization.scale > 1 ? normalization.originY : y;

  return <div aria-busy={!isLoaded && !hasError} className={`relative overflow-hidden ${PRODUCT_IMAGE_SURFACE_CLASS} ${className}`}><img ref={imageRef} src={src} alt={alt} crossOrigin="anonymous" onLoad={handleLoad} onError={() => setHasError(true)} className={`relative h-full w-full object-contain p-1.5 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${visibilityClass} ${imageClassName}`} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${scale})`, transformOrigin: `${originX}% ${originY}%` }} /></div>;
}
