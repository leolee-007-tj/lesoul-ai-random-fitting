import MobileScreen from "@/components/MobileScreen";
import StylistPanel, { type StylistProduct, type StylistRecommendation } from "@/components/StylistPanel";
import { usePurchaseList } from "@/contexts/PurchaseListContext";
import { getEffectivePrice } from "@shared/productCommerce";
import { isStylistEligible, normaliseAvailabilityStatus } from "@shared/productAvailability";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const sizesFor = (product: { sizeOptions?: Array<{ label?: string }> | null }) => product.sizeOptions?.map((size) => size.label).filter((label): label is string => Boolean(label)) ?? ["FREE"];

type CuratedSelection = {
  products: StylistProduct[];
  styleName: string;
  styleKey: string;
  selectedLookId: string;
  recommendations: StylistRecommendation[];
};

export default function StyleMatch() {
  const { i18n } = useTranslation();
  const [, navigate] = useLocation();
  const { addItems } = usePurchaseList();
  const [notice, setNotice] = useState<string | null>(null);
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = {
    en: {
      eyebrow: "ADMINISTRATOR-CURATED LOOKS",
      title: "Complete looks selected by LESOUL",
      subtitle: "Browse only the saved and published combinations selected by the LESOUL administrator.",
      added: (count: number) => `${count} ${count === 1 ? "item" : "items"} added to your purchase list.`,
      excluded: (count: number) => `${count} sold-out or unavailable ${count === 1 ? "item was" : "items were"} excluded from this look.`,
      reservationQuestion: (count: number) => `${count} reservation ${count === 1 ? "item is" : "items are"} included. Would you like to proceed with a reservation? Korea–Qingdao delivery usually takes about 2–3 weeks.`,
      noAvailable: "This look has no currently purchasable items.",
      list: "VIEW PURCHASE LIST",
      error: "This curated look is no longer available. Please refresh and try again.",
    },
    ko: {
      eyebrow: "관리자 추천 코디",
      title: "LESOUL 관리자가 고른 완성 코디",
      subtitle: "LESOUL 관리자가 저장하고 공개한 코디만 둘러볼 수 있습니다.",
      added: (count: number) => `${count}개 상품이 구매목록에 담겼습니다.`,
      excluded: (count: number) => `품절 또는 구매할 수 없는 상품 ${count}개는 구매목록에서 제외했습니다.`,
      reservationQuestion: (count: number) => `예약 상품 ${count}개가 포함되어 있습니다. 예약 구매를 원하시나요? 한국·칭다오 배송은 내외 2~3주 정도 소요됩니다.`,
      noAvailable: "현재 구매 가능한 상품이 없는 코디입니다.",
      list: "구매목록 보기",
      error: "이 추천 코디는 더 이상 구매할 수 없습니다. 새로고침 후 다시 시도해 주세요.",
    },
    zh: {
      eyebrow: "店主精选搭配",
      title: "LESOUL 店主精选的完整搭配",
      subtitle: "这里只能浏览 LESOUL 店主保存并公开的搭配组合。",
      added: (count: number) => `已将 ${count} 件商品加入购买清单。`,
      excluded: (count: number) => `已售罄或暂不可购买的 ${count} 件商品已从这套搭配中排除。`,
      reservationQuestion: (count: number) => `其中包含 ${count} 件预约商品。您希望继续预约购买吗？韩国及青岛配送通常约需 2–3 周。`,
      noAvailable: "这套搭配目前没有可购买的商品。",
      list: "查看购买清单",
      error: "这套精选搭配已无法购买，请刷新后重试。",
    },
  }[locale];

  const useLook = (selection: CuratedSelection) => {
    const availableProducts = selection.products.filter((product) => isStylistEligible({ isActive: product.isActive, availabilityStatus: normaliseAvailabilityStatus(product.availabilityStatus, product.status), status: product.status }, true));
    const excludedCount = selection.products.length - availableProducts.length;
    if (!availableProducts.length) {
      setNotice(copy.noAvailable);
      return;
    }
    const reservationCount = availableProducts.filter((product) => normaliseAvailabilityStatus(product.availabilityStatus, product.status) === "PRE_ORDER").length;
    const purchaseItems = availableProducts.map((product) => {
      const sizes = sizesFor(product);
      const availability = normaliseAvailabilityStatus(product.availabilityStatus, product.status);
      return { productId: product.id, productName: product.name, nameEn: product.nameEn, nameKo: product.nameKo, nameZh: product.nameZh, productImage: product.imageUrl, productType: null, setComponents: null, catalogDisplay: product.catalogDisplay, selectedSize: sizes[0] ?? "FREE", availableSizes: sizes, quantity: 1, currentPrice: getEffectivePrice(product), purchaseType: availability === "PRE_ORDER" ? "RESERVATION" as const : "NORMAL" as const, source: "catalog" as const };
    });
    addItems(purchaseItems);
    const messages = [copy.added(purchaseItems.length)];
    if (excludedCount > 0) messages.push(copy.excluded(excludedCount));
    if (reservationCount > 0) messages.push(copy.reservationQuestion(reservationCount));
    setNotice(messages.join(" "));
  };

  return (
    <MobileScreen>
      <main className="lesoul-mobile-frame px-4 pb-10 pt-4 sm:px-6">
        <p className="text-[10px] font-bold tracking-[.18em] text-[#746a60]">{copy.eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl text-[#2d2722]">{copy.title}</h1>
        <p className="mt-2 text-sm leading-5 text-[#746d65]">{copy.subtitle}</p>
        {notice && <section className="mt-4 rounded-xl border border-[#ded6cb] bg-[#f8f5ef] p-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#41372e]"><Check size={15} aria-hidden="true" />{notice}</span><button onClick={() => navigate("/purchase-list")} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-bold text-white"><ShoppingBag size={14} aria-hidden="true" />{copy.list}</button></section>}
        <StylistPanel onUseLook={useLook} onError={() => setNotice(copy.error)} />
      </main>
    </MobileScreen>
  );
}
