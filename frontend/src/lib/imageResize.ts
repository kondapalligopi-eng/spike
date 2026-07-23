// Downscale an image File to a compact data URL, entirely in the browser.
//
// Used by the Pet Stories draft flow: anonymous visitors can't upload to
// Cloudinary (that endpoint needs auth), so their photos are held client-side
// as data URLs until they publish. Full-resolution phone photos (5–10 MB each)
// would blow past the ~5 MB localStorage quota and make the draft impossible to
// persist across the sign-up redirect — so we shrink them first. It also makes
// the eventual Cloudinary upload faster for everyone.

const MAX_DIM = 1280; // longest side, px — plenty for a cover + thumbnails
const QUALITY = 0.82; // JPEG quality

/** Read a File into an HTMLImageElement (browser only). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });
}

/**
 * Downscale `file` so its longest side is at most MAX_DIM and return a JPEG
 * data URL. If anything goes wrong (or the browser can't decode it), falls back
 * to reading the file as-is so the photo is never silently dropped.
 */
export async function fileToDownscaledDataUrl(file: File): Promise<string> {
  try {
    const img = await loadImage(file);
    const { width, height } = img;
    const scale = Math.min(1, MAX_DIM / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(img, 0, 0, w, h);
    // JPEG keeps the byte size predictable; PNG photos would balloon.
    return canvas.toDataURL('image/jpeg', QUALITY);
  } catch {
    // Fallback: raw data URL (still works, just larger).
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });
  }
}
