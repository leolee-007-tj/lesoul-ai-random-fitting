import { Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setLesoulLanguage, type SupportedLanguage } from "@/i18n";

const options: Array<{ code: SupportedLanguage; label: string }> = [
  { code: "en", label: "EN" }, { code: "ko", label: "KO" }, { code: "zh", label: "中文" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("ko") ? "ko" : i18n.language.startsWith("zh") ? "zh" : "en";
  return <div className="flex items-center rounded-full border border-[#ded9d0] bg-white p-0.5" aria-label="Language selector"><Globe2 size={13} className="ml-1.5 mr-1 text-[#5d5952]" />{options.map((option) => <button key={option.code} onClick={() => setLesoulLanguage(option.code)} className={`rounded-full px-1.5 py-1 text-[10px] font-bold transition sm:px-2 ${current === option.code ? "bg-black text-white" : "text-[#777] hover:text-black"}`}>{option.label}</button>)}</div>;
}
