export type StoredBodyModel = { id: number; imageUrl: string; profileId: number; heightCm: number; bustCm: number | null; waistCm: number | null; hipCm: number | null };
const KEY = "lesoul-ai-body-model";
export const saveBodyModel = (model: StoredBodyModel) => sessionStorage.setItem(KEY, JSON.stringify(model));
export const readBodyModel = (): StoredBodyModel | null => { try { const raw = sessionStorage.getItem(KEY); return raw ? JSON.parse(raw) as StoredBodyModel : null; } catch { return null; } };
