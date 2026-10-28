import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  ImagePlus,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { isStylistEligible } from "../../../shared/productAvailability";

type Locale = "ko" | "zh" | "en";
type GarmentGroup = "all" | "top" | "bottom" | "outer" | "dress" | "accessory";
type PresentationStyle = "east_asian_female" | "western_female";
const MAX_CLOTHING_ITEMS = 3;
const MAX_LOOKBOOK_ITEMS = 20;

const sceneCopy = {
  ko: {
    studio_front: "스튜디오 정면 전신",
    studio_side: "스튜디오 측면 패션 샷",
    studio_full: "스튜디오 전신 에디토리얼",
    store_work: "매장에서 옷을 정리하는 장면",
    store_customer: "매장에서 손님을 응대하는 장면",
    store_walk: "매장 안을 걷는 장면",
  },
  zh: {
    studio_front: "工作室正面全身",
    studio_side: "工作室侧面时装照",
    studio_full: "工作室全身大片",
    store_work: "在店内整理衣架",
    store_customer: "在店内接待顾客",
    store_walk: "在店内走动",
  },
  en: {
    studio_front: "Studio front full-body",
    studio_side: "Studio side fashion shot",
    studio_full: "Studio full-body editorial",
    store_work: "Organizing clothes in store",
    store_customer: "Helping a customer in store",
    store_walk: "Walking through the store",
  },
} as const;

const copy = {
  ko: {
    eyebrow: "STORE DISPLAY AI LOOKBOOK",
    title: "매장 디스플레이 AI 룩북",
    body: "상품별 이미지 또는 실제 등록된 상·하의·외투·원피스·신발·가방 등으로 코디 이미지를 생성합니다. 의류는 최대 3개, 액세서리는 별도로 추가할 수 있으며 승인된 이미지만 매장 전시에 사용됩니다.",
    choose: "상품 선택",
    count: "생성 장수",
    randomOutfit: "랜덤 코디 생성",
    separates: "상의 + 하의 (+ 외투)",
    topOnly: "상의만",
    bottomOnly: "하의만",
    outerOnly: "외투만",
    topBottom: "상의 + 하의",
    topOuter: "상의 + 외투",
    bottomOuter: "하의 + 외투",
    topBottomOuter: "상의 + 하의 + 외투",
    dress: "원피스",
    dressOuter: "원피스 (+ 외투)",
    topTab: "상의",
    bottomTab: "하의",
    outerTab: "외투",
    planning: "코디를 뽑는 중…",
    generate: "생성",
    regenerate: "재생성",
    generating: "이미지 생성 중…",
    empty: "아직 생성된 룩북 이미지가 없습니다.",
    pending: "검토 대기",
    approved: "게시 승인",
    revoke: "승인 취소",
    remove: "삭제",
    generated: "생성 완료",
    progress: "생성 진행률",
    failed: "장 생성 실패",
    composition: "코디 구성",
    presentation: "촬영 스타일",
    koreanStaff: "서양 패션 매거진 스튜디오",
    westernModel: "서양 패션 매거진 스튜디오",
    note: "랜덤 코디는 등록된 상품의 원본 이미지를 각각 참고합니다. 상의·하의·외투·원피스를 임의로 바꾸거나 합치지 않고, 선택된 옷의 색상·실루엣·길이·소매·넥라인·디테일을 보존합니다. 생성 후 관리자가 승인한 이미지에만 매장 전시가 적용됩니다.",
  },
  zh: {
    eyebrow: "STORE DISPLAY AI LOOKBOOK",
    title: "门店展示 AI Lookbook",
    body: "使用真实 AI 图像生成模型，也可以将已登记的上装、下装、外套、连衣裙、鞋履、包袋等组合成搭配。服装最多 3 件，配饰可单独追加，只有批准的图片会用于门店展示。",
    choose: "选择商品",
    count: "生成张数",
    randomOutfit: "生成随机搭配",
    separates: "上装 + 下装（+ 外套）",
    topOnly: "仅上装",
    bottomOnly: "仅下装",
    outerOnly: "仅外套",
    topBottom: "上装 + 下装",
    topOuter: "上装 + 外套",
    bottomOuter: "下装 + 外套",
    topBottomOuter: "上装 + 下装 + 外套",
    dress: "连衣裙",
    dressOuter: "连衣裙 + 外套",
    topTab: "上装",
    bottomTab: "下装",
    outerTab: "外套",
    planning: "正在抽取搭配…",
    generate: "生成",
    regenerate: "重新生成",
    generating: "正在生成…",
    empty: "还没有生成 Lookbook 图片。",
    pending: "待审核",
    approved: "批准发布",
    revoke: "取消批准",
    remove: "删除",
    generated: "生成完成",
    progress: "生成进度",
    failed: "张生成失败",
    composition: "搭配构成",
    presentation: "拍摄风格",
    koreanStaff: "西方时装杂志工作室",
    westernModel: "西方时装杂志工作室",
    note: "随机搭配分别参考已登记商品的原图，不任意替换或合并服装，并保留每件衣服的颜色、轮廓、长度、袖型、领口和细节。只有管理员批准后才会展示。",
  },
  en: {
    eyebrow: "STORE DISPLAY AI LOOKBOOK",
    title: "Store Display AI Lookbook",
    body: "Generate real AI images from registered tops, bottoms, outerwear, dresses, shoes, bags, and other available product types. Use up to 3 clothing pieces plus separate accessories; only approved images appear in the showroom.",
    choose: "Choose a product",
    count: "Image count",
    randomOutfit: "Generate random outfit",
    separates: "Top + bottom (+ outerwear)",
    topOnly: "Top only",
    bottomOnly: "Bottom only",
    outerOnly: "Outerwear only",
    topBottom: "Top + bottom",
    topOuter: "Top + outerwear",
    bottomOuter: "Bottom + outerwear",
    topBottomOuter: "Top + bottom + outerwear",
    dress: "Dress",
    dressOuter: "Dress + outerwear",
    topTab: "Top",
    bottomTab: "Bottom",
    outerTab: "Outerwear",
    planning: "Picking an outfit…",
    generate: "Generate",
    regenerate: "Regenerate",
    generating: "Generating…",
    empty: "No lookbook images generated yet.",
    pending: "Pending review",
    approved: "Approve for display",
    revoke: "Revoke approval",
    remove: "Delete",
    generated: "Generated",
    progress: "Generation progress",
    failed: "failed",
    composition: "Outfit composition",
    presentation: "Photo style",
    koreanStaff: "Western fashion magazine studio",
    westernModel: "Western fashion magazine studio",
    note: "Random outfits use each registered garment image as a separate reference. Do not replace or merge garments, and preserve each selected garment's color, silhouette, length, sleeves, neckline, and visible details. Only approved images are shown in the store display.",
  },
};

function recency(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function groupFor(product: any): Exclude<GarmentGroup, "all"> {
  const text = [
    product.category,
    product.productType,
    product.displayCategory?.name,
    product.displayCategory?.nameKo,
    product.displayCategory?.nameEn,
    product.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/accessor|jewelry|jewel|bag|shoes|shoe|belt|hat|scarf|가방|신발|구두|벨트|모자|스카프|액세서리|악세서리|配饰|鞋|包|腰带|帽|围巾/.test(text)) return "accessory";
  if (/dress|원피스|连衣裙/.test(text)) return "dress";
  if (/outer|coat|jacket|cardigan|외투|아우터|코트|재킷|자켓|外套/.test(text))
    return "outer";
  if (/bottom|skirt|pants|하의|치마|바지|裙|裤/.test(text)) return "bottom";
  return "top";
}

function productKindKey(product: any) {
  return String(
    product.displayCategory?.id ??
      product.displayCategory?.nameKo ??
      product.displayCategory?.name ??
      product.category ??
      "other"
  )
    .trim()
    .toLowerCase();
}

function isLayerBottom(product: any) {
  const text = [
    product.name,
    product.nameKo,
    product.nameZh,
    product.nameEn,
    product.style,
    product.details,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /layer|레이어|겹침|겹쳐|层叠|叠穿/.test(text);
}

export default function DisplayLookbookManager({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const productsQuery = trpc.admin.products.useQuery(undefined, {
    retry: 1,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 3000,
  });
  const purchaseConfig = trpc.purchase.config.useQuery(undefined, {
    staleTime: 60_000,
  });
  const products = productsQuery.data ?? [];
  const [group, setGroup] = useState<string>("all");
  const count = 1;
  const [outfitCart, setOutfitCart] = useState<number[]>([]);
  const [qrOverlayEnabled, setQrOverlayEnabled] = useState(true);
  const [qrOverlaySize, setQrOverlaySize] = useState(96);
  const [qrOverlayLabel, setQrOverlayLabel] = useState("LESOUL · WECHAT");
  const [productId, setProductId] = useState<number | null>(null);
  useEffect(() => {
    const requested =
      typeof window === "undefined"
        ? null
        : Number(
            new URLSearchParams(window.location.search).get("lookbookProduct")
          );
    if (requested !== null && Number.isInteger(requested) && requested > 0)
      setProductId(requested);
  }, []);
  const [backgroundStyle, setBackgroundStyle] = useState<
    "editorial_studio" | "fitting_room_mirror"
  >("editorial_studio");
  const [presentationStyle, setPresentationStyle] =
    useState<PresentationStyle>("western_female");
  const [cartHairLength, setCartHairLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [lookbookTitle, setLookbookTitle] = useState("");
  const [recommendationName, setRecommendationName] = useState("");
  const [stylingRequirements, setStylingRequirements] = useState("");
  const [autoComplete, setAutoComplete] = useState({ top: false, bottom: false, outer: false });
  const [baseLayerColor, setBaseLayerColor] = useState<"black" | "white">("black");
  const [metadataDrafts, setMetadataDrafts] = useState<Record<number, { lookbookTitle: string; recommendationName: string; recommendationReason: string }>>({});
  const [localizedDrafts, setLocalizedDrafts] = useState<Record<number, { titleKo: string; titleZh: string; titleEn: string; reasonKo: string; reasonZh: string; reasonEn: string }>>({});
  const [galleryScope, setGalleryScope] = useState<"selected" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "hidden">("all");
  const [gridColumns, setGridColumns] = useState(2);
  const [previewImage, setPreviewImage] = useState<any | null>(null);
  const filteredProducts = useMemo(() => {
    const sorted = products
      .filter(
        (product: any) =>
          isStylistEligible(product, true)
      )
      .sort(
        (a: any, b: any) =>
          (recency(b.createdAt ?? b.updatedAt) || Number(b.id ?? 0)) -
          (recency(a.createdAt ?? a.updatedAt) || Number(a.id ?? 0))
      );
    return group === "all"
      ? sorted
      : sorted.filter((product: any) => productKindKey(product) === group);
  }, [products, group]);
  const productKinds = useMemo(() => {
    const options = new Map<string, any>();
    products
      .filter(
        (product: any) =>
          isStylistEligible(product, true)
      )
      .forEach((product: any) => {
        const key = productKindKey(product);
        if (!options.has(key)) options.set(key, product);
      });
    return Array.from(options, ([key, product]) => ({ key, product }));
  }, [products]);
  const selected = useMemo(
    () => products.find((product: any) => product.id === productId),
    [products, productId]
  );
  useEffect(() => {
    if (!filteredProducts.some((product: any) => product.id === productId))
      setProductId(filteredProducts[0]?.id ?? null);
  }, [filteredProducts, productId]);
  const imagesQuery = trpc.displayLookbook.adminList.useQuery(
    { productId: productId ?? 0 },
    { enabled: Boolean(productId), retry: 1 }
  );
  const allImagesQuery = trpc.displayLookbook.adminListAll.useQuery(undefined, {
    retry: 1,
  });
  const progressQuery = trpc.displayLookbook.progress.useQuery(
    { productId: productId ?? 0 },
    { enabled: Boolean(productId), refetchInterval: 1000, retry: false }
  );
  const refreshGalleries = () => {
    void imagesQuery.refetch();
    void allImagesQuery.refetch();
  };
  const generateOutfit = trpc.displayLookbook.generateOutfitBatch.useMutation({
    onSuccess: result => {
      setGroup("all");
      setProductId(result.productId);
      refreshGalleries();
    },
    onSettled: () => void progressQuery.refetch(),
  });
  const approve = trpc.displayLookbook.approve.useMutation({
    onSuccess: refreshGalleries,
  });
  const revoke = trpc.displayLookbook.revoke.useMutation({
    onSuccess: refreshGalleries,
  });
  const remove = trpc.displayLookbook.remove.useMutation({
    onSuccess: refreshGalleries,
  });
  const restore = trpc.displayLookbook.restore.useMutation({
    onSuccess: refreshGalleries,
  });
  const updateMetadata = trpc.displayLookbook.updateMetadata.useMutation({
    onSuccess: refreshGalleries,
  });
  const releaseConfig = trpc.admin.releaseConfig.useQuery(undefined, { staleTime: 30_000 });
  const updateReleaseConfig = trpc.admin.updateReleaseConfig.useMutation({
    onSuccess: () => void releaseConfig.refetch(),
  });
  useEffect(() => {
    if (releaseConfig.data?.lookbookGridColumns) setGridColumns(releaseConfig.data.lookbookGridColumns);
  }, [releaseConfig.data?.lookbookGridColumns]);
  const busy = generateOutfit.isPending;
  const imageRows = imagesQuery.data ?? [];
  const allImageRows = allImagesQuery.data ?? [];
  const scopedRows = galleryScope === "all" ? allImageRows : imageRows;
  const visibleRows = scopedRows.filter((image: any) => statusFilter === "all" || statusFilter === "approved" && image.isActive === 1 && image.isApproved === 1 || statusFilter === "pending" && image.isActive === 1 && image.isApproved === 0 || statusFilter === "hidden" && image.isActive === 0);
  const progress = progressQuery.data;
  const approvedCount = imageRows.filter(
    (image: any) => image.isApproved === 1
  ).length;
  const titleFor = (product: any) =>
    locale === "ko"
      ? product.nameKo || product.name
      : locale === "zh"
        ? product.nameZh || product.name
        : product.nameEn || product.name;
  const sceneFor = (image: any) =>
    sceneCopy[locale][
      image.sceneType as keyof (typeof sceneCopy)[typeof locale]
    ] ||
    (locale === "ko"
      ? "매장 스타일 장면"
      : locale === "zh"
        ? "门店场景"
        : "Store scene");
  const compositionFor = (image: any) => {
    if (
      Array.isArray(image.compositionProductIds) &&
      image.compositionProductIds.length
    ) {
      return image.compositionProductIds
        .map((id: number) =>
          titleFor(
            products.find((product: any) => product.id === id) || {
              name: `#${id}`,
            }
          )
        )
        .join(locale === "zh" ? " + " : " + ");
    }
    const anchor = products.find(
      (product: any) => product.id === image.productId
    );
    if (anchor) return titleFor(anchor);
    return (
      image.compositionLabel ||
      (locale === "ko"
        ? "등록 상품"
        : locale === "zh"
          ? "已登记商品"
          : "Registered product")
    );
  };
  const canAddToOutfitCart = (product: any, selectedIds = outfitCart) => {
    if (selectedIds.includes(product.id)) return true;
    if (selectedIds.length >= MAX_LOOKBOOK_ITEMS) return false;
    if (groupFor(product) === "accessory") return true;
    const selectedClothingCount = selectedIds.filter(id => {
      const item = products.find((candidate: any) => candidate.id === id);
      return item && groupFor(item) !== "accessory";
    }).length;
    if (selectedClothingCount >= MAX_CLOTHING_ITEMS) return false;
    if (groupFor(product) !== "bottom") return true;
    const selectedBottoms = selectedIds
      .map(id => products.find((item: any) => item.id === id))
      .filter((item: any) => item && groupFor(item) === "bottom");
    return (
      !selectedBottoms.length ||
      isLayerBottom(product) ||
      selectedBottoms.some(isLayerBottom)
    );
  };
  const toggleOutfitCart = (id: number) =>
    setOutfitCart(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      const product = products.find((item: any) => item.id === id);
      return product && canAddToOutfitCart(product, current)
        ? [...current, id]
        : current;
    });
  const resetOutfitCart = () => setOutfitCart([]);
  const generateCartOutfit = () => {
    if (outfitCart.length >= 1)
      generateOutfit.mutate({
        productIds: outfitCart,
        count: 1,
        presentationStyle,
        modelProfile: { hairLength: cartHairLength },
        backgroundStyle,
        lookbookTitle: lookbookTitle.trim() || null,
        recommendationName: recommendationName.trim() || null,
        stylingRequirements: stylingRequirements.trim(),
        autoComplete,
        baseLayerColor,
      });
  };
  const downloadBrandedImage = async (imageUrl: string, imageId: number) => {
    const qrUrl = purchaseConfig.data?.adminTrialPaymentQrUrl;
    if (!qrOverlayEnabled || !qrUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `lesoul-lookbook-${imageId}.png`;
      link.click();
      return;
    }
    try {
      const [imageResponse, qrResponse] = await Promise.all([
        fetch(imageUrl),
        fetch(qrUrl),
      ]);
      const [imageBlob, qrBlob] = await Promise.all([
        imageResponse.blob(),
        qrResponse.blob(),
      ]);
      const image = await createImageBitmap(imageBlob);
      const qr = await createImageBitmap(qrBlob);
      const footer = Math.max(120, qrOverlaySize + 24);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height + footer;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("CANVAS_UNAVAILABLE");
      context.drawImage(image, 0, 0);
      context.fillStyle = "#ffffff";
      context.fillRect(0, image.height, canvas.width, footer);
      const size = Math.min(qrOverlaySize, canvas.width - 24);
      context.drawImage(
        qr,
        (canvas.width - size) / 2,
        image.height + 12,
        size,
        size
      );
      context.fillStyle = "#241f1b";
      context.font = `${Math.max(12, Math.round(size / 8))}px sans-serif`;
      context.textAlign = "center";
      context.fillText(
        qrOverlayLabel,
        canvas.width / 2,
        image.height + footer - 8
      );
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `lesoul-lookbook-${imageId}-wechat.png`;
      link.click();
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f2eadf]">
          <ImagePlus size={17} />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">
            {text.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{text.title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#70675e]">
            {text.body}
          </p>
        </div>
      </div>{" "}
      <div className="mt-4 rounded-2xl border border-[#eadfd2] bg-[#fffdf9] p-3">
        <p className="text-xs font-bold">
          {locale === "ko"
            ? "대표 배경 선택"
            : locale === "zh"
              ? "选择代表背景"
              : "Choose a signature background"}
        </p>
        <p className="mt-1 text-[10px] text-[#786e63]">
          {locale === "ko"
            ? "단품·랜덤 코디·장바구니 코디에 공통 적용됩니다."
            : locale === "zh"
              ? "应用于单品、随机搭配和购物车搭配。"
              : "Used for single products, random outfits, and cart outfits."}
        </p>
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="group"
          aria-label={
            locale === "ko"
              ? "룩북 배경"
              : locale === "zh"
                ? "Lookbook 背景"
                : "Lookbook background"
          }
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => setBackgroundStyle("editorial_studio")}
            className={`rounded-xl px-3 py-2 text-[11px] font-bold ${backgroundStyle === "editorial_studio" ? "bg-black text-white" : "border border-[#d9d0c5] bg-white text-[#5f554c]"}`}
          >
            {locale === "ko"
              ? "화이트·그레이 매거진 스튜디오"
              : locale === "zh"
                ? "白色·灰色时装杂志工作室"
                : "White/gray fashion magazine studio"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setBackgroundStyle("fitting_room_mirror")}
            className={`rounded-xl px-3 py-2 text-[11px] font-bold ${backgroundStyle === "fitting_room_mirror" ? "bg-black text-white" : "border border-[#d9d0c5] bg-white text-[#5f554c]"}`}
          >
            {locale === "ko"
              ? "피팅룸 거울 셀카"
              : locale === "zh"
                ? "试衣间镜面自拍"
                : "Fitting-room mirror selfie"}
          </button>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-[#eadfd2] bg-[#fffdf9] p-3">
        <p className="text-xs font-bold">
          {locale === "ko"
            ? "여성 모델 선택"
            : locale === "zh"
              ? "选择女模特"
              : "Choose a female model"}
        </p>
        <p className="mt-1 text-[10px] text-[#786e63]">
          {locale === "ko"
            ? "여성복 매장 전용: 남성 모델은 생성되지 않습니다."
            : locale === "zh"
              ? "女装店专用：不会生成男性模特。"
              : "For womenswear only: male models are never generated."}
        </p>
        <div
          className="mt-2 grid grid-cols-2 gap-2"
          role="group"
          aria-label={
            locale === "ko"
              ? "여성 모델 유형"
              : locale === "zh"
                ? "女模特类型"
                : "Female model type"
          }
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => setPresentationStyle("east_asian_female")}
            className={`rounded-xl px-3 py-2 text-[11px] font-bold ${presentationStyle === "east_asian_female" ? "bg-black text-white" : "border border-[#d9d0c5] bg-white text-[#5f554c]"}`}
          >
            {locale === "ko"
              ? "동양 여성"
              : locale === "zh"
                ? "东亚女性"
                : "East Asian woman"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPresentationStyle("western_female")}
            className={`rounded-xl px-3 py-2 text-[11px] font-bold ${presentationStyle === "western_female" ? "bg-black text-white" : "border border-[#d9d0c5] bg-white text-[#5f554c]"}`}
          >
            {locale === "ko"
              ? "서양 여성"
              : locale === "zh"
                ? "西方女性"
                : "Western woman"}
          </button>
        </div>
      </div>{" "}
      <div className="mt-4 rounded-2xl border border-[#eadfd2] bg-[#fffdf9] p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold">
              {locale === "ko"
                ? "코디 장바구니"
                : locale === "zh"
                  ? "搭配购物车"
                  : "Outfit cart"}
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#786e63]">
              {locale === "ko"
                ? "실제 등록된 상품종류별로 골라 담습니다. 의류는 최대 3개, 액세서리는 의류 수와 상관없이 추가할 수 있습니다."
              : locale === "zh"
                  ? "按实际商品类别选择。服装最多 3 件，配饰不受服装数量限制。"
                  : "Choose from the product types that actually exist. Up to 3 clothing pieces; accessories are separate from that limit."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f1e9dd] px-2.5 py-1 text-[10px] font-bold">
              {outfitCart.filter(id => {
                const product = products.find((item: any) => item.id === id);
                return product && groupFor(product) !== "accessory";
              }).length}/{MAX_CLOTHING_ITEMS}
              <span className="ml-1 text-[#8b7d70]">
                +{outfitCart.filter(id => {
                  const product = products.find((item: any) => item.id === id);
                  return product && groupFor(product) === "accessory";
                }).length} {locale === "ko" ? "액세서리" : locale === "zh" ? "配饰" : "accessories"}
              </span>
            </span>
            <button
              type="button"
              onClick={resetOutfitCart}
              disabled={!outfitCart.length || busy}
              className="rounded-lg border border-[#d9d0c5] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#6f655b] disabled:opacity-40"
            >
              {locale === "ko"
                ? "장바구니 초기화"
                : locale === "zh"
                  ? "清空购物车"
                  : "Reset cart"}
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setGroup("all")}
            className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${group === "all" ? "bg-black text-white" : "bg-[#f5f1eb] text-[#6f655b]"}`}
          >
            {locale === "ko" ? "전체" : locale === "zh" ? "全部" : "All"}
          </button>
          {productKinds.map(({ key, product }) => (
            <button
              type="button"
              key={key}
              onClick={() => setGroup(key)}
              className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${group === key ? "bg-black text-white" : "bg-[#f5f1eb] text-[#6f655b]"}`}
            >
              {locale === "ko"
                ? product.displayCategory?.nameKo || product.category || product.nameKo || product.name
                : locale === "zh"
                  ? product.displayCategory?.nameZh || product.category || product.nameZh || product.name
                  : product.displayCategory?.nameEn || product.category || product.nameEn || product.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filteredProducts.map((product: any) => (
            <button
              type="button"
              key={product.id}
              onClick={() => toggleOutfitCart(product.id)}
              disabled={
                !outfitCart.includes(product.id) && !canAddToOutfitCart(product)
              }
              className={`min-w-28 rounded-xl border p-2 text-left ${outfitCart.includes(product.id) ? "border-black bg-[#f1e9dd]" : !canAddToOutfitCart(product) ? "cursor-not-allowed border-[#e5ddd4] bg-[#f1eee9] opacity-50" : "border-[#e1d8ce] bg-white"}`}
            >
              <img
                src={product.imageUrl || product.imageViews?.front?.studioCut}
                alt=""
                className="h-20 w-full rounded-lg object-contain bg-[#f6f2ec]"
              />
              <span className="mt-1 block truncate text-[10px] font-semibold">
                {titleFor(product)}
              </span>
              <span className="text-[9px] text-[#8b7d70]">
                {outfitCart.includes(product.id) ? "✓ " : "+ "}
                {outfitCart.includes(product.id)
                  ? locale === "ko"
                    ? "담김 · 다시 누르면 삭제"
                    : locale === "zh"
                      ? "已加入 · 再次点击删除"
                      : "Added · tap to remove"
                  : !canAddToOutfitCart(product)
                    ? groupFor(product) === "bottom"
                      ? locale === "ko"
                        ? "다른 하의와 중복 선택 불가"
                        : locale === "zh"
                          ? "不能与其他下装重复"
                          : "Another bottom is already selected"
                      : locale === "ko"
                        ? "의류는 최대 3개까지"
                        : locale === "zh"
                          ? "服装最多 3 件"
                          : "Up to 3 clothing pieces"
                    : locale === "ko"
                      ? "담기"
                      : locale === "zh"
                        ? "加入"
                        : "Add"}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f3ed] p-2">
          <span className="text-[10px] font-semibold">
            {locale === "ko"
              ? "장바구니 모델 설정"
              : locale === "zh"
                ? "购物车模特设置"
                : "Cart model settings"}
          </span>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={
              locale === "ko"
                ? "머리 길이"
                : locale === "zh"
                  ? "头发长度"
                  : "Hair length"
            }
          >
            {(["short", "medium", "long"] as const).map(length => (
              <button
                type="button"
                key={length}
                disabled={busy}
                onClick={() => setCartHairLength(length)}
                className={`h-9 rounded-lg px-3 text-[10px] font-bold transition-colors ${cartHairLength === length ? "bg-black text-white" : "border border-[#d9d0c5] bg-white text-[#5f554c]"}`}
              >
                {length === "short"
                  ? locale === "ko"
                    ? "단발머리"
                    : locale === "zh"
                      ? "短发"
                      : "Short"
                  : length === "medium"
                    ? locale === "ko"
                      ? "중간 길이"
                      : locale === "zh"
                        ? "中长发"
                        : "Medium"
                    : locale === "ko"
                      ? "긴 머리"
                      : locale === "zh"
                        ? "长发"
                        : "Long"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-[#e5dbcf] bg-white p-2.5 text-[10px] leading-4">
          <p className="font-bold">
            {locale === "ko" ? "부분별 자동 보완" : locale === "zh" ? "按部位自动补全" : "Automatic completion by section"}
          </p>
          <p className="text-[#897b6d]">
            {locale === "ko" ? "각 항목을 따로 켭니다. 모두 끄면 상의만 선택 시 검정/흰색 이너 하의, 하의만 선택 시 검정/흰색 스포츠브라만 최소로 추가합니다." : locale === "zh" ? "可分别开启。全部关闭时，仅选择上装会添加黑/白内搭下装，仅选择下装会添加黑/白运动文胸。" : "Turn each section on independently. With all toggles off, a top-only look gets a black/white inner bottom and a bottom-only look gets a black/white sports bra as the minimal base layer."}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(["top", "bottom", "outer"] as const).map((section) => (
              <label key={section} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#f7f3ed] px-2 py-2 font-bold">
                <input
                  type="checkbox"
                  checked={autoComplete[section]}
                  disabled={busy}
                  onChange={event => setAutoComplete(current => ({ ...current, [section]: event.target.checked }))}
                />
                {section === "top" ? locale === "ko" ? "상의 자동" : locale === "zh" ? "上装自动" : "Auto top" : section === "bottom" ? locale === "ko" ? "하의 자동" : locale === "zh" ? "下装自动" : "Auto bottom" : locale === "ko" ? "외투 자동" : locale === "zh" ? "外套自动" : "Auto outer"}
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#665b50]">
              {locale === "ko" ? "기본 이너 색상" : locale === "zh" ? "基础内搭颜色" : "Base-layer color"}
            </span>
            {(["black", "white"] as const).map(color => (
              <label key={color} className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#f7f3ed] px-2.5 py-1.5 font-bold">
                <input
                  type="radio"
                  name="lookbook-base-layer-color"
                  value={color}
                  checked={baseLayerColor === color}
                  disabled={busy}
                  onChange={() => setBaseLayerColor(color)}
                />
                {color === "black" ? (locale === "ko" ? "검정" : locale === "zh" ? "黑色" : "Black") : locale === "ko" ? "흰색" : locale === "zh" ? "白色" : "White"}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 rounded-xl border border-[#e5dbcf] bg-white p-2 sm:grid-cols-2">
          {" "}
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-semibold text-[#665b50]">
              {locale === "ko"
                ? "코디 상세 요구사항 (선택)"
                : locale === "zh"
                  ? "搭配详细要求（可选）"
                  : "Detailed styling requirements (optional)"}
            </span>
            <textarea
              value={stylingRequirements}
              onChange={event => setStylingRequirements(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={
                locale === "ko"
                  ? "예: 셔츠의 앞부분만 바지 안에 넣고, 소매는 자연스럽게 걷어 주세요.\n핏·레이어링·포즈 등 원하는 내용을 자유롭게 적어 주세요."
                  : locale === "zh"
                    ? "例如：将衬衫前半部分塞进裤子，袖口自然卷起。可填写版型、叠穿和姿势要求。"
                    : "e.g. Half-tuck the shirt into the trousers and roll the sleeves naturally. Add fit, layering, or pose preferences."
              }
              className="mt-1 w-full resize-y rounded-lg border border-[#ded6cc] px-2 py-2 text-[11px] leading-4"
            />
            <span className="mt-1 block text-right text-[9px] text-[#9a8d80]">
              {stylingRequirements.length}/1000
            </span>
          </label>{" "}
          <label className="block">
            <span className="text-[10px] font-semibold text-[#665b50]">
              {locale === "ko"
                ? "룩북 코디 이름 (선택)"
                : locale === "zh"
                  ? "Lookbook 搭配名称（可选）"
                  : "Lookbook outfit name (optional)"}
            </span>
            <input
              value={lookbookTitle}
              onChange={event => setLookbookTitle(event.target.value)}
              placeholder={
                locale === "ko"
                  ? "예: 차콜 데일리 셋업"
                  : locale === "zh"
                    ? "例如：炭灰日常套装"
                    : "e.g. Charcoal daily set"
              }
              className="mt-1 h-9 w-full rounded-lg border border-[#ded6cc] px-2 text-[11px]"
            />
          </label>{" "}
          <label className="block">
            <span className="text-[10px] font-semibold text-[#665b50]">
              {locale === "ko"
                ? "추천 이름 (선택)"
                : locale === "zh"
                  ? "推荐名称（可选）"
                  : "Recommendation name (optional)"}
            </span>
            <input
              value={recommendationName}
              onChange={event => setRecommendationName(event.target.value)}
              placeholder={
                locale === "ko"
                  ? "예: 출근 추천"
                  : locale === "zh"
                    ? "例如：通勤推荐"
                    : "e.g. Workday pick"
              }
              className="mt-1 h-9 w-full rounded-lg border border-[#ded6cc] px-2 text-[11px]"
            />
          </label>{" "}
          <p className="sm:col-span-2 text-[10px] leading-4 text-[#897b6d]">
            {locale === "ko"
              ? "입력한 이름은 생성 결과·게시 승인 카드와 매장 디스플레이에 함께 표시됩니다."
              : locale === "zh"
                ? "填写的名称会显示在生成结果、批准卡片和门店展示中。"
                : "Names appear on generated results, approval cards, and the store display."}
          </p>{" "}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-[#f7f3ed] p-2">
          <p className="min-w-0 truncate text-[10px] text-[#786e63]">
            {outfitCart.length
              ? outfitCart
                  .map(id =>
                    titleFor(
                      products.find((product: any) => product.id === id) || {
                        name: `#${id}`,
                      }
                    )
                  )
                  .join(" + ")
              : locale === "ko"
                ? "상품을 선택하세요"
                : locale === "zh"
                  ? "请选择商品"
                  : "Select products"}
          </p>
          <button
            type="button"
            disabled={!outfitCart.length || busy}
            onClick={generateCartOutfit}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-black px-3 text-[11px] font-bold text-white disabled:opacity-40"
          >
            {busy ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <ImagePlus size={14} />
            )}
            {locale === "ko"
              ? "장바구니 코디 생성"
              : locale === "zh"
                ? "生成购物车搭配"
                : "Generate cart outfit"}
          </button>
        </div>
      </div>{" "}
      <div className="mt-4 rounded-xl border border-[#e5dbcf] bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-[11px] font-semibold">
            <input
              type="checkbox"
              checked={qrOverlayEnabled}
              onChange={event => setQrOverlayEnabled(event.target.checked)}
            />
            {locale === "ko"
              ? "저장 이미지 하단에 매장 QR 넣기"
              : locale === "zh"
                ? "保存图片底部添加店铺二维码"
                : "Add store QR to saved images"}
          </label>
          <label className="text-[10px] text-[#74695e]">
            QR {qrOverlaySize}px
            <input
              type="range"
              min="64"
              max="180"
              value={qrOverlaySize}
              onChange={event => setQrOverlaySize(Number(event.target.value))}
              className="ml-2 align-middle"
            />
          </label>
          <input
            value={qrOverlayLabel}
            onChange={event => setQrOverlayLabel(event.target.value)}
            className="h-8 w-40 rounded-lg border border-[#ddd4c9] px-2 text-[10px]"
            placeholder="LESOUL · WECHAT"
          />
        </div>
        <p className="mt-1 text-[10px] text-[#8a7d70]">
          {purchaseConfig.data?.adminTrialPaymentQrUrl
            ? locale === "ko"
              ? "관리자 Release Control의 매장 QR을 사용합니다. 저장 시 하단 중앙에 배치됩니다."
              : locale === "zh"
                ? "使用管理员 Release Control 中的店铺二维码，保存时放在底部中央。"
                : "Uses the store QR from Release Control and places it at the bottom center on save."
            : locale === "ko"
              ? "매장 QR이 설정되지 않아 원본 이미지로 저장됩니다."
              : locale === "zh"
                ? "尚未设置店铺二维码，将保存原图。"
                : "No store QR is configured; the original image will be saved."}
        </p>
      </div>{" "}
      {busy && (
        <div
          className="mt-4 rounded-xl bg-[#f7f3ed] p-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#5b5148]">
            <span>{text.progress}</span>
            <span>
              {progress?.completed ?? 0}/{progress?.total ?? count} ·{" "}
              {progress?.percent ?? 0}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ddd2]">
            <div
              className="h-full rounded-full bg-[#2b2520] transition-[width] duration-500"
              style={{ width: `${progress?.percent ?? 0}%` }}
            />
          </div>
        </div>
      )}{" "}
      {selected && (
        <p className="mt-3 text-[11px] text-[#786e63]">
          {titleFor(selected)} · {text.generated}: {imageRows.length}/
          {progress?.total ?? count} · {text.approved}: {approvedCount}/
          {progress?.total ?? count}
          {progress?.failed ? ` · ${progress.failed}${text.failed}` : ""}
        </p>
      )}
      {(generateOutfit.error || progress?.lastError) && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-[#fff0ed] px-3 py-2 text-xs text-[#9b4439]"
        >
          {generateOutfit.error?.message || progress?.lastError}
        </p>
      )}
      {visibleRows.length || allImagesQuery.isLoading ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold">
              {locale === "ko"
                ? "생성 결과 · 게시 승인"
                : locale === "zh"
                  ? "生成结果 · 批准发布"
                  : "Generated results · Approve for display"}
            </p>
            <div className="flex rounded-full bg-[#f3eee7] p-1">
              <button
                type="button"
                onClick={() => setGalleryScope("selected")}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${galleryScope === "selected" ? "bg-black text-white" : "text-[#766b60]"}`}
              >
                {locale === "ko"
                  ? "선택 상품"
                  : locale === "zh"
                    ? "当前商品"
                    : "Selected"}
              </button>
              <button
                type="button"
                onClick={() => setGalleryScope("all")}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${galleryScope === "all" ? "bg-black text-white" : "text-[#766b60]"}`}
              >
                {locale === "ko"
                  ? "전체 코디 한눈에"
                  : locale === "zh"
                    ? "一次查看全部搭配"
                    : "View all outfits"}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-8 rounded-full border border-[#d9d0c5] bg-white px-3 font-bold">
                <option value="all">{locale === "ko" ? "전체 상태" : locale === "zh" ? "全部状态" : "All statuses"}</option>
                <option value="approved">{locale === "ko" ? "승인됨" : locale === "zh" ? "已批准" : "Approved"}</option>
                <option value="pending">{locale === "ko" ? "대기" : locale === "zh" ? "待审核" : "Pending"}</option>
                <option value="hidden">{locale === "ko" ? "숨김" : locale === "zh" ? "已隐藏" : "Hidden"}</option>
              </select>
              <label className="inline-flex items-center gap-1 font-bold text-[#665b50]">
                {locale === "ko" ? "추천 카드/줄" : locale === "zh" ? "每行推荐卡片" : "Cards per row"}
                <select value={gridColumns} onChange={(event) => { const value = Number(event.target.value); setGridColumns(value); updateReleaseConfig.mutate({ lookbookGridColumns: value, releaseMode: releaseConfig.data?.releaseMode ?? "PRIVATE", betaCatalogLimit: releaseConfig.data?.betaCatalogLimit ?? 12, betaDailyVisitorLimit: releaseConfig.data?.betaDailyVisitorLimit ?? 2, globalDailyGenerationLimit: releaseConfig.data?.globalDailyGenerationLimit ?? 120, monthlyGenerationLimit: releaseConfig.data?.monthlyGenerationLimit ?? 2400, generationEnabled: releaseConfig.data?.generationEnabled ?? 1 }); }} className="h-8 rounded-full border border-[#d9d0c5] bg-white px-2"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select>
              </label>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibleRows.map((image: any) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-xl border border-[#e0d8ce] bg-[#faf8f4]"
              >
                <div className="relative aspect-[3/4] bg-[#eee9e1]">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(image)}
                    className="block h-full w-full cursor-zoom-in"
                    aria-label={
                      locale === "ko"
                        ? "룩북 크게 보기"
                        : locale === "zh"
                          ? "放大查看 Lookbook"
                          : "View lookbook larger"
                    }
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.sceneDescription}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void downloadBrandedImage(image.imageUrl, image.id)
                    }
                    className="absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold shadow"
                    aria-label="QR 포함 이미지 저장"
                  >
                    <Download size={12} />
                    {locale === "ko"
                      ? "QR 저장"
                      : locale === "zh"
                        ? "保存二维码图"
                        : "Save with QR"}
                  </button>
                </div>
                <div className="p-2">
                  <p className="mb-1 text-[10px] font-bold leading-4 text-[#433a32]">
                    {text.composition}: {compositionFor(image)}
                  </p>
                  {(image.lookbookTitle || image.recommendationName) && (
                    <p className="mb-1 text-[10px] font-semibold leading-4 text-[#765f51]">
                      {image.lookbookTitle || ""}
                      {image.lookbookTitle && image.recommendationName
                        ? " · "
                        : ""}
                      {image.recommendationName || ""}
                    </p>
                  )}
                  <div className="mt-2 grid gap-1.5 rounded-lg border border-[#e5dbcf] bg-white p-1.5">
                    <input
                      value={metadataDrafts[image.id]?.lookbookTitle ?? image.lookbookTitle ?? ""}
                      onChange={(event) => setMetadataDrafts((current) => ({ ...current, [image.id]: { lookbookTitle: event.target.value, recommendationName: current[image.id]?.recommendationName ?? image.recommendationName ?? "", recommendationReason: current[image.id]?.recommendationReason ?? image.recommendationReason ?? "" } }))}
                      placeholder={locale === "ko" ? "코디 이름" : locale === "zh" ? "搭配名称" : "Outfit title"}
                      className="h-7 w-full rounded border border-[#ded6cc] px-1.5 text-[10px]"
                    />
                    <input
                      value={metadataDrafts[image.id]?.recommendationName ?? image.recommendationName ?? ""}
                      onChange={(event) => setMetadataDrafts((current) => ({ ...current, [image.id]: { lookbookTitle: current[image.id]?.lookbookTitle ?? image.lookbookTitle ?? "", recommendationName: event.target.value, recommendationReason: current[image.id]?.recommendationReason ?? image.recommendationReason ?? "" } }))}
                      placeholder={locale === "ko" ? "추천 이름" : locale === "zh" ? "推荐名称" : "Recommendation name"}
                      className="h-7 w-full rounded border border-[#ded6cc] px-1.5 text-[10px]"
                    />
                    <textarea
                      value={metadataDrafts[image.id]?.recommendationReason ?? image.recommendationReason ?? ""}
                      onChange={(event) => setMetadataDrafts((current) => ({ ...current, [image.id]: { lookbookTitle: current[image.id]?.lookbookTitle ?? image.lookbookTitle ?? "", recommendationName: current[image.id]?.recommendationName ?? image.recommendationName ?? "", recommendationReason: event.target.value } }))}
                      placeholder={locale === "ko" ? "추천 이유" : locale === "zh" ? "推荐理由" : "Why this look"}
                      rows={2}
                      className="w-full resize-y rounded border border-[#ded6cc] px-1.5 py-1 text-[10px] leading-4"
                    />
                    <details className="rounded border border-[#eee5db] p-1.5">
                      <summary className="cursor-pointer text-[10px] font-bold text-[#665b50]">{locale === "ko" ? "다국어 제목·추천 이유" : locale === "zh" ? "多语言标题与推荐理由" : "Localized title & reason"}</summary>
                      <div className="mt-2 grid gap-1.5">
                        {(["Ko", "Zh", "En"] as const).map((language) => {
                          const draft = localizedDrafts[image.id];
                          const titleKey = `title${language}` as "titleKo" | "titleZh" | "titleEn";
                          const reasonKey = `reason${language}` as "reasonKo" | "reasonZh" | "reasonEn";
                          const titleFallback = language === "Ko" ? image.lookbookTitleKo : language === "Zh" ? image.lookbookTitleZh : image.lookbookTitleEn;
                          const reasonFallback = language === "Ko" ? image.recommendationReasonKo : language === "Zh" ? image.recommendationReasonZh : image.recommendationReasonEn;
                          return <div key={language} className="grid grid-cols-2 gap-1.5"><input value={draft?.[titleKey] ?? titleFallback ?? ""} onChange={(event) => setLocalizedDrafts((current) => ({ ...current, [image.id]: { titleKo: current[image.id]?.titleKo ?? image.lookbookTitleKo ?? "", titleZh: current[image.id]?.titleZh ?? image.lookbookTitleZh ?? "", titleEn: current[image.id]?.titleEn ?? image.lookbookTitleEn ?? "", reasonKo: current[image.id]?.reasonKo ?? image.recommendationReasonKo ?? "", reasonZh: current[image.id]?.reasonZh ?? image.recommendationReasonZh ?? "", reasonEn: current[image.id]?.reasonEn ?? image.recommendationReasonEn ?? "", [titleKey]: event.target.value } }))} placeholder={`${language} title`} className="h-7 rounded border border-[#ded6cc] px-1.5 text-[10px]" /><input value={draft?.[reasonKey] ?? reasonFallback ?? ""} onChange={(event) => setLocalizedDrafts((current) => ({ ...current, [image.id]: { titleKo: current[image.id]?.titleKo ?? image.lookbookTitleKo ?? "", titleZh: current[image.id]?.titleZh ?? image.lookbookTitleZh ?? "", titleEn: current[image.id]?.titleEn ?? image.lookbookTitleEn ?? "", reasonKo: current[image.id]?.reasonKo ?? image.recommendationReasonKo ?? "", reasonZh: current[image.id]?.reasonZh ?? image.recommendationReasonZh ?? "", reasonEn: current[image.id]?.reasonEn ?? image.recommendationReasonEn ?? "", [reasonKey]: event.target.value } }))} placeholder={`${language} reason`} className="h-7 rounded border border-[#ded6cc] px-1.5 text-[10px]" /></div>;
                        })}
                      </div>
                    </details>
                    <button
                      type="button"
                      disabled={updateMetadata.isPending}
                      onClick={() => { const draft = metadataDrafts[image.id] ?? { lookbookTitle: image.lookbookTitle ?? "", recommendationName: image.recommendationName ?? "", recommendationReason: image.recommendationReason ?? "" }; const localized = localizedDrafts[image.id]; updateMetadata.mutate({ id: image.id, lookbookTitle: draft.lookbookTitle.trim() || null, recommendationName: draft.recommendationName.trim() || null, recommendationReason: draft.recommendationReason.trim() || null, lookbookTitleKo: localized?.titleKo?.trim() || image.lookbookTitleKo || null, lookbookTitleZh: localized?.titleZh?.trim() || image.lookbookTitleZh || null, lookbookTitleEn: localized?.titleEn?.trim() || image.lookbookTitleEn || null, recommendationReasonKo: localized?.reasonKo?.trim() || image.recommendationReasonKo || null, recommendationReasonZh: localized?.reasonZh?.trim() || image.recommendationReasonZh || null, recommendationReasonEn: localized?.reasonEn?.trim() || image.recommendationReasonEn || null }); }}
                      className="h-7 rounded bg-[#f1e9dd] px-2 text-[10px] font-bold text-[#5b4d40] disabled:opacity-50"
                    >
                      {locale === "ko" ? "이름·이유 저장" : locale === "zh" ? "保存名称和理由" : "Save title & reason"}
                    </button>
                  </div>
                  <p className="min-h-8 text-[10px] leading-4 text-[#6d6258]">
                    {image.shotIndex}. {sceneFor(image)}
                  </p>
                  <p
                    className={`mt-2 text-[10px] font-bold ${image.isApproved ? "text-[#31734d]" : "text-[#927047]"}`}
                  >
                    {image.isApproved ? text.approved : text.pending}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        image.isApproved
                          ? revoke.mutate({ id: image.id })
                          : approve.mutate({ id: image.id })
                      }
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-white text-[10px] font-bold ring-1 ring-[#d9d0c5]"
                    >
                      {image.isApproved ? <X size={12} /> : <Check size={12} />}
                      {image.isApproved ? text.revoke : text.approved}
                    </button>
                    <button
                      type="button"
                      onClick={() => image.isActive === 0 ? restore.mutate({ id: image.id }) : remove.mutate({ id: image.id })}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#fff0ed] text-[10px] font-bold text-[#9b4439]"
                    >
                      {image.isActive === 0 ? <Check size={12} /> : <Trash2 size={12} />}
                      {image.isActive === 0 ? (locale === "ko" ? "복구" : locale === "zh" ? "恢复" : "Restore") : text.remove}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-[#dcd3c9] px-4 py-7 text-center text-xs text-[#7c7167]">
          {text.empty}
        </p>
      )}
      <p className="mt-4 text-[10px] leading-4 text-[#8a7d70]">{text.note}</p>
      {previewImage && (
        <div
          className="lesoul-safe-modal z-[70]"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
        >
          <section
            className="relative mx-auto max-h-[94svh] max-w-4xl rounded-2xl bg-[#171717] p-3 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-black"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage.imageUrl}
              alt={previewImage.sceneDescription || "Lookbook"}
              className="max-h-[88svh] w-full rounded-xl object-contain"
            />
            <p className="mt-2 text-center text-xs text-white/80">
              {previewImage.lookbookTitle ||
                previewImage.recommendationName ||
                previewImage.compositionLabel ||
                previewImage.sceneDescription}
            </p>
          </section>
        </div>
      )}
    </section>
  );
}

export { groupFor };
