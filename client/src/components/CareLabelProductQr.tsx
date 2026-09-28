import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { careLabelProductUrl } from "@shared/careLabels";

export function downloadCareLabelQrSvg(id: string, name: string) {
  const svg = document.getElementById(`care-label-qr-${id}`)?.querySelector("svg");
  if (!svg) return;
  const copy = svg.cloneNode(true) as SVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${id}-${name || "商品"}.svg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export default function CareLabelProductQr({ id, name, compact = false, downloadable = true }: { id: string; name: string; compact?: boolean; downloadable?: boolean }) {
  const url = careLabelProductUrl(id);
  const size = compact ? 104 : 176;
  return <section id={`care-label-qr-${id}`} className={`care-label-qr-card rounded-2xl border border-[#ded7ce] bg-white text-center ${compact ? "p-3" : "p-5"}`}>
    <p className="text-[10px] font-bold tracking-[.16em] text-[#74685d]">LESOUL 商品二维码</p>
    <h2 className={`${compact ? "mt-1 truncate text-sm" : "mt-2 text-xl"} font-semibold text-[#28211c]`}>{name}</h2>
    <p className="mt-1 text-[10px] font-bold tracking-[.1em] text-[#887b70]">{id}</p>
    <div className="mx-auto mt-3 w-fit rounded-xl bg-white p-2 ring-1 ring-[#ece5dc]"><QRCodeSVG value={url} size={size} level="M" marginSize={1} title={`${id} ${name}`} /></div>
    <p className="mt-3 text-[10px] leading-4 text-[#71665d]">微信或手机相机扫码查看商品洗标资料</p>
    <p className="mt-1 break-all text-[8px] leading-3 text-[#a0958b]">{url}</p>
    {downloadable && <button type="button" onClick={() => downloadCareLabelQrSvg(id, name)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#241f1b] px-3 py-2 text-[10px] font-bold text-white"><Download size={12} />下载 SVG</button>}
  </section>;
}
