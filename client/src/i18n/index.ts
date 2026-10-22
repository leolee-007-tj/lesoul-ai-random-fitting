import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import { commerceResources, curationResources } from "./commerceResources";

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

function mergeResources(base: Record<string, any>, commerce: any, curation: any) {
  return {
    ...base,
    product: { ...(base.product as object), ...commerce.product },
    home: { ...(base.home as object), ...commerce.home },
    stylist: { ...(base.stylist as object), ...commerce.stylist, ...curation.stylist },
    common: { ...(base.common as object), ...commerce.common, ...curation.common },
    auth: { ...(base.auth as object), ...commerce.auth },
    history: { ...(base.history as object), ...commerce.history },
    look: { ...commerce.look, styles: { ...commerce.look.styles, ...curation.look.styles } },
    vipAdmin: commerce.vipAdmin,
    adminSetup: commerce.adminSetup,
    adminPassword: commerce.adminPassword,
  };
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: mergeResources(en, commerceResources.en, curationResources.en) },
    ko: { translation: mergeResources(ko, commerceResources.ko, curationResources.ko) },
    zh: { translation: mergeResources(zh, commerceResources.zh, curationResources.zh) },
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
