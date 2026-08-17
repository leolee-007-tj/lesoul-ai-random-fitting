import LookResultPanel from "@/components/LookResultPanel";
import MobileScreen from "@/components/MobileScreen";
import type { LookAdjustmentParams } from "@/lib/mvpStore";
import { useEffect, useState } from "react";

const image = "/manus-storage/editorial-cafe_f970ce23.jpg";
const products = [
  { id: 1, name: "LESOUL Soft Tailored Blazer", category: "outer", imageUrl: image, price: 329000, fabric: "Wool Blend", fit: "Regular", length: "Long", width: "Standard", details: "Defined shoulder line and double-breasted front", purchaseUrl: "https://example.com/lesoul/blazer", purchasePlatform: "LESOUL Store" },
  { id: 2, name: "LESOUL Fluid Midi Skirt", category: "bottom", imageUrl: image, price: 149000, fabric: "Silk Blend", fit: "Relaxed", length: "Midi", width: "Flared", details: "Pressed pleats and finished waistband", purchaseUrl: "https://example.com/lesoul/skirt", purchasePlatform: "LESOUL Store" },
];

export default function ResultPreview() {
  const [previous, setPrevious] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editorOpen = new URLSearchParams(window.location.search).get("adjust") === "1";
  const keyboardPreview = new URLSearchParams(window.location.search).get("keyboard") === "1";
  useEffect(() => {
    if (!keyboardPreview) return;
    document.documentElement.dataset.keyboardOpen = "true";
    document.documentElement.style.setProperty("--lesoul-keyboard-height", "270px");
    return () => { delete document.documentElement.dataset.keyboardOpen; document.documentElement.style.removeProperty("--lesoul-keyboard-height"); };
  }, [keyboardPreview]);
  const regenerate = async (_adjustments: LookAdjustmentParams) => {
    setBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    setPrevious(image);
    setBusy(false);
  };
  return <MobileScreen>
    <div className="px-4 pt-2"><LookResultPanel imageUrl={image} previousImageUrl={previous} lookCode="LOOK #SAFE" products={products} measurements={{ height: 163, shoulderWidth: 42, gender: "female", unit: "cm" }} isRegenerating={busy} onRegenerate={regenerate} onChangePose={() => undefined} onChangeOutfit={() => undefined} shareUrl={`${window.location.origin}/result-preview`} initialEditorOpen={editorOpen} /></div>
  </MobileScreen>;
}
