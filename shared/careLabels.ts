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
  [key: string]: unknown;
};

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
