import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";

export const supportedLanguages = ["en", "ko", "zh"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const languageStorageKey = "lesoul_lang";

function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(languageStorageKey) as SupportedLanguage | null;
  if (saved && supportedLanguages.includes(saved)) return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("ko")) return "ko";
  if (browser.startsWith("zh")) return "zh";
  return "en";
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ko: { translation: ko }, zh: { translation: zh } },
  lng: resolveInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
  i18n.on("languageChanged", (language) => { document.documentElement.lang = language; });
}

export function setLesoulLanguage(language: SupportedLanguage) {
  localStorage.setItem(languageStorageKey, language);
  return i18n.changeLanguage(language);
}

export default i18n;
