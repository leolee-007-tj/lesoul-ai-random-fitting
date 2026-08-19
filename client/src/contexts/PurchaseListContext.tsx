import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import type { CatalogDisplaySettings } from "@shared/catalogDisplay";

export type PurchaseListItem = {
  productId: number;
  productName: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  productImage: string;
  catalogDisplay?: (CatalogDisplaySettings & { effectiveScale?: number | null }) | null;
  selectedSize: string;
  availableSizes: string[];
  recommendedSize?: string | null;
  quantity: number;
  currentPrice: number;
  purchaseType?: "NORMAL" | "RESERVATION";
  source?: "ai_fitting" | "quick_fit" | "catalog" | "detail";
};

type PurchaseListContextValue = {
  items: PurchaseListItem[];
  itemCount: number;
  referenceTotal: number;
  addItem: (item: Omit<PurchaseListItem, "quantity"> & { quantity?: number }) => void;
  updateItem: (productId: number, selectedSize: string, patch: Partial<Pick<PurchaseListItem, "selectedSize" | "quantity" | "currentPrice">>) => void;
  removeItem: (productId: number, selectedSize: string) => void;
  clearItems: () => void;
};

const STORAGE_KEY = "lesoulPurchaseList";
const PurchaseListContext = createContext<PurchaseListContextValue | null>(null);

function loadItems(): PurchaseListItem[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is PurchaseListItem => typeof item?.productId === "number" && typeof item?.selectedSize === "string" && typeof item?.quantity === "number") : [];
  } catch { return []; }
}

function persist(items: PurchaseListItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Keep the session usable if storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event: "purchase_list_changed", timestamp: Date.now(), itemCount: items.reduce((total, item) => total + item.quantity, 0) } }));
}

export function PurchaseListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PurchaseListItem[]>(loadItems);
  const commit = (next: PurchaseListItem[]) => { setItems(next); persist(next); };
  const value = useMemo<PurchaseListContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    referenceTotal: items.reduce((total, item) => total + item.currentPrice * item.quantity, 0),
    addItem: (input) => {
      const quantity = Math.max(1, input.quantity ?? 1);
      const existing = items.find((item) => item.productId === input.productId && item.selectedSize === input.selectedSize);
      const next = existing ? items.map((item) => item === existing ? { ...item, quantity: Math.min(99, item.quantity + quantity), currentPrice: input.currentPrice, purchaseType: input.purchaseType ?? item.purchaseType ?? "NORMAL" } : item) : [...items, { ...input, purchaseType: input.purchaseType ?? "NORMAL", quantity }];
      commit(next);
      window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event: "purchase_list_item_added", productId: input.productId, timestamp: Date.now() } }));
    },
    updateItem: (productId, selectedSize, patch) => commit(items.map((item) => item.productId === productId && item.selectedSize === selectedSize ? { ...item, ...patch, quantity: Math.max(1, Math.min(99, patch.quantity ?? item.quantity)) } : item)),
    removeItem: (productId, selectedSize) => { commit(items.filter((item) => item.productId !== productId || item.selectedSize !== selectedSize)); window.dispatchEvent(new CustomEvent("lesoul-purchase", { detail: { event: "purchase_list_item_removed", productId, timestamp: Date.now() } })); },
    clearItems: () => commit([]),
  }), [items]);
  return <PurchaseListContext.Provider value={value}>{children}</PurchaseListContext.Provider>;
}

export function usePurchaseList() {
  const value = useContext(PurchaseListContext);
  if (!value) throw new Error("PurchaseListProvider is required.");
  return value;
}
