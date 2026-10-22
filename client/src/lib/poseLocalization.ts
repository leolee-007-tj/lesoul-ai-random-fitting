export type LocalizedPose = { title: string; description: string };

const poseKeyByName: Record<string, string> = {
  "한 손 주머니": "handPocket", "Hand in Pocket": "handPocket", "살짝 옆으로": "side", "Side Pose": "side",
  "정면": "front", "Front Model Pose": "front", "걷는 포즈": "walking", "Walking": "walking",
  "팔짱": "crossedArms", "Crossed Arms": "crossedArms", "앉은 포즈": "seated", "Seated": "seated",
  "모델 포즈": "model", "Model Pose": "model", "뒤돌아보기": "lookBack", "Looking Back": "lookBack",
  "Natural Standing": "standing", "내추럴 스탠딩": "standing", "Elegant Fashion Pose": "elegant", "엘레강트 패션": "elegant",
};

const catalog: Record<"en" | "ko" | "zh", Record<string, LocalizedPose>> = {
  en: {
    handPocket: { title: "Hand in Pocket", description: "A relaxed hand-in-pocket stance for effortless everyday styling." }, side: { title: "Soft Side Angle", description: "A gentle side angle to review silhouette and garment length." }, front: { title: "Front View", description: "A straight-on editorial view for balanced proportions." }, walking: { title: "Walking", description: "A natural stride to review movement and drape." }, crossedArms: { title: "Crossed Arms", description: "A confident crossed-arm stance with a polished mood." }, seated: { title: "Seated", description: "A seated composition to review waist and sleeve proportions." }, model: { title: "Editorial Model", description: "A full-body high-fashion line for a polished editorial look." }, lookBack: { title: "Looking Back", description: "A graceful over-the-shoulder turn to show silhouette from another angle." }, standing: { title: "Natural Standing", description: "A clear, relaxed full-body product view." }, elegant: { title: "Elegant Fashion", description: "An elongated editorial line for a polished fashion result." },
  },
  ko: {
    handPocket: { title: "한 손 주머니", description: "편안한 일상 스타일링을 위한 한 손 주머니 포즈입니다." }, side: { title: "살짝 옆으로", description: "실루엣과 기장을 보기 좋은 부드러운 측면 각도입니다." }, front: { title: "정면", description: "균형 잡힌 비율을 확인하는 정면 에디토리얼 구도입니다." }, walking: { title: "걷는 포즈", description: "움직임과 드레이프를 확인하는 자연스러운 걸음입니다." }, crossedArms: { title: "팔짱", description: "정돈된 분위기의 자신감 있는 팔짱 포즈입니다." }, seated: { title: "앉은 포즈", description: "허리와 소매 비율을 보는 앉은 구도입니다." }, model: { title: "에디토리얼 모델", description: "정제된 패션 화보를 위한 전신 하이패션 라인입니다." }, lookBack: { title: "뒤돌아보기", description: "다른 각도의 실루엣을 보여주는 자연스러운 어깨 너머 시선입니다." }, standing: { title: "내추럴 스탠딩", description: "상품을 또렷하게 볼 수 있는 편안한 전신 구도입니다." }, elegant: { title: "엘레강트 패션", description: "정제된 패션 결과를 위한 길고 우아한 에디토리얼 라인입니다." },
  },
  zh: {
    handPocket: { title: "手插口袋", description: "适合轻松日常穿搭的手插口袋姿势。" }, side: { title: "轻侧身", description: "用于查看轮廓与衣长的柔和侧面角度。" }, front: { title: "正面", description: "用于查看均衡比例的正面时尚构图。" }, walking: { title: "行走", description: "用于查看动态与垂坠感的自然步伐。" }, crossedArms: { title: "交叉双臂", description: "精致自信的交叉双臂姿势。" }, seated: { title: "坐姿", description: "用于查看腰部和袖长比例的坐姿构图。" }, model: { title: "时尚模特姿势", description: "用于精致时尚大片效果的全身高定线条。" }, lookBack: { title: "回眸", description: "自然的回眸姿势，从另一角度展示整体轮廓。" }, standing: { title: "自然站姿", description: "清晰展示商品的自然全身构图。" }, elegant: { title: "优雅时尚", description: "用于精致时尚效果的修长编辑线条。" },
  },
};

export function localizePose(language: string, rawName: string): LocalizedPose {
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  return catalog[locale][poseKeyByName[rawName] ?? "standing"];
}

export function poseLocalizationKey(rawName: string) { return poseKeyByName[rawName] ?? "standing"; }
