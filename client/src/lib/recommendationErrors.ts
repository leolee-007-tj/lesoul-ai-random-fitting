/** Only allowlisted causes are shown; provider response bodies and credentials never reach the UI. */
export function recommendationFailureMessage(error: unknown, locale: "ko" | "zh" | "en"): string | null {
  const text=error instanceof Error ? `${error.name} ${error.message}` : "";
  const key=/PRODUCT_SOLD_OUT|PRODUCT_NOT_FOUND/.test(text) ? "stock" : /GENERATION_ACCESS_DENIED:paused/.test(text) ? "paused" : /GENERATION_ACCESS_DENIED:budget_limit/.test(text) ? "budget" : /GENERATION_ACCESS_DENIED:(?:daily_limit|monthly_limit|global_limit|style_match_quota|quota_exhausted)/.test(text) ? "limit" : /TimeoutError|AbortError|IMAGE_GENERATION_TIMEOUT/.test(text) ? "timeout" : null;
  if(!key)return null;
  const copy={
    ko:{stock:"추천 중 상품 재고가 변경됐습니다. 다시 추천해 주세요.",paused:"현재 이미지 생성이 일시 중지되어 있습니다. 매장 직원에게 알려 주세요.",budget:"이미지 생성 예산 한도에 도달했습니다. 매장 직원에게 알려 주세요.",limit:"이미지 생성 사용 한도에 도달했습니다. 매장 직원에게 알려 주세요.",timeout:"이미지 생성 응답이 늦어 요청을 종료했습니다. 자동으로 재시도하지 않았습니다."},
    zh:{stock:"推荐过程中库存发生变化，请重新推荐。",paused:"图片生成已暂停，请联系店员。",budget:"已达到图片生成预算上限，请联系店员。",limit:"已达到图片生成使用上限，请联系店员。",timeout:"图片生成响应超时，未自动重试。"},
    en:{stock:"Stock changed during the request. Please request new recommendations.",paused:"Image generation is paused. Please ask store staff.",budget:"The image generation budget limit was reached. Please ask store staff.",limit:"The image generation usage limit was reached. Please ask store staff.",timeout:"Image generation timed out. No automatic retry was made."}
  };return copy[locale][key];
}
