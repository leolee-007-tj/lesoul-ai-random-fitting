import MobileScreen from "@/components/MobileScreen";
import { readFixedModel, saveFixedModel } from "@/lib/fixedModels";
import { FIXED_MODELS, type FixedModelKey } from "@shared/fixedModels";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const copy = {
  en: { eyebrow: "CHOOSE AI MODEL", title: "Choose your model", intro: "Pick one fixed fashion model. No personal photo, measurements, or model creation is needed.", selected: "Selected", choose: "Choose this model", continue: "Continue to styling", back: "Back to Studio" },
  ko: { eyebrow: "AI 모델 선택", title: "모델을 선택하세요", intro: "고정된 패션 모델 중 하나를 선택하세요. 본인 사진, 신체 치수, 모델 생성은 필요하지 않습니다.", selected: "선택됨", choose: "이 모델 선택", continue: "스타일링 계속하기", back: "Studio로 돌아가기" },
  zh: { eyebrow: "选择 AI 模特", title: "选择您的模特", intro: "从固定时装模特中选择一位。无需个人照片、身体尺寸或创建模特。", selected: "已选择", choose: "选择此模特", continue: "继续造型", back: "返回 Studio" },
} as const;

export default function BodyModel() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  const c = copy[lang];
  const [selected, setSelected] = useState<FixedModelKey>(() => readFixedModel()?.key ?? "balanced");
  const select = (key: FixedModelKey) => { setSelected(key); saveFixedModel(key); };
  const continueToStudio = () => { saveFixedModel(selected); navigate(`/studio?fixedModel=${selected}`); };
  return <MobileScreen><main className="lesoul-mobile-frame px-4 pb-8 pt-4 sm:px-6"><button onClick={() => navigate("/studio")} className="inline-flex items-center gap-1 text-xs font-semibold text-[#5b544c]"><ArrowLeft size={14} /> {c.back}</button><p className="mt-5 text-[10px] font-bold tracking-[.18em] text-[#777]">{c.eyebrow}</p><h1 className="mt-2 font-serif text-3xl">{c.title}</h1><p className="mt-2 text-sm leading-5 text-[#666]">{c.intro}</p><section className="mt-5 grid gap-3"><div className="grid grid-cols-3 gap-2">{FIXED_MODELS.map((model) => { const active = selected === model.key; const localized = model.copy[lang]; return <button type="button" key={model.key} onClick={() => select(model.key)} className={`overflow-hidden rounded-[1.25rem] border text-left transition ${active ? "border-black ring-2 ring-black" : "border-[#dedbd4] bg-white"}`}><img src={model.imageUrl} alt={`${model.name} ${localized.title}`} className="aspect-[2/3] w-full bg-[#e7e3dc] object-cover" /><div className="p-2"><div className="flex items-center justify-between gap-1"><p className="truncate text-[11px] font-bold">{model.name}</p>{active && <Check size={13} />}</div><p className="mt-0.5 text-[10px] font-semibold text-[#6d645b]">{localized.title}</p></div></button>; })}</div>{FIXED_MODELS.map((model) => selected === model.key ? <article key={model.key} className="rounded-2xl border border-[#dedbd4] bg-white p-4"><p className="text-[10px] font-bold tracking-[.14em] text-[#777]">{c.selected} · {model.name}</p><h2 className="mt-1 font-serif text-2xl">{model.copy[lang].title}</h2><p className="mt-2 text-sm leading-5 text-[#625a52]">{model.copy[lang].description}</p><p className="mt-2 text-[11px] leading-4 text-[#7a7066]">{model.copy[lang].fitNote}</p><button onClick={() => select(model.key)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"><Check size={13} /> {c.choose}</button></article> : null)}</section><button onClick={continueToStudio} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white"><Sparkles size={16} />{c.continue}</button></main></MobileScreen>;
}
