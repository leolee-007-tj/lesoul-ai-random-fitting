export type LookHistory = {
  id: string;
  imageUrl: string;
  pose: string;
  background: string;
  style: string;
  productNames: string[];
  createdAt: string;
};

const HISTORY_KEY = "lesoul-ai-look-history";

export function readHistory(): LookHistory[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as LookHistory[]; } catch { return []; }
}

export function saveHistory(item: LookHistory) {
  const current = readHistory().filter((entry) => entry.id !== item.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 12)));
}

export function clearHistory() { localStorage.removeItem(HISTORY_KEY); }
