import type { StudioProductView } from "@shared/studioProductImage";
import { studioReviewCheckKeys, type StudioReviewCheckKey, type StudioReviewChecks } from "@shared/studioProductReview";

type Props = {
  locale: "en" | "ko" | "zh";
  sources: Record<StudioProductView, string>;
  results: Record<StudioProductView, string>;
  checks: StudioReviewChecks;
  isGenerating: boolean;
  canApprove: boolean;
  onToggleCheck: (view: StudioProductView, key: StudioReviewCheckKey) => void;
  onRegenerate: (view: StudioProductView) => void;
  onApprove: () => void;
};

const copyByLocale = {
  en: { title: "Original / white-background review", help: "Compare each original and result before approval. Regenerate only the view that needs correction.", front: "Front", back: "Back", original: "Original", result: "White background result", empty: "Generate this view to review it.", regenerate: "Regenerate", checks: { framing: "Framing, angle, and proportion are unchanged", material: "Color and material texture are preserved", details: "Logo, print, seams, and design details are preserved" }, ready: "All checks are complete. You can approve the pair.", required: "Complete all front and back checks before final approval.", approve: "Final approval — use images" },
  ko: { title: "원본 · 순백 결과 비교", help: "앞면과 뒷면의 원본·결과를 각각 비교하세요. 문제가 있는 쪽만 다시 생성할 수 있습니다.", front: "앞면", back: "뒷면", original: "원본", result: "순백 배경 결과", empty: "이 화면 결과를 생성한 뒤 확인하세요.", regenerate: "이 화면만 다시 생성", checks: { framing: "구도·각도·비율이 원본과 같습니다", material: "색상과 소재 질감이 유지되었습니다", details: "로고·프린트·봉제·디테일이 유지되었습니다" }, ready: "모든 확인이 완료되었습니다. 최종 승인할 수 있습니다.", required: "앞면과 뒷면의 모든 항목을 확인해야 최종 승인할 수 있습니다.", approve: "최종 승인 · 이미지 사용" },
  zh: { title: "原图 · 纯白背景结果对比", help: "请分别对比正面和背面的原图与结果。只有有问题的一面可单独重新生成。", front: "正面", back: "背面", original: "原图", result: "纯白背景结果", empty: "请先生成这一面的结果后再确认。", regenerate: "仅重新生成这一面", checks: { framing: "构图、角度和比例与原图一致", material: "颜色和材质纹理得到保留", details: "Logo、印花、缝线和设计细节得到保留" }, ready: "所有检查已完成，可以最终批准。", required: "完成正面和背面的全部检查后才能最终批准。", approve: "最终批准 · 使用图片" },
} as const;

export default function StudioImageReview({ locale, sources, results, checks, isGenerating, canApprove, onToggleCheck, onRegenerate, onApprove }: Props) {
  const copy = copyByLocale[locale];
  const views: StudioProductView[] = ["front", "back"];
  return <section className="mt-4 rounded-2xl border border-[#d8d2c9] bg-white p-3 sm:p-4"><h3 className="text-xs font-semibold text-[#39332d]">{copy.title}</h3><p className="mt-1 text-[10px] leading-4 text-[#777]">{copy.help}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{views.map((view) => <article key={view} className="rounded-xl border border-[#e2ddd5] bg-[#fbfaf8] p-3"><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-bold text-[#4b433b]">{copy[view]}</p><button type="button" disabled={isGenerating || !sources[view]} onClick={() => onRegenerate(view)} className="rounded-full border border-[#cfc7be] bg-white px-2.5 py-1 text-[10px] font-semibold disabled:opacity-40">{copy.regenerate}</button></div><div className="mt-2 grid grid-cols-2 gap-2"><figure><figcaption className="mb-1 text-[9px] font-semibold text-[#756d64]">{copy.original}</figcaption><img src={sources[view]} alt={`${copy[view]} ${copy.original}`} className="aspect-square w-full rounded-lg border border-[#e5dfd6] bg-white object-contain" /></figure><figure><figcaption className="mb-1 text-[9px] font-semibold text-[#756d64]">{copy.result}</figcaption>{results[view] ? <img src={results[view]} alt={`${copy[view]} ${copy.result}`} className="aspect-square w-full rounded-lg border border-[#e5dfd6] bg-white object-contain" /> : <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-[#d8d1c8] bg-white p-2 text-center text-[9px] leading-4 text-[#877d72]">{copy.empty}</div>}</figure></div>{results[view] && <div className="mt-3 space-y-2">{studioReviewCheckKeys.map((key) => <label key={key} className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-[#5e554c]"><input type="checkbox" checked={checks[view][key]} onChange={() => onToggleCheck(view, key)} className="mt-0.5 size-3.5 accent-black" />{copy.checks[key]}</label>)}</div>}</article>)}</div><div className={`mt-3 rounded-xl px-3 py-2 text-[10px] leading-4 ${canApprove ? "bg-emerald-50 text-emerald-800" : "bg-[#f3efe9] text-[#756a5e]"}`}>{canApprove ? copy.ready : copy.required}</div><button type="button" disabled={!canApprove || isGenerating} onClick={onApprove} className="mt-3 h-11 w-full rounded-xl bg-black text-[11px] font-semibold text-white disabled:opacity-40">{copy.approve}</button></section>;
}
