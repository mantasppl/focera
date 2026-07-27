import { downloadBlob, fileBaseName } from "@/lib/image";

/** Soft cap so inpainting stays responsive in the browser. */
export const MAX_PROCESS_DIMENSION = 2048;

export const BRUSH_SIZE = {
  min: 8,
  max: 72,
  default: 28,
} as const;

export type RemoveWatermarkResult = {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

export type RemoveWatermarkOptions = {
  /** Mask ImageData — non-zero alpha (or red channel) marks pixels to restore. */
  mask: ImageData;
  radius?: number;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Watermark removal cancelled.", "AbortError");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try another file."));
    };
    image.src = url;
  });
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  return ctx;
}

function processSize(
  width: number,
  height: number,
): { width: number; height: number; scale: number } {
  const longest = Math.max(width, height);
  if (longest <= MAX_PROCESS_DIMENSION) {
    return { width, height, scale: 1 };
  }
  const scale = MAX_PROCESS_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

function maskCoversAnyPixel(mask: ImageData): boolean {
  const { data } = mask;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! > 24 || data[i - 3]! > 24) return true;
  }
  return false;
}

/**
 * Telea-inspired fast inpainting: fill masked pixels from the boundary inward
 * using distance-weighted neighborhood samples.
 */
function inpaintTelea(
  source: ImageData,
  mask: ImageData,
  radius: number,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): ImageData {
  const { width, height } = source;
  const out = new ImageData(new Uint8ClampedArray(source.data), width, height);
  const pixels = out.data;

  const UNKNOWN = 0;
  const BAND = 1;
  const KNOWN = 2;

  const state = new Uint8Array(width * height);
  const dist = new Float32Array(width * height);
  dist.fill(1e6);

  let unknownCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const mi = i * 4;
      const marked = mask.data[mi + 3]! > 24 || mask.data[mi]! > 24;
      if (marked) {
        state[i] = UNKNOWN;
        unknownCount++;
      } else {
        state[i] = KNOWN;
        dist[i] = 0;
      }
    }
  }

  if (unknownCount === 0) {
    return out;
  }

  type BandNode = { i: number; d: number };
  const band: BandNode[] = [];

  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  function pushBand(i: number, d: number) {
    band.push({ i, d });
    let idx = band.length - 1;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (band[parent]!.d <= band[idx]!.d) break;
      const tmp = band[parent]!;
      band[parent] = band[idx]!;
      band[idx] = tmp;
      idx = parent;
    }
  }

  function popBand(): BandNode | undefined {
    if (band.length === 0) return undefined;
    const root = band[0]!;
    const last = band.pop()!;
    if (band.length === 0) return root;
    band[0] = last;
    let idx = 0;
    while (true) {
      const left = idx * 2 + 1;
      const right = left + 1;
      let smallest = idx;
      if (left < band.length && band[left]!.d < band[smallest]!.d) {
        smallest = left;
      }
      if (right < band.length && band[right]!.d < band[smallest]!.d) {
        smallest = right;
      }
      if (smallest === idx) break;
      const tmp = band[idx]!;
      band[idx] = band[smallest]!;
      band[smallest] = tmp;
      idx = smallest;
    }
    return root;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (state[i] !== UNKNOWN) continue;
      for (const [dx, dy] of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (state[ni] === KNOWN) {
          state[i] = BAND;
          dist[i] = 1;
          pushBand(i, 1);
          break;
        }
      }
    }
  }

  const r2 = radius * radius;
  let filled = 0;
  let lastReport = 0;

  function samplePixel(cx: number, cy: number) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumA = 0;
    let sumW = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= height) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const distSq = dx * dx + dy * dy;
        if (distSq === 0 || distSq > r2) continue;
        const x = cx + dx;
        if (x < 0 || x >= width) continue;
        const ni = y * width + x;
        if (state[ni] !== KNOWN) continue;

        const distance = Math.sqrt(distSq);
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Prefer pixels along the normal from the hole boundary.
        const grad =
          1 +
          Math.abs(dirX) * 0.35 +
          Math.abs(dirY) * 0.35;
        const w = (1 / (distance * distance)) * grad;

        const pi = ni * 4;
        sumR += pixels[pi]! * w;
        sumG += pixels[pi + 1]! * w;
        sumB += pixels[pi + 2]! * w;
        sumA += pixels[pi + 3]! * w;
        sumW += w;
      }
    }

    if (sumW < 1e-6) {
      // Fallback: nearest known neighbor (4-connected expansion).
      for (let ring = 1; ring <= radius * 2; ring++) {
        for (let dy = -ring; dy <= ring; dy++) {
          for (let dx = -ring; dx <= ring; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            const x = cx + dx;
            const y = cy + dy;
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            const ni = y * width + x;
            if (state[ni] !== KNOWN) continue;
            const pi = ni * 4;
            return [
              pixels[pi]!,
              pixels[pi + 1]!,
              pixels[pi + 2]!,
              pixels[pi + 3]!,
            ] as const;
          }
        }
      }
      return [0, 0, 0, 255] as const;
    }

    return [
      Math.round(sumR / sumW),
      Math.round(sumG / sumW),
      Math.round(sumB / sumW),
      Math.round(sumA / sumW),
    ] as const;
  }

  while (band.length > 0) {
    throwIfAborted(signal);
    const node = popBand();
    if (!node) break;

    const { i, d } = node;
    if (state[i] === KNOWN) continue;
    if (d > dist[i]! + 1e-6) continue;

    const x = i % width;
    const y = (i / width) | 0;
    const [r, g, b, a] = samplePixel(x, y);
    const pi = i * 4;
    pixels[pi] = r;
    pixels[pi + 1] = g;
    pixels[pi + 2] = b;
    pixels[pi + 3] = a;
    state[i] = KNOWN;
    filled++;

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (state[ni] === KNOWN) continue;
      const nd = d + 1;
      if (nd < dist[ni]!) {
        dist[ni] = nd;
        state[ni] = BAND;
        pushBand(ni, nd);
      }
    }

    if (onProgress && filled - lastReport >= 800) {
      lastReport = filled;
      const percent = Math.min(
        99,
        Math.round((filled / unknownCount) * 100),
      );
      onProgress(`Restoring pixels… ${percent}%`);
    }
  }

  onProgress?.("Blending edges…");

  // Soften the restored region boundary slightly.
  const feather = new Uint8ClampedArray(pixels);
  const featherR = Math.max(1, Math.min(3, Math.round(radius / 4)));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const mi = i * 4;
      const marked = mask.data[mi + 3]! > 24 || mask.data[mi]! > 24;
      if (!marked) continue;

      let nearEdge = false;
      for (let dy = -1; dy <= 1 && !nearEdge; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nmi = (ny * width + nx) * 4;
          const nMarked =
            mask.data[nmi + 3]! > 24 || mask.data[nmi]! > 24;
          if (!nMarked) {
            nearEdge = true;
            break;
          }
        }
      }
      if (!nearEdge) continue;

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;
      let count = 0;
      for (let dy = -featherR; dy <= featherR; dy++) {
        for (let dx = -featherR; dx <= featherR; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const pi = (ny * width + nx) * 4;
          sumR += pixels[pi]!;
          sumG += pixels[pi + 1]!;
          sumB += pixels[pi + 2]!;
          sumA += pixels[pi + 3]!;
          count++;
        }
      }
      if (count === 0) continue;
      feather[mi] = Math.round(sumR / count);
      feather[mi + 1] = Math.round(sumG / count);
      feather[mi + 2] = Math.round(sumB / count);
      feather[mi + 3] = Math.round(sumA / count);
    }
  }

  return new ImageData(feather, width, height);
}

export async function removeWatermarkFromImage(
  file: File,
  options: RemoveWatermarkOptions,
): Promise<RemoveWatermarkResult> {
  const { mask, radius = 6, onProgress, signal } = options;
  throwIfAborted(signal);

  if (!maskCoversAnyPixel(mask)) {
    throw new Error("Paint over the watermark before removing it.");
  }

  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (originalWidth < 1 || originalHeight < 1) {
    throw new Error("Could not read this image. Try another file.");
  }

  const sized = processSize(originalWidth, originalHeight);
  onProgress?.("Preparing canvas…");

  const canvas = document.createElement("canvas");
  canvas.width = sized.width;
  canvas.height = sized.height;
  const ctx = getContext(canvas);
  ctx.drawImage(image, 0, 0, sized.width, sized.height);
  const source = ctx.getImageData(0, 0, sized.width, sized.height);

  let processMask = mask;
  if (mask.width !== sized.width || mask.height !== sized.height) {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = sized.width;
    maskCanvas.height = sized.height;
    const maskCtx = getContext(maskCanvas);
    const temp = document.createElement("canvas");
    temp.width = mask.width;
    temp.height = mask.height;
    getContext(temp).putImageData(mask, 0, 0);
    maskCtx.drawImage(temp, 0, 0, sized.width, sized.height);
    processMask = maskCtx.getImageData(0, 0, sized.width, sized.height);
  }

  onProgress?.("Removing watermark…");
  // Yield so the loading UI can paint before the heavy loop.
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 16);
  });
  throwIfAborted(signal);

  const restored = inpaintTelea(
    source,
    processMask,
    radius,
    onProgress,
    signal,
  );
  throwIfAborted(signal);

  ctx.putImageData(restored, 0, 0);

  // Upscale back to original size when we downscaled for processing.
  let outputCanvas = canvas;
  if (sized.scale < 1) {
    onProgress?.("Upscaling result…");
    const full = document.createElement("canvas");
    full.width = originalWidth;
    full.height = originalHeight;
    const fullCtx = getContext(full);
    fullCtx.imageSmoothingEnabled = true;
    fullCtx.imageSmoothingQuality = "high";
    fullCtx.drawImage(canvas, 0, 0, originalWidth, originalHeight);
    outputCanvas = full;
  }

  onProgress?.("Encoding PNG…");
  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not encode the cleaned image."));
      },
      "image/png",
      1,
    );
  });

  return {
    blob,
    width: originalWidth,
    height: originalHeight,
    originalWidth,
    originalHeight,
  };
}

export function downloadCleanedImage(blob: Blob, file: File): void {
  downloadBlob(blob, `${fileBaseName(file)}-no-watermark.png`);
}
