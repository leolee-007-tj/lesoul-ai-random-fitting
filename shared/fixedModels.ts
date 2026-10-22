export type FixedModelKey = "balanced" | "volume" | "petite";

export type FixedModel = {
  key: FixedModelKey;
  name: string;
  imageUrl: string;
  measurements: { height: number; shoulderWidth: number; chest: number; waist: number; hip: number; armLength: number; inseam: number; thigh: number; gender: "female"; unit: "cm" };
  appearance: { hairLength: string; hairStyle: string; hairColor: string; skinTone: string };
  copy: Record<"en" | "ko" | "zh", { title: string; description: string; fitNote: string }>;
};

export const FIXED_MODELS: readonly FixedModel[] = [
  {
    key: "balanced", name: "HANA", imageUrl: "/manus-storage/lesoul-test-model_d7a8e7be.png",
    measurements: { height: 165, shoulderWidth: 40, chest: 84, waist: 65, hip: 91, armLength: 58, inseam: 76, thigh: 51, gender: "female", unit: "cm" },
    appearance: { hairLength: "medium", hairStyle: "natural wave", hairColor: "dark brown", skinTone: "light-medium" },
    copy: { en: { title: "Balanced", description: "The original HANA model with balanced editorial proportions.", fitNote: "A versatile baseline for everyday styling." }, ko: { title: "균형형", description: "기존 HANA 모델의 균형 잡힌 에디토리얼 비율입니다.", fitNote: "일상적인 스타일링의 기준이 되는 모델입니다." }, zh: { title: "匀称型", description: "沿用 HANA 模特，拥有均衡的时装比例。", fitNote: "适合日常风格搭配的基础模特。" } },
  },
  {
    key: "volume", name: "MIRA", imageUrl: "/manus-storage/lesoul-fixed-model-volume_2cdbb6fe.png",
    measurements: { height: 163, shoulderWidth: 42, chest: 96, waist: 78, hip: 104, armLength: 57, inseam: 74, thigh: 61, gender: "female", unit: "cm" },
    appearance: { hairLength: "long", hairStyle: "natural wave", hairColor: "dark brown", skinTone: "light-medium" },
    copy: { en: { title: "Fuller Volume", description: "A naturally fuller silhouette with balanced body volume.", fitNote: "Useful for observing ease, volume, and garment drape." }, ko: { title: "볼륨형", description: "자연스럽고 균형 잡힌 볼륨감이 있는 실루엣입니다.", fitNote: "여유분, 볼륨감, 옷의 드레이프를 보기 좋습니다." }, zh: { title: "丰盈型", description: "自然丰盈且比例均衡的身形轮廓。", fitNote: "适合观察衣物余量、体积感和垂坠效果。" } },
  },
  {
    key: "petite", name: "SEO", imageUrl: "/manus-storage/lesoul-fixed-model-petite_b6197bb7.png",
    measurements: { height: 153, shoulderWidth: 37, chest: 80, waist: 64, hip: 88, armLength: 52, inseam: 66, thigh: 49, gender: "female", unit: "cm" },
    appearance: { hairLength: "short", hairStyle: "bob", hairColor: "black", skinTone: "light" },
    copy: { en: { title: "Petite", description: "A shorter model with naturally shorter leg proportion.", fitNote: "Useful for checking length and petite styling balance." }, ko: { title: "아담형", description: "키가 작고 다리 비율이 자연스럽게 짧은 모델입니다.", fitNote: "기장과 아담한 체형의 스타일 균형을 보기 좋습니다." }, zh: { title: "娇小型", description: "身高较小、腿部比例自然较短的模特。", fitNote: "适合查看衣长和娇小身形的搭配平衡。" } },
  },
] as const;

/** The established balanced reference remains the fixed 李瀛 AI identity; only its role-specific presentation changes. */
export const LIYING_FIXED_MODEL_KEY: FixedModelKey = "balanced";
export const getFixedModel = (key?: string | null) => FIXED_MODELS.find((model) => model.key === key) ?? null;
