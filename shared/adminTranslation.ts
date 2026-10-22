export function requiredKoreanCustomerCopy(value: string) {
  return value.trim();
}

export function optionalKoreanCustomerCopy(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || null;
}
