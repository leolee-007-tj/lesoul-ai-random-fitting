import { FIXED_MODELS, type FixedModelKey } from "@shared/fixedModels";
import { trpc } from "@/lib/trpc";
import { Camera, ImageUp, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const modelOrder: FixedModelKey[] = ["petite", "balanced", "volume"];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("IMAGE_READ_FAILED"));
    reader.onerror = () => reject(new Error("IMAGE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

export function LiyingReferenceModelManager() {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const copy = locale === "ko" ? { title: "VIP 李瀛 AI 기준 모델 사진", body: "VIP 피팅에 사용할 세 가지 기준 체형 사진을 업로드하세요. 선택된 사진은 의상·포즈·배경과 결합하는 李瀛 AI 피팅의 인물 기준으로 사용됩니다.", upload: "사진 업로드·교체", uploaded: "업로드된 기준 사진", default: "기본 기준 사진", limit: "JPG, PNG, WEBP · 원본 최대 20MB" } : locale === "zh" ? { title: "VIP 李瀛 AI 参考模特照片", body: "请为 VIP 试穿上传三种固定体型的参考照片。所选照片将作为李瀛 AI 试穿中搭配服装、姿势与背景的人物参考。", upload: "上传或更换照片", uploaded: "已上传参考照片", default: "默认参考照片", limit: "JPG、PNG、WEBP · 原文件最大 20MB" } : { title: "VIP LIYING AI REFERENCE MODELS", body: "Upload the three fixed body-proportion reference photos used for VIP fitting. The selected photo becomes the 李瀛 AI reference while clothing, pose, and background change.", upload: "Upload or replace photo", uploaded: "Uploaded reference photo", default: "Default reference photo", limit: "JPG, PNG, WEBP · original files up to 20MB" };
  const utils = trpc.useUtils();
  const models = trpc.operations.liyingReferenceModels.useQuery();
  const upload = trpc.operations.uploadLiyingReferenceImage.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.operations.liyingReferenceModels.invalidate(),
        utils.bodyModel.liyingReferenceModels.invalidate(),
      ]);
    },
  });
  const fileInputs = useRef<Partial<Record<FixedModelKey, HTMLInputElement | null>>>({});
  const [error, setError] = useState("");
  const imageUrls = models.data?.imageUrls ?? {};
  const ordered = modelOrder.map((key) => FIXED_MODELS.find((model) => model.key === key)!).filter(Boolean);
  const selectFile = async (key: FixedModelKey, file?: File) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) { setError(copy.limit); return; }
    try { upload.mutate({ modelKey: key, dataUrl: await readFileAsDataUrl(file) }); }
    catch { setError(locale === "ko" ? "사진을 읽을 수 없습니다. 다시 선택해 주세요." : locale === "zh" ? "无法读取照片，请重新选择。" : "The photo could not be read. Please choose it again."); }
  };
  return <section className="mt-5 rounded-2xl border border-[#e2ddd5] bg-white p-4"><div className="flex items-start gap-2"><Camera size={16} className="mt-0.5" /><div><p className="text-[10px] font-bold tracking-[.14em] text-[#766b60]">{copy.title}</p><p className="mt-2 text-[11px] leading-5 text-[#70675e]">{copy.body}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{ordered.map((model) => { const imageUrl = imageUrls[model.key] || model.imageUrl; const uploaded = Boolean(imageUrls[model.key]); return <article key={model.key} className="overflow-hidden rounded-xl border border-[#ded7ce] bg-[#f8f5f0]"><img src={imageUrl} alt={model.copy[locale].title} className="aspect-[2/3] w-full bg-[#e7e3dc] object-cover" /><div className="p-3"><p className="text-xs font-semibold">{model.copy[locale].title}</p><p className="mt-1 min-h-8 text-[10px] leading-4 text-[#756b61]">{model.copy[locale].description}</p><p className="mt-2 text-[9px] font-bold text-[#77695d]">{uploaded ? copy.uploaded : copy.default}</p><input ref={(node) => { fileInputs.current[model.key] = node; }} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void selectFile(model.key, event.target.files?.[0])} /><button type="button" disabled={upload.isPending} onClick={() => fileInputs.current[model.key]?.click()} className="mt-3 w-full rounded-lg bg-black px-2 py-2 text-[10px] font-bold text-white disabled:opacity-50">{upload.isPending ? <LoaderCircle className="mx-auto animate-spin" size={13} /> : <><ImageUp className="mr-1 inline" size={12} />{copy.upload}</>}</button></div></article>; })}</div><p className="mt-3 text-[10px] text-[#776e65]">{copy.limit}</p>{error && <p className="mt-2 text-[10px] font-semibold text-[#9d4538]">{error}</p>}{upload.error && <p className="mt-2 text-[10px] font-semibold text-[#9d4538]">{upload.error.message}</p>}</section>;
}
