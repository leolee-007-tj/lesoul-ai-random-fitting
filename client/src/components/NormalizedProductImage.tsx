import type { CatalogDisplaySettings } from "@shared/catalogDisplay";

type NormalizedProductImageProps = {
  src: string;
  alt: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  className?: string;
  imageClassName?: string;
};

export function getContainedImageScale(catalogDisplay?: NormalizedProductImageProps["catalogDisplay"]) {
  const requestedScale = catalogDisplay?.effectiveScale ?? catalogDisplay?.manualScale ?? 1;
  return Math.min(requestedScale, 0.94);
}

/** UI-only normalization: source pixels and aspect ratio always remain untouched. */
export default function NormalizedProductImage({ src, alt, catalogDisplay, className = "", imageClassName = "" }: NormalizedProductImageProps) {
  // Product browsing must always show the complete garment with a small visual cushion.
  const scale = getContainedImageScale(catalogDisplay);
  const x = catalogDisplay?.objectPositionX ?? 50;
  const y = catalogDisplay?.objectPositionY ?? 50;
  return <div className={`relative overflow-hidden bg-[#f4f1eb] ${className}`}><img src={src} alt={alt} className={`h-full w-full object-contain p-1.5 transition-transform duration-200 ${imageClassName}`} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` }} /></div>;
}
