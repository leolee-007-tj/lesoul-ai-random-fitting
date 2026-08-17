import { useAuth } from "@/_core/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Camera, Check, ImageUp, RotateCcw, Sparkles } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getPhoto, savePhoto } from "@/lib/lookSession";

function resizeForUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("지원하지 않는 이미지입니다."));
      image.onload = () => {
        const ratio = Math.min(1, 1600 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio);
        const context = canvas.getContext("2d"); if (!context) return reject(new Error("사진 처리 기능을 준비하지 못했습니다."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", .88));
      }; image.src = String(reader.result);
    }; reader.readAsDataURL(file);
  });
}

function cropForLook(dataUrl: string, scale: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("사진 크롭을 완료하지 못했습니다."));
    image.onload = () => {
      const targetRatio = 4 / 5;
      let sourceWidth = image.width;
      let sourceHeight = image.height;
      if (image.width / image.height > targetRatio) sourceWidth = image.height * targetRatio;
      else sourceHeight = image.width / targetRatio;
      sourceWidth /= scale;
      sourceHeight /= scale;
      const sourceX = (image.width - sourceWidth) / 2;
      const sourceY = (image.height - sourceHeight) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1250;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("사진 처리 기능을 준비하지 못했습니다."));
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.src = dataUrl;
  });
}

export default function Upload() {
  const { isAuthenticated, loading } = useAuth(); const [, navigate] = useLocation(); const inputRef = useRef<HTMLInputElement>(null); const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(() => getPhoto()); const [scale, setScale] = useState(1); const [error, setError] = useState("");
  const upload = trpc.uploads.photo.useMutation();
  useEffect(() => { if (!loading && !isAuthenticated) navigate("/auth"); }, [isAuthenticated, loading, navigate]);
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setError(""); try { setPreview(await resizeForUpload(file)); setScale(1); } catch (cause) { setError(cause instanceof Error ? cause.message : "사진을 처리하지 못했습니다."); } };
  const continueFlow = async () => { if (!preview) return; try { const processed = preview.startsWith("/manus-storage/") ? preview : await cropForLook(preview, scale); const result = processed.startsWith("/manus-storage/") ? { url: processed } : await upload.mutateAsync({ dataUrl: processed }); savePhoto(result.url); navigate("/pose"); } catch (cause) { setError(cause instanceof Error ? cause.message : "업로드를 완료하지 못했습니다."); } };
  return <div className="min-h-screen bg-[#f7f2eb] text-[#382f2a]"><AppHeader /><main className="mx-auto max-w-5xl px-5 pb-12 pt-5 sm:px-8"><div className="mb-8 flex items-center gap-3 text-xs font-semibold tracking-[.15em] text-[#927a64]"><span className="grid size-6 place-items-center rounded-full bg-[#3f342d] text-white">1</span> PHOTO <i className="h-px w-8 bg-[#cdbda9]" /> <span className="grid size-6 place-items-center rounded-full border border-[#cab9a5]">2</span> POSE <i className="h-px w-8 bg-[#cdbda9]" /> <span className="grid size-6 place-items-center rounded-full border border-[#cab9a5]">3</span> LOOK</div>
    <div className="grid gap-8 lg:grid-cols-[1.13fr_.87fr] lg:items-center"><section><p className="text-xs font-bold tracking-[.2em] text-[#9a8066]">STEP 01</p><h1 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-5xl">당신을 담은<br />사진 한 장</h1><p className="mt-5 max-w-md text-sm leading-6 text-[#716258]">전신이 잘 보이는 사진을 올려주세요. 밝은 자연광과 단정한 배경일수록 더 자연스러운 룩 에디토리얼을 만들 수 있어요.</p><div className="mt-7 grid gap-3 text-sm text-[#685a50]"><p className="flex gap-3"><Check size={16} className="mt-0.5 text-[#96785d]" />머리부터 발끝까지 프레임 안에 담기</p><p className="flex gap-3"><Check size={16} className="mt-0.5 text-[#96785d]" />정면에 가깝고 자연스러운 조명 사용</p><p className="flex gap-3"><Check size={16} className="mt-0.5 text-[#96785d]" />JPG, PNG, WEBP · 최대 6MB</p></div></section>
      <section className="rounded-[2rem] border border-[#e3d7c9] bg-[#fffdf8] p-4 shadow-[0_18px_42px_rgba(97,71,52,.07)] sm:p-5"><div className="relative aspect-[4/5] overflow-hidden rounded-[1.45rem] bg-[#e8ddd0]">{preview ? <img src={preview} alt="업로드 사진 미리보기" style={{ transform: `scale(${scale})` }} className="h-full w-full object-cover transition-transform duration-200" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_36%,#f8f4ed_0,transparent_23%),linear-gradient(150deg,#ded0c0,#cbb8a5)]"><div className="relative h-[76%] w-[48%] rounded-[7rem_7rem_2rem_2rem] border border-dashed border-[#947962]/70"><span className="absolute -top-6 left-1/2 size-12 -translate-x-1/2 rounded-full border border-dashed border-[#947962]/70" /><span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[.16em] text-[#806750]">FULL BODY</span></div></div>}<div className="pointer-events-none absolute inset-4 rounded-[1rem] border border-white/80 shadow-[inset_0_0_0_1px_rgba(70,50,36,.12)]"><span className="absolute left-1/2 top-4 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" /><span className="absolute bottom-4 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" /></div></div>
        {preview && <div className="mt-4 rounded-2xl bg-[#f6f0e7] px-4 py-3"><div className="flex items-center justify-between text-xs font-medium text-[#715e4e]"><span>프레임 조정</span><button onClick={() => setPreview(null)} className="inline-flex items-center gap-1 text-[#8d7058]"><RotateCcw size={13} /> 사진 바꾸기</button></div><input aria-label="사진 확대 비율" type="range" min="1" max="1.45" step=".01" value={scale} onChange={(event) => setScale(Number(event.target.value))} className="mt-3 w-full accent-[#7e634e]" /></div>}
        {!preview && <button onClick={() => inputRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b99f85] bg-[#fffaf3] px-4 py-4 text-sm font-semibold text-[#5b493b] transition hover:bg-[#f9f1e7]"><ImageUp size={18} /> 사진 업로드하기</button>}
        <input ref={inputRef} onChange={onFile} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" />
        <input ref={cameraRef} onChange={onFile} accept="image/jpeg,image/png,image/webp" capture="environment" type="file" className="hidden" />
        <button onClick={() => cameraRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-[#88715e]"><Camera size={15} /> 카메라로 촬영하기</button>
        {error && <p className="mt-2 text-center text-xs text-red-700">{error}</p>}
        <button disabled={!preview || upload.isPending} onClick={continueFlow} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#3f342d] py-4 text-sm font-semibold text-white transition hover:bg-[#59483b] disabled:cursor-not-allowed disabled:opacity-40">{upload.isPending ? "사진을 준비하고 있어요" : <>다음으로 <ArrowRight size={17} /></>}</button>
      </section></div></main></div>;
}
