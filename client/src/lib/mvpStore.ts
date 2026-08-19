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
  poseKey?: string | null;
  background: string;
  backgroundRaw?: string;
  backgroundKey?: string | null;
  style: string;
  styleKey?: string | null;
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
const HISTORY_VERSION_KEY = "lesoul-ai-look-history-version";
const HISTORY_TOMBSTONES_KEY = "lesoul-ai-look-history-deleted";
const HISTORY_VERSION = "2";
const LEGACY_HISTORY_KEYS = ["myLooks_ko", "myLooks_zh", "myLooks_en", "savedLooks-ko", "savedLooks-zh", "savedLooks-en"];

function parseLooks(raw: string | null) {
  try { return JSON.parse(raw ?? "[]") as Array<Partial<LookHistory>>; } catch { return []; }
}

function readTombstones() {
  try { return new Set(JSON.parse(localStorage.getItem(HISTORY_TOMBSTONES_KEY) ?? "[]") as string[]); } catch { return new Set<string>(); }
}

function writeTombstones(ids: Iterable<string>) {
  localStorage.setItem(HISTORY_TOMBSTONES_KEY, JSON.stringify(Array.from(new Set(ids)).slice(-120)));
}

function normalizeLooks(raw: Array<Partial<LookHistory>>) {
  return raw.map((entry) => ({ ...entry, language: entry.language ?? "en", adjustmentParams: entry.adjustmentParams ?? {}, shareUrl: entry.shareUrl ?? null, products: entry.products ?? [], poseRaw: entry.poseRaw ?? entry.pose, poseKey: entry.poseKey ?? null, backgroundRaw: entry.backgroundRaw ?? entry.background, backgroundKey: entry.backgroundKey ?? null, styleKey: entry.styleKey ?? null, selectedStylistLookId: entry.selectedStylistLookId ?? null, stylistCandidates: entry.stylistCandidates ?? [] })) as LookHistory[];
}

function migrateLegacyHistoryOnce() {
  const canonical = parseLooks(localStorage.getItem(HISTORY_KEY));
  if (localStorage.getItem(HISTORY_VERSION_KEY) === HISTORY_VERSION) return normalizeLooks(canonical);
  const legacy = LEGACY_HISTORY_KEYS.flatMap((key) => parseLooks(localStorage.getItem(key)));
  const tombstones = readTombstones();
  const unique = [...canonical, ...legacy].filter((look, index, all) => Boolean(look?.id) && !tombstones.has(look.id!) && all.findIndex((candidate) => candidate.id === look.id) === index);
  const normalized = normalizeLooks(unique).slice(0, 12);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
  LEGACY_HISTORY_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(HISTORY_VERSION_KEY, HISTORY_VERSION);
  return normalized;
}

export function readHistory(): LookHistory[] {
  try {
    const tombstones = readTombstones();
    const migrated = migrateLegacyHistoryOnce().filter((look) => !tombstones.has(look.id));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

export function saveHistory(item: LookHistory) {
  const current = readHistory().filter((entry) => entry.id !== item.id);
  const tombstones = readTombstones();
  tombstones.delete(item.id);
  writeTombstones(tombstones);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 12)));
}

export function replaceHistory(items: LookHistory[]) {
  const tombstones = readTombstones();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.filter((item) => !tombstones.has(item.id)).slice(0, 12)));
}

export function removeHistoryByIds(ids: string[]) {
  const removing = new Set(ids);
  const tombstones = readTombstones();
  ids.forEach((id) => tombstones.add(id));
  writeTombstones(tombstones);
  replaceHistory(readHistory().filter((entry) => !removing.has(entry.id)));
}

export function isDeletedHistoryId(id: string) { return readTombstones().has(id); }

export function clearHistory() { removeHistoryByIds(readHistory().map((item) => item.id)); }
