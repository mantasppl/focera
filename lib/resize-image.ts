import { downloadBlob, fileBaseName } from "@/lib/image";

/** Soft browser canvas limit — keep under common Chromium caps. */
export const MAX_OUTPUT_DIMENSION = 8192;

export const MIN_OUTPUT_DIMENSION = 1;

export type ResizeScalePreset = {
  percent: number;
  label: string;
  hint: string;
};

export const RESIZE_SCALE_PRESETS: ResizeScalePreset[] = [
  { percent: 25, label: "25%", hint: "Quarter" },
  { percent: 50, label: "50%", hint: "Half size" },
  { percent: 75, label: "75%", hint: "Three-quarter" },
  { percent: 150, label: "150%", hint: "1.5×" },
  { percent: 200, label: "200%", hint: "Double" },
];

export type ResizeImageResult = {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

export type ResizeImageOptions = {
  width: number;
  height: number;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Resize cancelled.", "AbortError");
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
  const ctx = canvas.getContext("2d", { alpha: true });
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
 * Progressive high-quality enlarge: grow by at most 2× per pass so browser
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
    onProgress?.(`Enlarging pass ${pass}… ${nextWidth}×${nextHeight}`);
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

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the resized image."));
        return;
      }
      resolve(blob);
    }, "image/png");
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

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_OUTPUT_DIMENSION;
  return Math.min(
    MAX_OUTPUT_DIMENSION,
    Math.max(MIN_OUTPUT_DIMENSION, Math.round(value)),
  );
}

export function dimensionsFromPercent(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): { width: number; height: number } {
  const scale = percent / 100;
  return {
    width: clampDimension(originalWidth * scale),
    height: clampDimension(originalHeight * scale),
  };
}

export function pairedHeight(
  width: number,
  originalWidth: number,
  originalHeight: number,
): number {
  if (!originalWidth) return clampDimension(width);
  return clampDimension((width / originalWidth) * originalHeight);
}

export function pairedWidth(
  height: number,
  originalWidth: number,
  originalHeight: number,
): number {
  if (!originalHeight) return clampDimension(height);
  return clampDimension((height / originalHeight) * originalWidth);
}

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const image = await loadImage(file);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }
  return { width, height };
}

export function downloadResizedImage(
  blob: Blob,
  sourceFile: File,
  width: number,
  height: number,
) {
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-resized-${width}x${height}.png`,
  );
}

export async function resizeImageFile(
  file: File,
  options: ResizeImageOptions,
): Promise<ResizeImageResult> {
  const { onProgress, signal } = options;
  const targetWidth = clampDimension(options.width);
  const targetHeight = clampDimension(options.height);

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;

  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  if (
    targetWidth > MAX_OUTPUT_DIMENSION ||
    targetHeight > MAX_OUTPUT_DIMENSION
  ) {
    throw new Error(
      `Target size ${targetWidth}×${targetHeight} exceeds the ${MAX_OUTPUT_DIMENSION}px limit. Choose smaller dimensions.`,
    );
  }

  onProgress?.(`Resizing to ${targetWidth}×${targetHeight}…`);

  const enlarging =
    targetWidth > originalWidth || targetHeight > originalHeight;

  let canvas: HTMLCanvasElement;
  if (
    targetWidth === originalWidth &&
    targetHeight === originalHeight
  ) {
    canvas = drawScaled(
      image,
      targetWidth,
      targetHeight,
      originalWidth,
      originalHeight,
    );
  } else if (enlarging) {
    canvas = progressiveUpscale(
      image,
      originalWidth,
      originalHeight,
      targetWidth,
      targetHeight,
      onProgress,
      signal,
    );
  } else {
    canvas = drawScaled(
      image,
      targetWidth,
      targetHeight,
      originalWidth,
      originalHeight,
    );
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
  };
}
