export type PriceTagSourceLanguage = "ko" | "zh" | "en" | "other";

export type PriceTagExtraction = {
  sourceLanguage: PriceTagSourceLanguage;
  maker: string | null;
  color: string | null;
  clothingName: string | null;
  price: number | null;
  rawText: string;
  confidence: number;
};

type UnknownExtraction = Partial<Record<keyof PriceTagExtraction, unknown>>;

export function normalizePriceTagExtraction(input: UnknownExtraction): PriceTagExtraction {
  const sourceLanguage: PriceTagSourceLanguage = input.sourceLanguage === "ko" || input.sourceLanguage === "zh" || input.sourceLanguage === "en" || input.sourceLanguage === "other" ? input.sourceLanguage : "ko";
  const price = typeof input.price === "number" && Number.isFinite(input.price) && input.price > 0 ? Math.round(input.price) : null;
  const confidence = typeof input.confidence === "number" && Number.isFinite(input.confidence)
    ? Math.max(0, Math.min(1, input.confidence))
    : 0;
  return {
    sourceLanguage,
    maker: typeof input.maker === "string" ? input.maker.trim().slice(0, 120) || null : null,
    color: typeof input.color === "string" ? input.color.trim().slice(0, 80) || null : null,
    clothingName: typeof input.clothingName === "string" ? input.clothingName.trim().slice(0, 160) || null : null,
    price,
    rawText: typeof input.rawText === "string" ? input.rawText.trim().slice(0, 2000) : "",
    confidence,
  };
}
