import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import { commerceResources } from "./commerceResources";

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
  resources: {
    en: { translation: { ...en, product: { ...(en as any).product, ...commerceResources.en.product }, home: { ...(en as any).home, ...commerceResources.en.home }, stylist: { ...(en as any).stylist, ...commerceResources.en.stylist }, common: { ...(en as any).common, ...commerceResources.en.common }, auth: { ...(en as any).auth, ...commerceResources.en.auth }, history: { ...(en as any).history, ...commerceResources.en.history }, look: commerceResources.en.look } },
    ko: { translation: { ...ko, product: { ...(ko as any).product, ...commerceResources.ko.product }, home: { ...(ko as any).home, ...commerceResources.ko.home }, stylist: { ...(ko as any).stylist, ...commerceResources.ko.stylist }, common: { ...(ko as any).common, ...commerceResources.ko.common }, auth: { ...(ko as any).auth, ...commerceResources.ko.auth }, history: { ...(ko as any).history, ...commerceResources.ko.history }, look: commerceResources.ko.look } },
    zh: { translation: { ...zh, product: { ...(zh as any).product, ...commerceResources.zh.product }, home: { ...(zh as any).home, ...commerceResources.zh.home }, stylist: { ...(zh as any).stylist, ...commerceResources.zh.stylist }, common: { ...(zh as any).common, ...commerceResources.zh.common }, auth: { ...(zh as any).auth, ...commerceResources.zh.auth }, history: { ...(zh as any).history, ...commerceResources.zh.history }, look: commerceResources.zh.look } },
  },
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
