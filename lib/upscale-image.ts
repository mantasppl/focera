import { downloadBlob, fileBaseName } from "@/lib/image";

export type UpscaleFactor = 2 | 3 | 4;

export type UpscalePreset = {
  factor: UpscaleFactor;
  label: string;
  hint: string;
};

export const UPSCALE_PRESETS: UpscalePreset[] = [
  { factor: 2, label: "2×", hint: "Double size" },
  { factor: 3, label: "3×", hint: "Triple size" },
  { factor: 4, label: "4×", hint: "Quadruple" },
];

/** Soft browser canvas limit — keep under common Chromium caps. */
export const MAX_OUTPUT_DIMENSION = 8192;

export type UpscaleImageResult = {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  factor: UpscaleFactor;
  enhanced: boolean;
};

export type UpscaleImageOptions = {
  factor?: UpscaleFactor;
  enhance?: boolean;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Upscale cancelled.", "AbortError");
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

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  return ctx;
}

function drawScaled(
  source: CanvasImageSource,
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
  return canvas;
}

/**
 * Progressive high-quality upscale: grow by at most 2× per pass so browser
 * bicubic filtering stays sharper than a single large jump.
 */
function progressiveUpscale(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): HTMLCanvasElement {
  let canvas = drawScaled(
    source,
    sourceWidth,
    sourceHeight,
    sourceWidth,
    sourceHeight,
  );
  let width = sourceWidth;
  let height = sourceHeight;
  let pass = 0;

  while (width < targetWidth || height < targetHeight) {
    throwIfAborted(signal);
    pass += 1;
    const nextWidth = Math.min(targetWidth, Math.ceil(width * 2));
    const nextHeight = Math.min(targetHeight, Math.ceil(height * 2));
    onProgress?.(`Upscaling pass ${pass}… ${nextWidth}×${nextHeight}`);
    const next = drawScaled(canvas, nextWidth, nextHeight, width, height);
    canvas.width = 0;
    canvas.height = 0;
    canvas = next;
    width = nextWidth;
    height = nextHeight;
  }

  if (width !== targetWidth || height !== targetHeight) {
    throwIfAborted(signal);
    onProgress?.(`Finalizing ${targetWidth}×${targetHeight}…`);
    const next = drawScaled(canvas, targetWidth, targetHeight, width, height);
    canvas.width = 0;
    canvas.height = 0;
    canvas = next;
  }

  return canvas;
}

/** Mild unsharp mask to restore edge clarity after interpolation. */
function applyUnsharpMask(
  canvas: HTMLCanvasElement,
  amount = 0.55,
  threshold = 4,
): void {
  const ctx = getContext(canvas);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const copy = new Uint8ClampedArray(src);

  // 3×3 box blur into `blurred`, then blend high-pass back onto original.
  const blurred = new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        const py = Math.min(height - 1, Math.max(0, y + ky));
        for (let kx = -1; kx <= 1; kx += 1) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const i = (py * width + px) * 4;
          r += copy[i];
          g += copy[i + 1];
          b += copy[i + 2];
          a += copy[i + 3];
          count += 1;
        }
      }
      const o = (y * width + x) * 4;
      blurred[o] = r / count;
      blurred[o + 1] = g / count;
      blurred[o + 2] = b / count;
      blurred[o + 3] = a / count;
    }
  }

  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const diff = copy[i + c] - blurred[i + c];
      if (Math.abs(diff) > threshold) {
        src[i + c] = Math.min(
          255,
          Math.max(0, Math.round(copy[i + c] + diff * amount)),
        );
      }
    }
    src[i + 3] = copy[i + 3];
  }

  ctx.putImageData(imageData, 0, 0);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the upscaled image."));
          return;
        }
        resolve(blob);
      },
      "image/png",
    );
  });
}

export function describeDimensions(
  originalWidth: number,
  originalHeight: number,
  width: number,
  height: number,
): string {
  return `${originalWidth}×${originalHeight} → ${width}×${height}`;
}

export function downloadUpscaledImage(blob: Blob, sourceFile: File, factor: UpscaleFactor) {
  downloadBlob(blob, `${fileBaseName(sourceFile)}-upscaled-${factor}x.png`);
}

export async function upscaleImageFile(
  file: File,
  options: UpscaleImageOptions = {},
): Promise<UpscaleImageResult> {
  const factor = options.factor ?? 2;
  const enhance = options.enhance ?? true;
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;

  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  const targetWidth = originalWidth * factor;
  const targetHeight = originalHeight * factor;

  if (
    targetWidth > MAX_OUTPUT_DIMENSION ||
    targetHeight > MAX_OUTPUT_DIMENSION
  ) {
    throw new Error(
      `Upscaled size would be ${targetWidth}×${targetHeight}, which exceeds the ${MAX_OUTPUT_DIMENSION}px limit. Try a smaller image or a lower scale.`,
    );
  }

  onProgress?.(`Scaling to ${targetWidth}×${targetHeight}…`);
  const canvas = progressiveUpscale(
    image,
    originalWidth,
    originalHeight,
    targetWidth,
    targetHeight,
    onProgress,
    signal,
  );

  if (enhance) {
    throwIfAborted(signal);
    onProgress?.("Enhancing details…");
    applyUnsharpMask(canvas);
  }

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    originalWidth,
    originalHeight,
    factor,
    enhanced: enhance,
  };
}
