import type { Background, InsertUser, Pose, Product } from "../drizzle/schema";

const imageSet = [
  "/manus-storage/editorial-cafe_f970ce23.jpg",
  "/manus-storage/quiet-luxury_0829ae9d.jpg",
  "/manus-storage/minimalist-lookbook_87fea9ec.jpg",
];

type SeedProductBase = Omit<Product, "id" | "createdAt" | "updatedAt" | "brand" | "displayCategoryId" | "images" | "imageViews" | "fabric" | "texture" | "fit" | "length" | "width" | "details" | "neckline" | "sleeve" | "purchasePlatform" | "stylistMetadata" | "nameEn" | "nameKo" | "nameZh" | "descriptionEn" | "descriptionKo" | "descriptionZh" | "lookbookPrompt" | "priceOriginal" | "productType" | "setComponents" | "normalDiscountPercent" | "vipDiscountPercent" | "discountRate" | "priceSale" | "saleEnabled" | "discountSeasonEnabled" | "discountOnePercent" | "discountTwoPercent" | "discountThreePercent" | "discountFourPlusPercent" | "momentCouponEnabled" | "momentCouponCode" | "momentCouponPercent" | "purchaseQrUrl" | "purchaseQrUpdatedAt" | "isFeatured" | "featuredPriority" | "catalogTier" | "garmentMeasurements" | "sizeOptions" | "catalogDisplay" | "stretchLevel" | "isActive" | "availabilityStatus" | "vipEarlyAccess" | "isNew" | "newArrivalAt" | "inventoryQuantity">;
type GarmentSpecifications = Pick<Product, "fabric" | "texture" | "fit" | "length" | "width" | "details" | "neckline" | "sleeve">;
const categoryMeasurements: Record<Product["category"], { garmentMeasurements: NonNullable<Product["garmentMeasurements"]>; stretchLevel: Product["stretchLevel"] }> = {
  top: { garmentMeasurements: { shoulderCm: 40, bustCm: 98, sleeveCm: 58, totalLengthCm: 60 }, stretchLevel: "low" },
  outer: { garmentMeasurements: { shoulderCm: 42, bustCm: 106, sleeveCm: 60, totalLengthCm: 72 }, stretchLevel: "none" },
  bottom: { garmentMeasurements: { waistCm: 76, hipCm: 102, riseCm: 30, thighCm: 62, inseamCm: 72, totalLengthCm: 101 }, stretchLevel: "low" },
  dress: { garmentMeasurements: { shoulderCm: 39, bustCm: 96, waistCm: 78, hipCm: 106, sleeveCm: 56, totalLengthCm: 118 }, stretchLevel: "low" },
  shoes: { garmentMeasurements: {}, stretchLevel: "none" },
  bag: { garmentMeasurements: {}, stretchLevel: "none" },
};

const rawDemoProducts: SeedProductBase[] = [
  { name: "LESOUL 시그니처 실크 셔츠", category: "top", season: "봄,가을", color: "아이보리", style: "출근,데이트,고급", status: "in_stock", price: 593, imageUrl: imageSet[0], description: "매끈한 결감과 여유로운 실루엣의 아이보리 셔츠", purchaseUrl: "https://example.com/lesoul/silk-shirt" },
  { name: "LESOUL 릴랙스 캐시미어 니트", category: "top", season: "가을,겨울", color: "베이지", style: "캐주얼,출근,고급", status: "in_stock", price: 731, imageUrl: imageSet[1], description: "부드럽게 떨어지는 캐시미어 블렌드 니트", purchaseUrl: "https://example.com/lesoul/cashmere-knit" },
  { name: "LESOUL 모던 리브 탑", category: "top", season: "봄,여름", color: "블랙", style: "캐주얼,데이트", status: "in_stock", price: 317, imageUrl: imageSet[2], description: "단독 또는 재킷 이너로 좋은 슬림 리브 탑", purchaseUrl: "https://example.com/lesoul/rib-top" },
  { name: "LESOUL 프렌치 블라우스", category: "top", season: "봄,여름", color: "화이트", style: "데이트,고급", status: "in_stock", price: 547, imageUrl: imageSet[0], description: "섬세한 드레이프가 돋보이는 프렌치 블라우스", purchaseUrl: "https://example.com/lesoul/french-blouse" },
  { name: "LESOUL 소프트 울 팬츠", category: "bottom", season: "가을,겨울", color: "그레이", style: "출근,고급", status: "in_stock", price: 685, imageUrl: imageSet[1], description: "정제된 원턱 디테일의 울 블렌드 팬츠", purchaseUrl: "https://example.com/lesoul/wool-pants" },
  { name: "LESOUL 롱라인 슬랙스", category: "bottom", season: "봄,가을", color: "블랙", style: "출근,데이트,고급", status: "in_stock", price: 639, imageUrl: imageSet[2], description: "다리를 길어 보이게 하는 세미와이드 슬랙스", purchaseUrl: "https://example.com/lesoul/long-slacks" },
  { name: "LESOUL 샌드 베이지 스커트", category: "bottom", season: "봄,여름", color: "베이지", style: "데이트,고급", status: "in_stock", price: 501, imageUrl: imageSet[0], description: "자연스럽게 흐르는 A라인 미디 스커트", purchaseUrl: "https://example.com/lesoul/sand-skirt" },
  { name: "LESOUL 데님 스트레이트 팬츠", category: "bottom", season: "봄,여름,가을", color: "블루", style: "캐주얼,데이트", status: "in_stock", price: 455, imageUrl: imageSet[1], description: "절제된 워싱의 클래식 스트레이트 데님", purchaseUrl: "https://example.com/lesoul/denim" },
  { name: "LESOUL 테일러드 블레이저", category: "outer", season: "봄,가을", color: "베이지", style: "출근,데이트,고급", status: "in_stock", price: 1053, imageUrl: imageSet[2], description: "균형 잡힌 어깨선의 더블 테일러드 재킷", purchaseUrl: "https://example.com/lesoul/blazer" },
  { name: "LESOUL 클래식 트렌치", category: "outer", season: "봄,가을", color: "베이지", style: "출근,데이트,고급", status: "in_stock", price: 1283, imageUrl: imageSet[0], description: "시간이 지나도 멋스러운 클래식 트렌치코트", purchaseUrl: "https://example.com/lesoul/trench" },
  { name: "LESOUL 소프트 울 코트", category: "outer", season: "가을,겨울", color: "브라운", style: "출근,데이트,고급", status: "in_stock", price: 1513, imageUrl: imageSet[1], description: "은은한 브라운 톤의 미니멀 싱글 코트", purchaseUrl: "https://example.com/lesoul/wool-coat" },
  { name: "LESOUL 크롭 트위드 재킷", category: "outer", season: "봄,가을", color: "아이보리", style: "데이트,고급", status: "in_stock", price: 1145, imageUrl: imageSet[2], description: "섬세한 텍스처의 아이보리 트위드 재킷", purchaseUrl: "https://example.com/lesoul/tweed" },
  { name: "LESOUL 헤리티지 셔츠 드레스", category: "dress", season: "봄,가을", color: "아이보리", style: "출근,데이트,고급", status: "in_stock", price: 1007, imageUrl: imageSet[0], description: "벨트 디테일로 실루엣을 조절하는 셔츠 드레스", purchaseUrl: "https://example.com/lesoul/shirt-dress" },
  { name: "LESOUL 새틴 슬립 드레스", category: "dress", season: "여름", color: "블랙", style: "데이트,고급", status: "in_stock", price: 869, imageUrl: imageSet[1], description: "광택감이 우아한 미디 슬립 드레스", purchaseUrl: "https://example.com/lesoul/satin-dress" },
  { name: "LESOUL 리넨 랩 드레스", category: "dress", season: "여름", color: "베이지", style: "캐주얼,데이트", status: "in_stock", price: 823, imageUrl: imageSet[2], description: "가볍고 여유로운 리넨 랩 드레스", purchaseUrl: "https://example.com/lesoul/linen-dress" },
  { name: "LESOUL 윈터 모헤어 니트", category: "top", season: "겨울", color: "핑크", style: "캐주얼,데이트", status: "sold_out", price: 639, imageUrl: imageSet[0], description: "품절 처리된 모헤어 니트", purchaseUrl: "https://example.com/lesoul/mohair" },
  { name: "LESOUL 코코아 플리츠 스커트", category: "bottom", season: "가을,겨울", color: "브라운", style: "데이트,고급", status: "in_stock", price: 547, imageUrl: imageSet[1], description: "고운 주름이 살아있는 코코아 플리츠 스커트", purchaseUrl: "https://example.com/lesoul/pleats" },
  { name: "LESOUL 오버사이즈 레더 재킷", category: "outer", season: "가을", color: "블랙", style: "캐주얼,데이트", status: "sold_out", price: 1375, imageUrl: imageSet[2], description: "품절 처리된 레더 아우터", purchaseUrl: "https://example.com/lesoul/leather" },
  { name: "LESOUL Soft Leather Mary Jane", category: "shoes", season: "봄,가을", color: "블랙", style: "DAILY,CHIC,MINIMAL", status: "in_stock", price: 869, imageUrl: imageSet[0], description: "A refined low-profile Mary Jane for a polished daily look.", purchaseUrl: "https://example.com/lesoul/mary-jane" },
  { name: "LESOUL Mini Frame Bag", category: "bag", season: "봄,여름,가을,겨울", color: "브라운", style: "ELEGANT,CHIC,MINIMAL", status: "in_stock", price: 1007, imageUrl: imageSet[2], description: "A structured mini bag with an understated quiet-luxury finish.", purchaseUrl: "https://example.com/lesoul/frame-bag" },
];

const categorySpecifications: Record<Product["category"], GarmentSpecifications> = {
  top: { fabric: "Cotton Blend", texture: "Smooth", fit: "Regular", length: "Standard", width: "Standard", details: "Clean construction with carefully finished seams", neckline: "Crew", sleeve: "Long" },
  bottom: { fabric: "Wool Blend", texture: "Matte", fit: "Regular", length: "Full", width: "Straight", details: "Tailored waistband and refined hem", neckline: null, sleeve: null },
  outer: { fabric: "Wool Blend", texture: "Structured", fit: "Regular", length: "Long", width: "Straight", details: "Defined shoulder line and finished front closure", neckline: "Collared", sleeve: "Long" },
  dress: { fabric: "Silk Blend", texture: "Flowy", fit: "Relaxed", length: "Midi", width: "Standard", details: "Carefully constructed silhouette with finished seams", neckline: "V-neck", sleeve: "Long" },
  shoes: { fabric: "Soft Leather", texture: "Smooth", fit: "Fitted", length: "Standard", width: "Standard", details: "Low-profile sole with rounded toe and refined strap", neckline: null, sleeve: null },
  bag: { fabric: "Grained Leather", texture: "Structured", fit: "Regular", length: "Mini", width: "Standard", details: "Structured frame, top handle, and polished hardware", neckline: null, sleeve: null },
};

function garmentSpecifications(product: SeedProductBase): GarmentSpecifications {
  const base = categorySpecifications[product.category];
  const name = product.name.toLowerCase();
  if (name.includes("실크") || name.includes("satin")) return { ...base, fabric: name.includes("satin") ? "Satin" : "Silk", texture: "Glossy", fit: "Relaxed", details: name.includes("드레스") ? "Bias-cut drape with delicate straps" : "Soft drape with refined hidden placket", neckline: name.includes("드레스") ? "Scoop" : "V-neck" };
  if (name.includes("캐시미어") || name.includes("모헤어")) return { ...base, fabric: name.includes("모헤어") ? "Mohair Blend" : "Cashmere Blend", texture: "Soft", fit: "Relaxed", details: "Soft knit construction with naturally brushed surface", neckline: "Crew" };
  if (name.includes("리브")) return { ...base, fabric: "Wool Blend", texture: "Ribbed", fit: "Slim", details: "Fine vertical ribbing with form-following construction", neckline: "Crew" };
  if (name.includes("데님")) return { ...base, fabric: "Denim", texture: "Textured", fit: "Relaxed", length: "Full", width: "Straight", details: "Classic straight leg, controlled wash, full finished hem" };
  if (name.includes("플리츠")) return { ...base, fabric: "Polyester Blend", texture: "Textured", fit: "Regular", length: "Midi", width: "Flared", details: "Precisely pressed pleats with fluid movement" };
  if (name.includes("스커트")) return { ...base, fabric: "Linen Blend", texture: "Flowy", fit: "Regular", length: "Midi", width: "Flared", details: "A-line silhouette with clean waistband" };
  if (name.includes("트위드")) return { ...base, fabric: "Tweed", texture: "Textured", fit: "Fitted", length: "Cropped", width: "Standard", details: "Textured weave with a cropped tailored hem", neckline: "Collared" };
  if (name.includes("레더")) return { ...base, fabric: "Leather", texture: "Matte", fit: "Oversized", details: "Supple leather panels, defined collar, finished edge details", neckline: "Collared" };
  if (name.includes("리넨")) return { ...base, fabric: "Linen", texture: "Crisp", fit: "Relaxed", details: "Wrap construction with natural linen drape", neckline: "V-neck" };
  if (name.includes("셔츠 드레스")) return { ...base, fabric: "Cotton Blend", texture: "Smooth", fit: "Regular", length: "Midi", details: "Button front, pointed collar, adjustable belt", neckline: "Collared" };
  if (name.includes("블레이저")) return { ...base, fabric: "Wool Blend", texture: "Structured", fit: "Regular", details: "Double-breasted front and balanced structured shoulders", neckline: "Collared" };
  if (name.includes("트렌치")) return { ...base, fabric: "Cotton Gabardine", texture: "Crisp", fit: "Regular", length: "Long", details: "Storm flap, belt, and classic tailored collar", neckline: "Collared" };
  return base;
}

export const demoProducts: Omit<Product, "id" | "createdAt" | "updatedAt" | "purchaseQrUrl" | "purchaseQrUpdatedAt">[] = rawDemoProducts.map((product) => {
  const specifications = garmentSpecifications(product);
  const fitData = categoryMeasurements[product.category];
  return {
    ...product,
    displayCategoryId: null,
    lookbookPrompt: null,
    inventoryQuantity: product.status === "sold_out" ? 0 : 10,
    isActive: 1,
    availabilityStatus: product.status === "sold_out" ? "SOLD_OUT" as const : "IN_STOCK" as const,
    vipEarlyAccess: 0,
    isNew: 0,
    newArrivalAt: null,
    catalogDisplay: null,
    brand: "LESOUL",
    nameEn: product.name,
    nameKo: product.name,
    nameZh: product.name,
    descriptionEn: product.description,
    descriptionKo: product.description,
    descriptionZh: product.description,
    priceOriginal: product.price,
    productType: "SINGLE" as const,
    setComponents: null,
    normalDiscountPercent: 17,
    vipDiscountPercent: 20,
    discountRate: null,
    priceSale: null,
    saleEnabled: 0,
    discountSeasonEnabled: 0,
    discountOnePercent: 20,
    discountTwoPercent: 25,
    discountThreePercent: 30,
    discountFourPlusPercent: 35,
    momentCouponEnabled: 0,
    momentCouponCode: null,
    momentCouponPercent: 0,
    isFeatured: product.status === "in_stock" ? 1 : 0,
    featuredPriority: product.status === "in_stock" ? 100 - rawDemoProducts.indexOf(product) : 0,
    catalogTier: "full",
    garmentMeasurements: fitData.garmentMeasurements,
    sizeOptions: null,
    stretchLevel: fitData.stretchLevel,
    ...specifications,
    images: [product.imageUrl],
    imageViews: { front: { original: product.imageUrl, studioCut: product.imageUrl, thumbnail: product.imageUrl } },
    purchasePlatform: "LESOUL Store",
    stylistMetadata: {
      mainColor: product.color,
      materialAppearance: specifications.texture ?? undefined,
      silhouette: specifications.width ?? undefined,
      formality: product.style.includes("고급") || product.style.includes("출근") ? 4 : 2,
      fashionMood: product.style.split(",").map((tag) => tag.trim()),
      recommendedStyles: [],
      compatibleColors: [],
      source: "manual",
    },
  };
});

export const demoPoses: Omit<Pose, "id" | "createdAt">[] = [
  { name: "Natural Standing", promptKeyword: "standing naturally, relaxed confidence, full body", imageUrl: null },
  { name: "Front Model Pose", promptKeyword: "front model pose, poised and confident, full body", imageUrl: null },
  { name: "Side Pose", promptKeyword: "slight side angle, relaxed editorial pose, full body", imageUrl: null },
  { name: "Walking", promptKeyword: "walking naturally, candid movement, full body", imageUrl: null },
  { name: "Hand in Pocket", promptKeyword: "one hand in pocket, relaxed editorial stance", imageUrl: null },
  { name: "Elegant Fashion Pose", promptKeyword: "elegant high-fashion stance, editorial, full body", imageUrl: null },
];

export const demoBackgrounds: Omit<Background, "id" | "createdAt">[] = [
  { name: "서울 카페", promptKeyword: "cozy Seoul cafe, warm window light, quiet luxury", styleTags: "캐주얼,데이트", imageUrl: imageSet[0] },
  { name: "갤러리", promptKeyword: "modern art gallery, clean white walls, editorial light", styleTags: "출근,고급", imageUrl: imageSet[2] },
  { name: "한강 공원", promptKeyword: "Han River park at sunset, soft natural light", styleTags: "캐주얼,데이트", imageUrl: imageSet[1] },
  { name: "성수동 거리", promptKeyword: "trendy Seongsu street, textured urban backdrop", styleTags: "캐주얼,데이트", imageUrl: imageSet[2] },
  { name: "도쿄 거리", promptKeyword: "Tokyo street with restrained neon evening atmosphere", styleTags: "캐주얼,데이트", imageUrl: imageSet[1] },
  { name: "파리 카페", promptKeyword: "Parisian cafe terrace, romantic morning light", styleTags: "데이트,고급", imageUrl: imageSet[0] },
  { name: "럭셔리 호텔 로비", promptKeyword: "luxury hotel lobby, warm stone and brass", styleTags: "출근,고급", imageUrl: imageSet[1] },
  { name: "꽃집 앞", promptKeyword: "charming flower shop front, soft color palette", styleTags: "데이트,캐주얼", imageUrl: imageSet[2] },
  { name: "미니멀 스튜디오", promptKeyword: "minimal warm-white studio, clean fashion set", styleTags: "출근,고급,데이트", imageUrl: imageSet[1] },
  { name: "제주 바닷가", promptKeyword: "Jeju seaside, airy natural daylight", styleTags: "캐주얼,데이트", imageUrl: imageSet[0] },
];
