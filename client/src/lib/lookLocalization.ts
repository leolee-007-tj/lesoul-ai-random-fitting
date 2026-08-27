import type { TFunction } from "i18next";

export type LookLocale = "en" | "ko" | "zh";
export type BackgroundKey = "seoulCafe" | "gallery" | "hanRiver" | "seongsu" | "tokyo" | "paris" | "hotel" | "flower" | "studio" | "jeju";

const backgroundAliases: Record<BackgroundKey, string[]> = {
  seoulCafe: ["서울 카페", "Seoul Cafe", "首尔咖啡馆"],
  gallery: ["갤러리", "아트 갤러리", "Art Gallery", "艺术画廊"],
  hanRiver: ["한강 공원", "Han River Park", "汉江公园"],
  seongsu: ["성수동 거리", "Seongsu Street", "圣水洞街头"],
  tokyo: ["도쿄 거리", "Tokyo Street", "东京街头"],
  paris: ["파리 카페", "Paris Cafe", "巴黎咖啡馆"],
  hotel: ["럭셔리 호텔 로비", "Luxury Hotel Lobby", "奢华酒店大堂"],
  flower: ["꽃집 앞", "Flower Shop", "花店前"],
  studio: ["미니멀 스튜디오", "Minimal Studio", "极简工作室"],
  jeju: ["제주 바닷가", "Jeju Seaside", "济州海边"],
};

const styleAliases: Record<string, string[]> = {
  RANDOM: ["RANDOM", "Random", "랜덤", "随机"],
  DAILY: ["DAILY", "Daily", "데일리", "日常"],
  QUIET_LUXURY: ["QUIET_LUXURY", "QUIET LUXURY", "Quiet Luxury", "콰이어트 럭셔리", "静奢"],
  ELEGANT: ["ELEGANT", "Elegant", "엘레강스", "우아", "优雅"],
  CHIC: ["CHIC", "Chic", "시크", "时尚"],
  CASUAL: ["CASUAL", "Casual", "캐주얼", "休闲"],
  MINIMAL: ["MINIMAL", "Minimal", "미니멀", "极简"],
  OFFICE: ["OFFICE", "Office", "오피스", "通勤"],
  DATE: ["DATE", "Date", "데이트", "约会"],
  STREET: ["STREET", "Street", "스트리트", "街头"],
  AI_CHOICE: ["AI_CHOICE", "AI CHOICE", "AI Choice", "AI 선택", "AI 推荐"],
};

function normalized(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

export function resolveBackgroundKey(rawName?: string | null, storedKey?: string | null): BackgroundKey | null {
  if (storedKey && storedKey in backgroundAliases) return storedKey as BackgroundKey;
  const current = normalized(rawName);
  return (Object.keys(backgroundAliases) as BackgroundKey[]).find((key) => backgroundAliases[key].some((alias) => normalized(alias) === current)) ?? null;
}

export function getLocalizedBackground(t: TFunction, rawName?: string | null, storedKey?: string | null) {
  const key = resolveBackgroundKey(rawName, storedKey);
  if (!key) return { key: null, name: rawName || t("look.backgrounds.studio.name"), description: "" };
  return {
    key,
    name: t(`look.backgrounds.${key}.name`),
    description: t(`look.backgrounds.${key}.description`),
  };
}

export function resolveStyleKey(rawStyle?: string | null, storedKey?: string | null) {
  if (storedKey && storedKey in styleAliases) return storedKey;
  const current = normalized(rawStyle);
  return Object.entries(styleAliases).find(([, aliases]) => aliases.some((alias) => normalized(alias) === current))?.[0] ?? null;
}

export function getLocalizedStyle(t: TFunction, rawStyle?: string | null, storedKey?: string | null) {
  const key = resolveStyleKey(rawStyle, storedKey);
  const curatedChoice = t("common.curatedChoice", { defaultValue: "Store curated choice" });
  return { key, label: key === "AI_CHOICE" ? curatedChoice : key ? t(`look.styles.${key}`) : rawStyle || t("look.styles.MINIMAL") };
}
