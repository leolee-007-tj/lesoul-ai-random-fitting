export const CUSTOMER_MEASUREMENT_RULES = {
  height: { min: 80, max: 240, unit: "cm", labels: { ko: "키", zh: "身高", en: "Height" } },
  weight: { min: 20, max: 250, unit: "kg", labels: { ko: "몸무게", zh: "体重", en: "Weight" } },
  shoulderWidth: { min: 20, max: 80, unit: "cm", labels: { ko: "어깨너비", zh: "肩宽", en: "Shoulder width" } },
  chest: { min: 40, max: 180, unit: "cm", labels: { ko: "가슴둘레", zh: "胸围", en: "Chest" } },
  waist: { min: 40, max: 180, unit: "cm", labels: { ko: "허리둘레", zh: "腰围", en: "Waist" } },
  hip: { min: 40, max: 200, unit: "cm", labels: { ko: "엉덩이둘레", zh: "臀围", en: "Hip" } },
} as const;
export type CustomerMeasurementKey = keyof typeof CUSTOMER_MEASUREMENT_RULES;
/** Optional values stay absent; never guess units or silently discard invalid measurements. */
export function parseCustomerMeasurements(input: Record<CustomerMeasurementKey, string>, locale: "ko" | "zh" | "en") {
  const values = {} as Record<CustomerMeasurementKey, number | null>;
  const errors: string[] = [];
  for (const key of Object.keys(CUSTOMER_MEASUREMENT_RULES) as CustomerMeasurementKey[]) {
    const rule = CUSTOMER_MEASUREMENT_RULES[key];
    let text = input[key].normalize("NFKC").trim();
    if (!text) { values[key] = null; continue; }
    const unit = rule.unit === "kg" ? /\s*(?:kg|킬로그램|公斤|千克)$/i : /\s*(?:cm|센티미터|厘米)$/i;
    text = text.replace(unit, "").trim();
    if (/^\d+,\d{1,2}$/.test(text)) text = text.replace(",", ".");
    const number = /^\d+(?:\.\d+)?$/.test(text) ? Number(text) : NaN;
    if (!Number.isFinite(number) || number < rule.min || number > rule.max) {
      values[key] = null;
      const range = `${rule.min}–${rule.max} ${rule.unit}`;
      errors.push(locale === "ko" ? `${rule.labels.ko}: ${range} 숫자로 입력하거나 비워 주세요.` : locale === "zh" ? `${rule.labels.zh}：请输入 ${range} 的数值，或留空。` : `${rule.labels.en}: enter ${range}, or leave blank.`);
    } else values[key] = number;
  }
  return { values, errors };
}
