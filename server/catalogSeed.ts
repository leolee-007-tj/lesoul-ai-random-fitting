import type { Background, InsertUser, Pose, Product } from "../drizzle/schema";

const imageSet = [
  "/manus-storage/editorial-cafe_f970ce23.jpg",
  "/manus-storage/quiet-luxury_0829ae9d.jpg",
  "/manus-storage/minimalist-lookbook_87fea9ec.jpg",
];

export const demoProducts: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
  { name: "LESOUL 시그니처 실크 셔츠", category: "top", season: "봄,가을", color: "아이보리", style: "출근,데이트,고급", status: "in_stock", price: 129000, imageUrl: imageSet[0], description: "매끈한 결감과 여유로운 실루엣의 아이보리 셔츠", purchaseUrl: "https://example.com/lesoul/silk-shirt" },
  { name: "LESOUL 릴랙스 캐시미어 니트", category: "top", season: "가을,겨울", color: "베이지", style: "캐주얼,출근,고급", status: "in_stock", price: 159000, imageUrl: imageSet[1], description: "부드럽게 떨어지는 캐시미어 블렌드 니트", purchaseUrl: "https://example.com/lesoul/cashmere-knit" },
  { name: "LESOUL 모던 리브 탑", category: "top", season: "봄,여름", color: "블랙", style: "캐주얼,데이트", status: "in_stock", price: 69000, imageUrl: imageSet[2], description: "단독 또는 재킷 이너로 좋은 슬림 리브 탑", purchaseUrl: "https://example.com/lesoul/rib-top" },
  { name: "LESOUL 프렌치 블라우스", category: "top", season: "봄,여름", color: "화이트", style: "데이트,고급", status: "in_stock", price: 119000, imageUrl: imageSet[0], description: "섬세한 드레이프가 돋보이는 프렌치 블라우스", purchaseUrl: "https://example.com/lesoul/french-blouse" },
  { name: "LESOUL 소프트 울 팬츠", category: "bottom", season: "가을,겨울", color: "그레이", style: "출근,고급", status: "in_stock", price: 149000, imageUrl: imageSet[1], description: "정제된 원턱 디테일의 울 블렌드 팬츠", purchaseUrl: "https://example.com/lesoul/wool-pants" },
  { name: "LESOUL 롱라인 슬랙스", category: "bottom", season: "봄,가을", color: "블랙", style: "출근,데이트,고급", status: "in_stock", price: 139000, imageUrl: imageSet[2], description: "다리를 길어 보이게 하는 세미와이드 슬랙스", purchaseUrl: "https://example.com/lesoul/long-slacks" },
  { name: "LESOUL 샌드 베이지 스커트", category: "bottom", season: "봄,여름", color: "베이지", style: "데이트,고급", status: "in_stock", price: 109000, imageUrl: imageSet[0], description: "자연스럽게 흐르는 A라인 미디 스커트", purchaseUrl: "https://example.com/lesoul/sand-skirt" },
  { name: "LESOUL 데님 스트레이트 팬츠", category: "bottom", season: "봄,여름,가을", color: "블루", style: "캐주얼,데이트", status: "in_stock", price: 99000, imageUrl: imageSet[1], description: "절제된 워싱의 클래식 스트레이트 데님", purchaseUrl: "https://example.com/lesoul/denim" },
  { name: "LESOUL 테일러드 블레이저", category: "outer", season: "봄,가을", color: "베이지", style: "출근,데이트,고급", status: "in_stock", price: 229000, imageUrl: imageSet[2], description: "균형 잡힌 어깨선의 더블 테일러드 재킷", purchaseUrl: "https://example.com/lesoul/blazer" },
  { name: "LESOUL 클래식 트렌치", category: "outer", season: "봄,가을", color: "베이지", style: "출근,데이트,고급", status: "in_stock", price: 279000, imageUrl: imageSet[0], description: "시간이 지나도 멋스러운 클래식 트렌치코트", purchaseUrl: "https://example.com/lesoul/trench" },
  { name: "LESOUL 소프트 울 코트", category: "outer", season: "가을,겨울", color: "브라운", style: "출근,데이트,고급", status: "in_stock", price: 329000, imageUrl: imageSet[1], description: "은은한 브라운 톤의 미니멀 싱글 코트", purchaseUrl: "https://example.com/lesoul/wool-coat" },
  { name: "LESOUL 크롭 트위드 재킷", category: "outer", season: "봄,가을", color: "아이보리", style: "데이트,고급", status: "in_stock", price: 249000, imageUrl: imageSet[2], description: "섬세한 텍스처의 아이보리 트위드 재킷", purchaseUrl: "https://example.com/lesoul/tweed" },
  { name: "LESOUL 헤리티지 셔츠 드레스", category: "dress", season: "봄,가을", color: "아이보리", style: "출근,데이트,고급", status: "in_stock", price: 219000, imageUrl: imageSet[0], description: "벨트 디테일로 실루엣을 조절하는 셔츠 드레스", purchaseUrl: "https://example.com/lesoul/shirt-dress" },
  { name: "LESOUL 새틴 슬립 드레스", category: "dress", season: "여름", color: "블랙", style: "데이트,고급", status: "in_stock", price: 189000, imageUrl: imageSet[1], description: "광택감이 우아한 미디 슬립 드레스", purchaseUrl: "https://example.com/lesoul/satin-dress" },
  { name: "LESOUL 리넨 랩 드레스", category: "dress", season: "여름", color: "베이지", style: "캐주얼,데이트", status: "in_stock", price: 179000, imageUrl: imageSet[2], description: "가볍고 여유로운 리넨 랩 드레스", purchaseUrl: "https://example.com/lesoul/linen-dress" },
  { name: "LESOUL 윈터 모헤어 니트", category: "top", season: "겨울", color: "핑크", style: "캐주얼,데이트", status: "sold_out", price: 139000, imageUrl: imageSet[0], description: "품절 처리된 모헤어 니트", purchaseUrl: "https://example.com/lesoul/mohair" },
  { name: "LESOUL 코코아 플리츠 스커트", category: "bottom", season: "가을,겨울", color: "브라운", style: "데이트,고급", status: "in_stock", price: 119000, imageUrl: imageSet[1], description: "고운 주름이 살아있는 코코아 플리츠 스커트", purchaseUrl: "https://example.com/lesoul/pleats" },
  { name: "LESOUL 오버사이즈 레더 재킷", category: "outer", season: "가을", color: "블랙", style: "캐주얼,데이트", status: "sold_out", price: 299000, imageUrl: imageSet[2], description: "품절 처리된 레더 아우터", purchaseUrl: "https://example.com/lesoul/leather" },
];

export const demoPoses: Omit<Pose, "id" | "createdAt">[] = [
  { name: "정면", promptKeyword: "standing front view, confident, full body", imageUrl: null },
  { name: "살짝 옆으로", promptKeyword: "slight side angle, relaxed, full body", imageUrl: null },
  { name: "걷는 포즈", promptKeyword: "walking naturally, candid movement, full body", imageUrl: null },
  { name: "한 손 주머니", promptKeyword: "one hand in pocket, relaxed editorial stance", imageUrl: null },
  { name: "앉은 포즈", promptKeyword: "sitting elegantly, fashion editorial", imageUrl: null },
  { name: "모델 포즈", promptKeyword: "high fashion model stance, editorial, full body", imageUrl: null },
  { name: "뒤돌아보기", promptKeyword: "looking back over shoulder, full body", imageUrl: null },
  { name: "팔짱", promptKeyword: "arms crossed, sophisticated editorial posture", imageUrl: null },
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
