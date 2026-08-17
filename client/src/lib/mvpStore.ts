import type { SupportedLanguage } from "@/i18n";

export type LookAdjustmentParams = {
  overallFit?: "looser" | "as_is" | "tighter";
  proportion?: "shorter_torso" | "as_is" | "longer_legs";
  lighting?: "darker" | "as_is" | "brighter";
  items?: Record<number, { length?: "shorter" | "as_is" | "longer"; width?: "narrower" | "as_is" | "wider"; color?: "muted" | "as_is" | "vibrant"; details?: "simpler" | "as_is" | "detailed" }>;
};

export type LookHistory = {
  id: string;
  imageUrl: string;
  pose: string;
  background: string;
  style: string;
  productNames: string[];
  createdAt: string;
  language: SupportedLanguage;
  adjustmentParams: LookAdjustmentParams;
  shareUrl: string | null;
};

const HISTORY_KEY = "lesoul-ai-look-history";

export function readHistory(): LookHistory[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as Array<Partial<LookHistory>>;
    const migrated = raw.map((entry) => ({ ...entry, language: entry.language ?? "en", adjustmentParams: entry.adjustmentParams ?? {}, shareUrl: entry.shareUrl ?? null })) as LookHistory[];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

export function saveHistory(item: LookHistory) {
  const current = readHistory().filter((entry) => entry.id !== item.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 12)));
}

export function clearHistory() { localStorage.removeItem(HISTORY_KEY); }
