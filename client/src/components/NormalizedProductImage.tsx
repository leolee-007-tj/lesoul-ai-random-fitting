import type { CatalogDisplaySettings } from "@shared/catalogDisplay";
import { useEffect, useState } from "react";

type NormalizedProductImageProps = {
  src: string;
  alt: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  className?: string;
  imageClassName?: string;
};

export const PRODUCT_IMAGE_SURFACE_CLASS = "bg-white";

export function getContainedImageScale(catalogDisplay?: NormalizedProductImageProps["catalogDisplay"]) {
  const requestedScale = catalogDisplay?.effectiveScale ?? catalogDisplay?.manualScale ?? 1;
  return Math.min(requestedScale, 0.94);
}

export function getProductImageVisibilityClass(isLoaded: boolean, hasError: boolean) {
  return isLoaded && !hasError ? "opacity-100" : "opacity-0";
}

/** UI-only normalization: source pixels and aspect ratio always remain untouched. */
export default function NormalizedProductImage({ src, alt, catalogDisplay, className = "", imageClassName = "" }: NormalizedProductImageProps) {
  // Product browsing must always show the complete garment with a small visual cushion.
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);
  const scale = getContainedImageScale(catalogDisplay);
  const x = catalogDisplay?.objectPositionX ?? 50;
  const y = catalogDisplay?.objectPositionY ?? 50;
  const visibilityClass = getProductImageVisibilityClass(isLoaded, hasError);
  return <div aria-busy={!isLoaded && !hasError} className={`relative overflow-hidden ${PRODUCT_IMAGE_SURFACE_CLASS} ${className}`}><img src={src} alt={alt} onLoad={() => setIsLoaded(true)} onError={() => setHasError(true)} className={`relative h-full w-full object-contain p-1.5 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${visibilityClass} ${imageClassName}`} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` }} /></div>;
}
