export type CareLabelData = {
  id: string;
  brand: string;
  name: string;
  category: string;
  size: string;
  specification: string;
  composition: string;
  lining: string;
  filling: string;
  origin: string;
  dealer: string;
  address: string;
  standard: string;
  safety: string;
  grade: string;
  care: string;
  careConfirmed: boolean;
  bleach: string;
  dry: string;
  iron: string;
  professional: string;
  notes: string;
  wash?: string;
  phone: string;
  classification: string;
  revision: number;
  updatedAt?: string;
  careImage?: string;
  /** Structured administrator selections; original imported text fields remain untouched. */
  executionStandardKey?: string;
  safetyCategoryKey?: string;
  productGradeKey?: string;
  materialComposition?: Array<{ key: string; nameZh: string; nameKo: string; percentage: number }>;
  publicFields?: string[];
  [key: string]: unknown;
};

export type CareLabelMaterial = { key: string; nameZh: string; nameKo: string; nameEn: string };

export const CARE_LABEL_STANDARDS = [
  { key: "GB_T_22849_2014", nameZh: "GB/T 22849-2014（针织T恤衫）", appliesTo: ["T恤", "티셔츠", "맨투맨", "卫衣", "上衣"] },
  { key: "GB_T_2660_2017", nameZh: "GB/T 2660-2017（衬衫）", appliesTo: ["衬衫", "셔츠", "블라우스"] },
  { key: "FZ_T_81007_2022", nameZh: "FZ/T 81007-2022（单、夹服装）", appliesTo: ["夹克", "자켓", "外套", "风衣", "上衣"] },
  { key: "GB_T_2666_2017", nameZh: "GB/T 2666-2017（裤子）", appliesTo: ["裤", "바지", "팬츠", "슬랙스"] },
  { key: "GB_T_22700_2016", nameZh: "GB/T 22700-2016（牛仔服装）", appliesTo: ["牛仔", "데님", "청바지"] },
  { key: "GB_T_22853_2019", nameZh: "GB/T 22853-2019（针织裙装）", appliesTo: ["针织裙", "니트 원피스", "니트스커트"] },
  { key: "FZ_T_81004_2020", nameZh: "FZ/T 81004-2020（连衣裙、裙子）", appliesTo: ["裙", "원피스", "스커트"] },
  { key: "FZ_T_73020_2019", nameZh: "FZ/T 73020-2019（针织休闲服装）", appliesTo: ["레깅스", "니트 바지", "针织裤", "트레이닝"] },
  { key: "GB_T_14272_2021", nameZh: "GB/T 14272-2021（羽绒服装）", appliesTo: ["羽绒", "다운", "패딩"] },
  { key: "GB_T_2664_2017", nameZh: "GB/T 2664-2017（男西服、大衣）", appliesTo: ["코트", "大衣", "모직 외투"] },
  { key: "QB_T_1615_2018", nameZh: "QB/T 1615-2018（皮革服装）", appliesTo: ["皮革", "가죽", "무스탕"] },
  { key: "FZ_T_73018_2021", nameZh: "FZ/T 73018-2021（针织衫）", appliesTo: ["针织衫", "스웨터", "가디건", "니트"] },
  { key: "FZ_T_73009_2021", nameZh: "FZ/T 73009-2021（羊绒针织品）", appliesTo: ["羊绒", "캐시미어"] },
  { key: "GB_T_8878_2023", nameZh: "GB/T 8878-2023（针织内衣）", appliesTo: ["内衣", "속옷", "나시"] },
  { key: "FZ_T_73017_2014", nameZh: "FZ/T 73017-2014（针织家居服）", appliesTo: ["家居服", "잠옷", "홈웨어"] },
  { key: "FZ_T_73022_2019", nameZh: "FZ/T 73022-2019（针织保暖内衣）", appliesTo: ["保暖内衣", "보온내의"] },
] as const;

export const CARE_LABEL_SAFETY_CATEGORIES = [
  { key: "B", nameZh: "GB 18401-2010 B类", noteZh: "可直接接触皮肤的纺织产品" },
  { key: "C", nameZh: "GB 18401-2010 C类", noteZh: "非直接接触皮肤的纺织产品" },
  { key: "A", nameZh: "GB 18401-2010 A类", noteZh: "婴幼儿纺织产品（成人商品通常不适用）" },
] as const;

export const CARE_LABEL_GRADES = [
  { key: "excellent", nameZh: "优等品" },
  { key: "qualified", nameZh: "合格品" },
  { key: "first", nameZh: "一等品" },
  { key: "pending", nameZh: "待确认" },
] as const;

export const CARE_LABEL_MATERIALS: CareLabelMaterial[] = [
  ["cotton", "棉", "면", "Cotton"], ["polyester", "聚酯纤维", "폴리에스터", "Polyester"], ["nylon", "锦纶", "나일론", "Nylon"], ["viscose", "粘纤", "레이온/비스코스", "Viscose"], ["modal", "莫代尔", "모달", "Modal"], ["spandex", "氨纶", "스판덱스", "Spandex"], ["acrylic", "腈纶", "아크릴", "Acrylic"], ["wool", "羊毛", "울", "Wool"], ["cashmere", "羊绒", "캐시미어", "Cashmere"], ["linen", "亚麻", "린넨", "Linen"], ["silk", "桑蚕丝", "실크", "Silk"], ["hemp", "大麻纤维", "헴프", "Hemp"], ["tencel", "莱赛尔", "텐셀", "Lyocell/Tencel"], ["acetate", "醋纤", "아세테이트", "Acetate"], ["polyamide", "聚酰胺纤维", "폴리아미드", "Polyamide"], ["leather", "天然皮革", "천연가죽", "Leather"], ["pu", "聚氨酯纤维/人造革", "PU/인조가죽", "PU"], ["down", "羽绒", "다운", "Down"], ["feather", "羽毛", "깃털", "Feather"], ["other", "其他纤维", "기타 섬유", "Other"],
].map(([key, nameZh, nameKo, nameEn]) => ({ key, nameZh, nameKo, nameEn }));

export const CARE_LABEL_PUBLIC_FIELD_OPTIONS = [
  ["name", "产品名称"], ["brand", "品牌"], ["category", "类别"], ["size", "号型"], ["specification", "规格"], ["composition", "成分"], ["standard", "执行标准"], ["safety", "安全技术类别"], ["grade", "产品等级"], ["care", "护理说明"], ["wash", "水洗"], ["bleach", "漂白"], ["dry", "干燥"], ["iron", "熨烫"], ["professional", "专业维护"], ["notes", "注意事项"],
] as const;

export function recommendedCareLabelSettings(data: Pick<CareLabelData, "name" | "category" | "composition" | "filling">) {
  const text = [data.name, data.category, data.composition, data.filling].filter(Boolean).join(" ").toLowerCase();
  const standard = CARE_LABEL_STANDARDS.find((item) => item.appliesTo.some((term) => text.includes(term.toLowerCase()))) ?? CARE_LABEL_STANDARDS[2];
  const safety = /羽绒|down|패딩|코트|大衣|皮革|가죽|外套/.test(text) ? CARE_LABEL_SAFETY_CATEGORIES[1] : CARE_LABEL_SAFETY_CATEGORIES[0];
  return { executionStandardKey: standard.key, standard: standard.nameZh, safetyCategoryKey: safety.key, safety: safety.nameZh, productGradeKey: "qualified", grade: "合格品" };
}

export function defaultPublicFields(data: CareLabelData) {
  return data.publicFields !== undefined ? data.publicFields.filter((key) => key !== "lining" && key !== "filling") : ["name", "brand", "category", "size", "composition", "standard", "safety", "grade", "care", "wash", "bleach", "dry", "iron", "professional"];
}

export type CareLabelSymbol = {
  id: number;
  key: string;
  nameZh: string;
  descriptionZh: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: number;
};

export type CareLabelSymbolAssignment = {
  symbolId: number;
  sortOrder: number;
};

export const CARE_LABEL_FIELDS = [
  "brand", "name", "category", "size", "specification", "composition", "lining", "filling", "origin", "dealer", "address", "standard", "safety", "grade", "care", "bleach", "dry", "iron", "professional", "notes", "wash", "phone", "classification",
] as const;

export const DEFAULT_CARE_SYMBOLS = [
  { key: "wash", nameZh: "水洗", descriptionZh: "按商品洗标确认水洗方式。", sortOrder: 1 },
  { key: "bleach", nameZh: "漂白", descriptionZh: "确认是否允许使用漂白剂。", sortOrder: 2 },
  { key: "dry", nameZh: "干燥", descriptionZh: "按商品洗标选择晾干或干燥方式。", sortOrder: 3 },
  { key: "iron", nameZh: "熨烫", descriptionZh: "按商品洗标确认熨烫温度和方式。", sortOrder: 4 },
  { key: "professional", nameZh: "专业维护", descriptionZh: "需要专业护理时请交由专业人员处理。", sortOrder: 5 },
] as const;

/** Final public origin used by all printed and downloadable Care Labels QR codes. Product edits never change this ID-based path. */
export const CARE_LABEL_PUBLIC_ORIGIN = "https://lesoulai-xabhv8qd.manus.space";

export function careLabelProductUrl(id: string) {
  if (!/^LS-\d{4}$/.test(id)) throw new Error("CARE_LABEL_ID_INVALID");
  return `${CARE_LABEL_PUBLIC_ORIGIN}/product/${id}`;
}

export function normalizeCareLabelData(value: unknown): CareLabelData {
  if (!value || typeof value !== "object") throw new Error("CARE_LABEL_DATA_INVALID");
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !/^LS-\d{4}$/.test(record.id)) throw new Error("CARE_LABEL_ID_INVALID");
  return record as CareLabelData;
}

export function localizedCareLabelText(locale: "ko" | "zh" | "en") {
  return locale === "ko"
    ? { catalog: "LESOUL 케어 라벨", title: "상품 케어 정보", body: "중국어 원문 상품 정보와 세탁·안전 안내를 그대로 확인하세요.", search: "상품 번호·브랜드·상품명 검색", all: "전체", standard: "执行标准", safety: "安全类别", grade: "等级", composition: "成分与材质", care: "护理方式", seller: "销售与来源", symbol: "护理符号", qr: "매장 문의 QR", noQr: "관리자가 아직 위챗 QR을 등록하지 않았습니다.", admin: "케어 라벨 관리", save: "저장", saved: "저장됨", upload: "이미지 업로드", print: "인쇄", back: "목록으로", loading: "불러오는 중…", noResult: "일치하는 상품이 없습니다." }
    : locale === "zh"
      ? { catalog: "LESOUL 洗标资料", title: "商品洗标资料", body: "保留原始中文商品资料、护理、安全分类和等级信息。", search: "搜索商品编号、品牌或名称", all: "全部", standard: "执行标准", safety: "安全类别", grade: "等级", composition: "成分与材质", care: "护理方式", seller: "销售与来源", symbol: "护理符号", qr: "店铺微信二维码", noQr: "管理员尚未上传微信二维码。", admin: "洗标管理", save: "保存", saved: "已保存", upload: "上传图片", print: "打印", back: "返回列表", loading: "加载中…", noResult: "没有匹配的商品。" }
      : { catalog: "LESOUL CARE LABELS", title: "Product care information", body: "Original Chinese product, care, safety, and grade information is preserved.", search: "Search product ID, brand, or name", all: "All", standard: "Execution standard", safety: "Safety category", grade: "Grade", composition: "Composition", care: "Care instructions", seller: "Seller & origin", symbol: "Care symbols", qr: "Store WeChat QR", noQr: "The administrator has not uploaded a WeChat QR yet.", admin: "Care Labels Admin", save: "Save", saved: "Saved", upload: "Upload image", print: "Print", back: "Back to catalog", loading: "Loading…", noResult: "No matching products." };
}
