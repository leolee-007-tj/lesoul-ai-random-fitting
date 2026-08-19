import type { CatalogDisplaySettings } from "@shared/catalogDisplay";

type NormalizedProductImageProps = {
  src: string;
  alt: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  className?: string;
  imageClassName?: string;
};

/** UI-only normalization: source pixels and aspect ratio always remain untouched. */
export default function NormalizedProductImage({ src, alt, catalogDisplay, className = "", imageClassName = "" }: NormalizedProductImageProps) {
  const scale = catalogDisplay?.effectiveScale ?? catalogDisplay?.manualScale ?? 1;
  const x = catalogDisplay?.objectPositionX ?? 50;
  const y = catalogDisplay?.objectPositionY ?? 50;
  return <div className={`relative overflow-hidden bg-[#f4f1eb] ${className}`}><img src={src} alt={alt} className={`h-full w-full object-contain transition-transform duration-200 ${imageClassName}`} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${scale})`, transformOrigin: `${x}% ${y}%` }} /></div>;
}
