const CHANNEL_GAIN_LIMIT = 0.14;
const MIN_EXPOSURE = 0.9;
const MAX_EXPOSURE = 1.1;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode image."));
    image.src = dataUrl;
  });
}

/**
 * Creates a same-dimension, high-quality display copy for photos affected by
 * warm/cool lighting. The original file is never modified or overwritten.
 */
export async function autoCorrectProductImageColor(file: File) {
  const source = await readDataUrl(file);
  const image = await loadImage(source);
  if (!image.naturalWidth || !image.naturalHeight) return source;

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return source;
  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  const sampleStep = Math.max(1, Math.ceil(Math.sqrt((canvas.width * canvas.height) / 120_000)));
  let red = 0;
  let green = 0;
  let blue = 0;
  let luminance = 0;
  let samples = 0;

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const index = (y * canvas.width + x) * 4;
      if (data[index + 3] < 16) continue;
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      luminance += 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
      samples += 1;
    }
  }
  if (!samples) return source;

  const meanRed = red / samples;
  const meanGreen = green / samples;
  const meanBlue = blue / samples;
  const meanGray = (meanRed + meanGreen + meanBlue) / 3;
  const redGain = clamp(meanGray / Math.max(1, meanRed), 1 - CHANNEL_GAIN_LIMIT, 1 + CHANNEL_GAIN_LIMIT);
  const greenGain = clamp(meanGray / Math.max(1, meanGreen), 1 - CHANNEL_GAIN_LIMIT, 1 + CHANNEL_GAIN_LIMIT);
  const blueGain = clamp(meanGray / Math.max(1, meanBlue), 1 - CHANNEL_GAIN_LIMIT, 1 + CHANNEL_GAIN_LIMIT);
  const meanLuminance = luminance / samples;
  const exposure = meanLuminance < 70 ? clamp(92 / Math.max(1, meanLuminance), MIN_EXPOSURE, MAX_EXPOSURE) : meanLuminance > 205 ? clamp(185 / meanLuminance, MIN_EXPOSURE, MAX_EXPOSURE) : 1;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clamp(Math.round(data[index] * redGain * exposure), 0, 255);
    data[index + 1] = clamp(Math.round(data[index + 1] * greenGain * exposure), 0, 255);
    data[index + 2] = clamp(Math.round(data[index + 2] * blueGain * exposure), 0, 255);
  }
  context.putImageData(pixels, 0, 0);

  const mimeType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  return canvas.toDataURL(mimeType, 1);
}

export async function autoCorrectProductImageColorOrOriginal(file: File) {
  try {
    return await autoCorrectProductImageColor(file);
  } catch {
    return readDataUrl(file);
  }
}

export function isColorCorrectionSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined" && typeof FileReader !== "undefined";
}
