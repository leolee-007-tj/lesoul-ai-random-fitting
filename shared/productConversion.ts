export type ProductConversionEventType = "DETAIL_VIEW" | "PURCHASE_LIST_ADD";

export type ProductConversionEvent = {
  productId: number;
  visitorId: string;
  eventType: ProductConversionEventType;
};

export type ProductConversionShareCount = {
  productId: number;
  visits: number;
};

export type ProductConversionProduct = {
  id: number;
  name: string;
  nameEn: string | null;
  nameKo: string | null;
  nameZh: string | null;
  imageUrl: string | null;
};

export type ProductConversionRow = {
  product: ProductConversionProduct;
  detailVisits: number;
  uniqueVisitors: number;
  purchaseListAdds: number;
  interestedVisitors: number;
  convertedVisitors: number;
  conversionRate: number;
  shareVisits: number;
};

export function summarizeProductConversions(
  events: ProductConversionEvent[],
  shareCounts: ProductConversionShareCount[],
  products: ProductConversionProduct[],
) {
  const metrics = new Map<number, { detailVisitors: Set<string>; purchaseVisitors: Set<string>; detailVisits: number; purchaseListAdds: number; shareVisits: number }>();
  for (const event of events) {
    const metric = metrics.get(event.productId) ?? { detailVisitors: new Set<string>(), purchaseVisitors: new Set<string>(), detailVisits: 0, purchaseListAdds: 0, shareVisits: 0 };
    if (event.eventType === "DETAIL_VIEW") {
      metric.detailVisits += 1;
      metric.detailVisitors.add(event.visitorId);
    } else {
      metric.purchaseListAdds += 1;
      metric.purchaseVisitors.add(event.visitorId);
    }
    metrics.set(event.productId, metric);
  }
  for (const share of shareCounts) {
    const metric = metrics.get(share.productId) ?? { detailVisitors: new Set<string>(), purchaseVisitors: new Set<string>(), detailVisits: 0, purchaseListAdds: 0, shareVisits: 0 };
    metric.shareVisits = share.visits;
    metrics.set(share.productId, metric);
  }
  const productById = new Map(products.map((product) => [product.id, product]));
  const rows: ProductConversionRow[] = [];
  for (const [productId, metric] of Array.from(metrics.entries())) {
    const product = productById.get(productId);
    if (!product) continue;
    let convertedVisitors = 0;
    for (const visitorId of Array.from(metric.purchaseVisitors)) if (metric.detailVisitors.has(visitorId)) convertedVisitors += 1;
    const uniqueVisitors = metric.detailVisitors.size;
    rows.push({
      product,
      detailVisits: metric.detailVisits,
      uniqueVisitors,
      purchaseListAdds: metric.purchaseListAdds,
      interestedVisitors: metric.purchaseVisitors.size,
      convertedVisitors,
      conversionRate: uniqueVisitors ? Math.round((convertedVisitors / uniqueVisitors) * 1000) / 10 : 0,
      shareVisits: metric.shareVisits,
    });
  }
  rows.sort((left, right) => right.uniqueVisitors - left.uniqueVisitors || right.detailVisits - left.detailVisits || left.product.id - right.product.id);
  return {
    totalProductViews: rows.reduce((sum, row) => sum + row.detailVisits, 0),
    products: rows,
  };
}
