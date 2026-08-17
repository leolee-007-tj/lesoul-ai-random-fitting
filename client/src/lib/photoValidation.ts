export type PhotoClassification = { valid: boolean; type: "full_body" | "too_wide" | "too_narrow"; ratio: number };

export function classifyDimensions(width: number, height: number): PhotoClassification {
  const ratio = height / width;
  if (ratio < 1.2) return { valid: false, type: "too_wide", ratio };
  if (ratio > 3.5) return { valid: false, type: "too_narrow", ratio };
  return { valid: true, type: "full_body", ratio };
}

export function validateUploadedPhoto(dataUrl: string): Promise<PhotoClassification> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onerror = () => reject(new Error("Unable to validate the uploaded photo.")); image.onload = () => resolve(classifyDimensions(image.width, image.height)); image.src = dataUrl; });
}
