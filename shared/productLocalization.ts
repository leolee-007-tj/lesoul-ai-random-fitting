/** Stored translations are data, not proof that localization completed. */
export const PRODUCT_TEXT_FIELDS = ["name", "description", "season", "color", "style"] as const;
export const PRODUCT_TEXT_LOCALES = ["En", "Ko", "Zh"] as const;
export type ProductText = { name: string; description?: string | null; season?: string | null; color?: string | null; style?: string | null } & Partial<Record<`${typeof PRODUCT_TEXT_FIELDS[number]}${typeof PRODUCT_TEXT_LOCALES[number]}`, string | null>>;
const clean = (value: string | null | undefined) => value?.trim() ?? "";
const han = (value: string) => /[\u3400-\u9fff]/.test(value);
const hangul = (value: string) => /[\uac00-\ud7a3\u3131-\u318e]/.test(value);

export function productTranslationIssues(product: ProductText) {
  const issues: Array<`${typeof PRODUCT_TEXT_FIELDS[number]}${typeof PRODUCT_TEXT_LOCALES[number]}`> = [];
  for (const field of PRODUCT_TEXT_FIELDS) {
    const source = clean(product[field]);
    // Empty optional metadata is intentionally empty, not an endless repair task.
    if (!source && field !== "name" && field !== "description") continue;
    for (const locale of PRODUCT_TEXT_LOCALES) {
      const key = `${field}${locale}` as typeof issues[number];
      const value = clean(product[key]);
      const copiedChinese = han(source) && !hangul(source) && value === source && locale !== "Zh";
      const copiedKorean = hangul(source) && value === source && locale !== "Ko";
      if (!value || copiedChinese || copiedKorean) issues.push(key);
    }
  }
  return issues;
}

/** Only repair missing/suspect fields; keep the owner's valid existing copy. */
export function productTranslationRepair(product: ProductText, generated: ProductText) {
  const patch: Record<string, string> = {};
  const invalid = new Set(productTranslationIssues({ ...product, ...generated }));
  for (const key of productTranslationIssues(product)) {
    const value = clean(generated[key]);
    if (!value || invalid.has(key)) throw new Error("PRODUCT_TRANSLATION_INCOMPLETE");
    patch[key] = value;
  }
  return patch;
}

/** Editor defaults must not turn untranslated source into a translated value. */
export function productTranslationEditorFields(product: ProductText) {
  return Object.fromEntries(PRODUCT_TEXT_FIELDS.flatMap(field => PRODUCT_TEXT_LOCALES.map(locale => {
    const key = `${field}${locale}` as keyof ProductText;
    return [key, clean(product[key])];
  })));
}

export function productSourceTranslationChanged(existing: ProductText, updates: Partial<ProductText>) {
  return PRODUCT_TEXT_FIELDS.some(field => updates[field] !== undefined && clean(updates[field]) !== clean(existing[field])
    && PRODUCT_TEXT_LOCALES.some(locale => !clean(updates[`${field}${locale}`])));
}
