import MobileScreen from "@/components/MobileScreen";
import CareLabelProductQr from "@/components/CareLabelProductQr";
import { trpc } from "@/lib/trpc";
import type { CareLabelData } from "@shared/careLabels";
import { LoaderCircle, Printer } from "lucide-react";
import { Link } from "wouter";

export default function CareLabelPrint() {
  const catalog = trpc.careLabels.catalog.useQuery();
  const products = (catalog.data?.products ?? []) as Array<{ id: string; data: CareLabelData }>;
  return <MobileScreen showNavigation={false}><main className="care-label-print-page mx-auto w-full max-w-7xl px-4 py-5 sm:px-8"><header className="care-label-print-controls flex flex-wrap items-start justify-between gap-4 border-b border-[#ddd6cc] pb-5"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#81766c]">LESOUL</p><h1 className="mt-1 font-serif text-4xl">商品二维码打印册</h1><p className="mt-2 text-sm text-[#71685f]">共 {products.length} 件商品 · 商品编号与二维码永久对应</p></div><div className="flex gap-2"><Link href="/care-labels/admin" className="rounded-full border border-[#d8d0c6] bg-white px-4 py-3 text-xs font-bold">返回管理</Link><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-[#241f1b] px-4 py-3 text-xs font-bold text-white"><Printer size={14} />打印全部</button></div></header>{catalog.isLoading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin" /></div> : <section className="care-label-qr-grid mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map((row) => <CareLabelProductQr key={row.id} id={row.id} name={row.data.name} compact downloadable={false} />)}</section>}</main></MobileScreen>;
}
