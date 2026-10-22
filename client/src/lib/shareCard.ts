export async function buildShareCard(imageUrl: string, lookCode: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Share card rendering is unavailable.");
  context.fillStyle = "#f5f2ec"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#171717"; context.font = "600 42px serif"; context.fillText("LESOUL AI LOOK", 72, 94);
  context.fillStyle = "#7b746b"; context.font = "600 18px sans-serif"; context.fillText(lookCode, 74, 548);
  context.fillStyle = "#171717"; context.font = "400 26px serif"; context.fillText("Create your own AI fashion look", 74, 588);
  const image = new Image(); image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Unable to load image for share card.")); image.src = imageUrl; });
  const box = { x: 600, y: 42, width: 520, height: 546 }; const scale = Math.max(box.width / image.width, box.height / image.height); const width = image.width * scale; const height = image.height * scale;
  context.save(); context.beginPath(); context.roundRect(box.x, box.y, box.width, box.height, 26); context.clip(); context.drawImage(image, box.x + (box.width - width) / 2, box.y + (box.height - height) / 2, width, height); context.restore();
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create share card.")), "image/jpeg", .92));
}

export function updateSocialMeta(lookCode: string, imageUrl: string) {
  const update = (selector: string, attribute: "name" | "property", content: string) => {
    let tag = document.querySelector<HTMLMetaElement>(selector);
    if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attribute, selector.includes("twitter") ? "twitter:card" : selector.replace("meta[", "").replace(/.*?="|"\]/g, "")); document.head.appendChild(tag); }
    tag.content = content;
  };
  update('meta[property="og:title"]', "property", `LESOUL AI LOOK ${lookCode}`);
  update('meta[property="og:description"]', "property", "Check out this AI-generated fashion look featuring LESOUL products.");
  update('meta[property="og:image"]', "property", imageUrl);
  update('meta[name="twitter:card"]', "name", "summary_large_image");
}

export function downloadBlob(blob: Blob, fileName: string) { const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url); }
