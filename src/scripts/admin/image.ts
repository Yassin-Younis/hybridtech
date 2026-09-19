// Client-side product photo preparation: fit inside 1200px, encode as WebP (JPEG where the browser
// cannot encode WebP), so the repo never receives multi-megabyte camera originals.
const MAX = 1200;

export interface PreparedImage { blob: Blob; ext: 'webp' | 'jpg'; dataUrl: string; base64: string }

const load = (file: File) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file is not an image the browser can read.')); };
    img.src = url;
  });

const toBlob = (c: HTMLCanvasElement, type: string, q: number) => new Promise<Blob | null>((res) => c.toBlob(res, type, q));

export async function prepareImage(file: File): Promise<PreparedImage> {
  const img = await load(file);
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); // flatten transparency onto the card's white tile
  ctx.drawImage(img, 0, 0, w, h);
  let blob = await toBlob(c, 'image/webp', 0.82);
  let ext: 'webp' | 'jpg' = 'webp';
  if (!blob || blob.type !== 'image/webp') { blob = await toBlob(c, 'image/jpeg', 0.85); ext = 'jpg'; }
  if (!blob) throw new Error('Could not encode the image.');
  const dataUrl = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = () => rej(r.error); r.readAsDataURL(blob!); });
  return { blob, ext, dataUrl, base64: dataUrl.slice(dataUrl.indexOf(',') + 1) };
}
