export const commerceResources = {
  en: {
    product: {
      status: { inStock: "IN STOCK", preOrder: "PRE-ORDER", soldOut: "SOLD OUT", unpublished: "UNPUBLISHED" },
      newArrival: "NEW",
      addToPurchaseList: "ADD TO PURCHASE LIST",
      addedToPurchaseList: "ADDED TO PURCHASE LIST",
      reserve: "RESERVE",
      soldOutNotice: "This item is currently sold out.",
      listFull: "PURCHASE LIST FULL",
    },
    home: { newArrivals: "NEW ARRIVALS" },
    stylist: { recommendation: "AI STYLE MATCH", chooseAnchor: "Choose one available LESOUL piece to build a complete look." },
    common: { loading: "Loading…", retry: "Try again", cancel: "Cancel", confirm: "Confirm" },
  },
  ko: {
    product: {
      status: { inStock: "바로 구매", preOrder: "예약 주문", soldOut: "품절", unpublished: "비공개" },
      newArrival: "NEW",
      addToPurchaseList: "구매 목록에 담기",
      addedToPurchaseList: "구매 목록에 담겼습니다",
      reserve: "예약 신청",
      soldOutNotice: "현재 품절된 상품입니다.",
      listFull: "구매 목록이 가득 찼습니다",
    },
    home: { newArrivals: "신상품" },
    stylist: { recommendation: "AI 코디 추천", chooseAnchor: "판매 중인 LESOUL 상품 하나를 골라 완성 코디를 찾아보세요." },
    common: { loading: "불러오는 중…", retry: "다시 시도", cancel: "취소", confirm: "확인" },
  },
  zh: {
    product: {
      status: { inStock: "现货", preOrder: "预售", soldOut: "售罄", unpublished: "未上架" },
      newArrival: "NEW",
      addToPurchaseList: "加入购买清单",
      addedToPurchaseList: "已加入购买清单",
      reserve: "申请预订",
      soldOutNotice: "该商品目前已售罄。",
      listFull: "购买清单已满",
    },
    home: { newArrivals: "新品" },
    stylist: { recommendation: "AI 搭配推荐", chooseAnchor: "选择一件在售 LESOUL 商品，找到完整搭配。" },
    common: { loading: "加载中…", retry: "重试", cancel: "取消", confirm: "确认" },
  },
} as const;
