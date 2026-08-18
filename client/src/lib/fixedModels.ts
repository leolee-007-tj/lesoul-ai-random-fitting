import { getFixedModel, type FixedModel, type FixedModelKey } from "@shared/fixedModels";

const KEY = "lesoul-fixed-ai-model";
export const saveFixedModel = (key: FixedModelKey) => localStorage.setItem(KEY, key);
export const readFixedModel = (): FixedModel | null => {
  try { return getFixedModel(localStorage.getItem(KEY)); } catch { return null; }
};
