import type { SupportedLanguage } from "@/i18n";

export type LookAdjustmentParams = {
  overallFit?: "looser" | "as_is" | "tighter";
  proportion?: "shorter_torso" | "as_is" | "longer_legs";
  lighting?: "darker" | "as_is" | "brighter";
  items?: Record<number, { length?: "shorter" | "as_is" | "longer"; width?: "narrower" | "as_is" | "wider"; color?: "muted" | "as_is" | "vibrant"; details?: "simpler" | "as_is" | "detailed" }>;
};

export type SavedLookProduct = { id: number; name: string; nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; description?: string; descriptionEn?: string | null; descriptionKo?: string | null; descriptionZh?: string | null; category: string; imageUrl: string; images?: string[] | null; imageViews?: import("@shared/bodyMeasurements").ProductImageViews | null; price: number; fabric?: string | null; fit?: string | null; length?: string | null; width?: string | null; details?: string | null; purchaseUrl?: string | null; purchasePlatform?: string | null; purchaseQrUrl?: string | null };

export type LookHistory = {
  id: string;
  imageUrl: string;
  pose: string;
  poseRaw?: string;
  background: string;
  style: string;
  productNames: string[];
  products?: SavedLookProduct[];
  createdAt: string;
  language: SupportedLanguage;
  adjustmentParams: LookAdjustmentParams;
  shareUrl: string | null;
  selectedStylistLookId?: string | null;
  stylistCandidates?: Array<{ lookId: string; productIds: number[]; score: number }>;
};

const HISTORY_KEY = "lesoul-ai-look-history";

export function readHistory(): LookHistory[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as Array<Partial<LookHistory>>;
    const migrated = raw.map((entry) => ({ ...entry, language: entry.language ?? "en", adjustmentParams: entry.adjustmentParams ?? {}, shareUrl: entry.shareUrl ?? null, products: entry.products ?? [], poseRaw: entry.poseRaw ?? entry.pose, selectedStylistLookId: entry.selectedStylistLookId ?? null, stylistCandidates: entry.stylistCandidates ?? [] })) as LookHistory[];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

export function saveHistory(item: LookHistory) {
  const current = readHistory().filter((entry) => entry.id !== item.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 12)));
}

export function clearHistory() { localStorage.removeItem(HISTORY_KEY); }
