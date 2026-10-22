export type StudioCutPreview = { original: string; studioCut: string; thumbnail: string; width: number; height: number };

export function inferViewType(fileName: string): "front" | "back" | "side" | "detail" {
  const name = fileName.toLowerCase();
  if (/(back|rear|후면|뒷)/.test(name)) return "back";
  if (/(side|측면|옆)/.test(name)) return "side";
  if (/(detail|close|디테일|상세)/.test(name)) return "detail";
  return "front";
}

export function readImageFile(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Unable to read image.")); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); }); }

export async function createStudioCut(file: File): Promise<StudioCutPreview> {
  const original = await readImageFile(file);
  return new Promise((resolve, reject) => {
    const image = new Image(); image.onerror = () => reject(new Error("Unable to process image.")); image.onload = () => {
      const size = 1400; const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size; const context = canvas.getContext("2d"); if (!context) return reject(new Error("Canvas is unavailable."));
      context.fillStyle = "#FFFFFF"; context.fillRect(0, 0, size, size);
      const scale = Math.min((size * .84) / image.width, (size * .84) / image.height); const width = image.width * scale; const height = image.height * scale; const x = (size - width) / 2; const y = (size - height) / 2;
      context.save(); context.filter = "drop-shadow(0 18px 16px rgba(0,0,0,.14))"; context.drawImage(image, x, y, width, height); context.restore();
      const studioCut = canvas.toDataURL("image/jpeg", .92);
      const thumbnailCanvas = document.createElement("canvas"); thumbnailCanvas.width = 360; thumbnailCanvas.height = 360; const thumb = thumbnailCanvas.getContext("2d"); if (!thumb) return reject(new Error("Thumbnail canvas is unavailable.")); thumb.fillStyle = "#FFFFFF"; thumb.fillRect(0, 0, 360, 360); thumb.drawImage(canvas, 0, 0, 360, 360);
      resolve({ original, studioCut, thumbnail: thumbnailCanvas.toDataURL("image/jpeg", .86), width: image.width, height: image.height });
    }; image.src = original;
  });
}
