export const STYLE_PRESET_KEYS = ["quiet_luxury", "elegant", "minimal", "chic", "casual", "office", "date", "street", "ai_choice"] as const;
export type StylePresetKey = typeof STYLE_PRESET_KEYS[number];

export type StylistProductMetadata = {
  mainColor?: string;
  secondaryColor?: string;
  pattern?: string;
  materialAppearance?: string;
  silhouette?: string;
  formality?: number;
  fashionMood?: string[];
  recommendedStyles?: StylePresetKey[];
  compatibleColors?: string[];
  layeringSuitability?: "base" | "layer" | "outer" | "complete" | "accessory";
  source?: "manual" | "vision";
};

export type CompatibilityWeights = {
  style: number;
  color: number;
  silhouette: number;
  season: number;
  material: number;
  formality: number;
};

export const DEFAULT_COMPATIBILITY_WEIGHTS: CompatibilityWeights = {
  style: 30,
  color: 25,
  silhouette: 20,
  season: 10,
  material: 10,
  formality: 5,
};

export type StylePresetSeed = {
  key: StylePresetKey;
  name: string;
  description: string;
  matchingTags: string[];
  weights: CompatibilityWeights;
};

export const DEFAULT_STYLE_PRESETS: StylePresetSeed[] = [
  { key: "quiet_luxury", name: "QUIET LUXURY", description: "절제되고 고급스러운 스타일", matchingTags: ["고급", "출근", "ELEGANT", "MINIMAL"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "elegant", name: "ELEGANT", description: "여성스럽고 세련된 스타일", matchingTags: ["고급", "데이트", "ELEGANT"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "minimal", name: "MINIMAL", description: "깔끔하고 단순한 스타일", matchingTags: ["출근", "MINIMAL"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "chic", name: "CHIC", description: "도시적이고 세련된 스타일", matchingTags: ["출근", "데이트", "CHIC"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "casual", name: "CASUAL", description: "편안하고 자연스러운 스타일", matchingTags: ["캐주얼", "CASUAL"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "office", name: "OFFICE", description: "세련된 출근·비즈니스 스타일", matchingTags: ["출근", "고급", "OFFICE"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "date", name: "DATE", description: "부드럽고 여성스러운 데이트 스타일", matchingTags: ["데이트", "고급", "DATE"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "street", name: "STREET", description: "트렌디하고 캐주얼한 스타일", matchingTags: ["캐주얼", "STREET", "CHIC"], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
  { key: "ai_choice", name: "CURATOR'S PICK", description: "매장이 직접 선택한 완성 코디", matchingTags: [], weights: DEFAULT_COMPATIBILITY_WEIGHTS },
];
