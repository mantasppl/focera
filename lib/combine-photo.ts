import {
  ACCEPTED_IMAGE_TYPES,
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "@/lib/image";

export const ACCEPTED_COMBINE_TYPES = ACCEPTED_IMAGE_TYPES;

export const MAX_COMBINE_FILES = 9;
export const MIN_COMBINE_FILES = 2;
export const MAX_COMBINE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_COMBINE_TOTAL_BYTES = 80 * 1024 * 1024;
/** Soft browser canvas limit — keep under common Chromium caps. */
export const MAX_OUTPUT_DIMENSION = 8192;
/** Target edge length for each cell before canvas-cap scaling. */
export const DEFAULT_CELL_EDGE = 1600;

export type CombineLayout = "horizontal" | "vertical" | "grid";
export type CombineGap = "none" | "small" | "medium";
export type CombineBackground = "white" | "black" | "transparent";
export type CombineFit = "cover" | "contain";

export type CombinePhotoResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  imageCount: number;
  layout: CombineLayout;
  outputSize: number;
};

export type CombinePhotoOptions = {
  layout?: CombineLayout;
  gap?: CombineGap;
  background?: CombineBackground;
  fit?: CombineFit;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

const GAP_PX: Record<CombineGap, number> = {
  none: 0,
  small: 12,
  medium: 28,
};

const BACKGROUND_FILL: Record<Exclude<CombineBackground, "transparent">, string> =
  {
    white: "#ffffff",
    black: "#000000",
  };

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Combine cancelled.", "AbortError");
  }
}

export function validateCombineFile(file: File): string | null {
  return validateImageFile(file);
}

export function validateCombineAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one image.";
  }

  for (const file of incoming) {
    const singleError = validateCombineFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_COMBINE_FILES) {
    return `You can combine up to ${MAX_COMBINE_FILES} photos at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_COMBINE_TOTAL_BYTES) {
    return `Combined photo size must be ${formatFileSize(MAX_COMBINE_TOTAL_BYTES)} or smaller.`;
  }

  return null;
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
      reject(
        new Error(
          `"${file.name}" could not be read. Try another JPG, PNG, or WebP.`,
        ),
      );
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

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size < 1) {
          reject(new Error("Could not create the combined image."));
          return;
        }
        resolve(blob);
      },
      "image/png",
    );
  });
}

export function gridShape(
  layout: CombineLayout,
  count: number,
): { cols: number; rows: number } {
  if (layout === "horizontal") {
    return { cols: count, rows: 1 };
  }
  if (layout === "vertical") {
    return { cols: 1, rows: count };
  }
  const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

function drawImageInCell(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  fit: CombineFit,
) {
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  if (srcW < 1 || srcH < 1 || cellW < 1 || cellH < 1) return;

  if (fit === "contain") {
    const scale = Math.min(cellW / srcW, cellH / srcH);
    const drawW = Math.max(1, Math.round(srcW * scale));
    const drawH = Math.max(1, Math.round(srcH * scale));
    const dx = x + Math.floor((cellW - drawW) / 2);
    const dy = y + Math.floor((cellH - drawH) / 2);
    ctx.drawImage(image, 0, 0, srcW, srcH, dx, dy, drawW, drawH);
    return;
  }

  const scale = Math.max(cellW / srcW, cellH / srcH);
  const cropW = Math.min(srcW, cellW / scale);
  const cropH = Math.min(srcH, cellH / scale);
  const sx = Math.max(0, (srcW - cropW) / 2);
  const sy = Math.max(0, (srcH - cropH) / 2);
  ctx.drawImage(image, sx, sy, cropW, cropH, x, y, cellW, cellH);
}

function scaleCanvasToMax(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number; scale: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height, scale: 1 };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

export async function combinePhotos(
  files: File[],
  options: CombinePhotoOptions = {},
): Promise<CombinePhotoResult> {
  const layout = options.layout ?? "horizontal";
  const gap = options.gap ?? "small";
  const background = options.background ?? "white";
  const fit = options.fit ?? "cover";
  const { onProgress, signal } = options;

  if (files.length < MIN_COMBINE_FILES) {
    throw new Error(
      `Add at least ${MIN_COMBINE_FILES} photos to combine.`,
    );
  }
  if (files.length > MAX_COMBINE_FILES) {
    throw new Error(
      `You can combine up to ${MAX_COMBINE_FILES} photos at a time.`,
    );
  }

  for (const file of files) {
    const error = validateCombineFile(file);
    if (error) throw new Error(error);
  }

  throwIfAborted(signal);
  onProgress?.("Loading photos…");

  const images: HTMLImageElement[] = [];
  for (let i = 0; i < files.length; i += 1) {
    throwIfAborted(signal);
    onProgress?.(`Loading photo ${i + 1} of ${files.length}…`);
    images.push(await loadImage(files[i]));
  }

  throwIfAborted(signal);
  onProgress?.("Building collage…");

  const { cols, rows } = gridShape(layout, images.length);
  const gapPx = GAP_PX[gap];

  const avgAspect =
    images.reduce((sum, image) => {
      const w = image.naturalWidth || image.width;
      const h = image.naturalHeight || image.height;
      return sum + w / Math.max(1, h);
    }, 0) / images.length;

  let cellH = DEFAULT_CELL_EDGE;
  let cellW =
    layout === "grid"
      ? DEFAULT_CELL_EDGE
      : Math.max(1, Math.round(DEFAULT_CELL_EDGE * avgAspect));

  if (layout === "vertical") {
    cellW = DEFAULT_CELL_EDGE;
    cellH = Math.max(1, Math.round(DEFAULT_CELL_EDGE / avgAspect));
  }

  let canvasW = cols * cellW + Math.max(0, cols - 1) * gapPx;
  let canvasH = rows * cellH + Math.max(0, rows - 1) * gapPx;

  const scaled = scaleCanvasToMax(canvasW, canvasH, MAX_OUTPUT_DIMENSION);
  if (scaled.scale !== 1) {
    cellW = Math.max(1, Math.round(cellW * scaled.scale));
    cellH = Math.max(1, Math.round(cellH * scaled.scale));
    const scaledGap = Math.max(0, Math.round(gapPx * scaled.scale));
    canvasW = cols * cellW + Math.max(0, cols - 1) * scaledGap;
    canvasH = rows * cellH + Math.max(0, rows - 1) * scaledGap;
  }

  const effectiveGapX =
    cols > 1 ? Math.round((canvasW - cols * cellW) / (cols - 1)) : 0;
  const effectiveGapY =
    rows > 1 ? Math.round((canvasH - rows * cellH) / (rows - 1)) : 0;

  const canvas = createCanvas(canvasW, canvasH);
  const ctx = getContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (background === "transparent") {
    ctx.clearRect(0, 0, canvasW, canvasH);
  } else {
    ctx.fillStyle = BACKGROUND_FILL[background];
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  for (let i = 0; i < images.length; i += 1) {
    throwIfAborted(signal);
    onProgress?.(`Placing photo ${i + 1} of ${images.length}…`);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellW + effectiveGapX);
    const y = row * (cellH + effectiveGapY);
    drawImageInCell(ctx, images[i], x, y, cellW, cellH, fit);
  }

  throwIfAborted(signal);
  onProgress?.("Encoding PNG…");
  const blob = await canvasToPngBlob(canvas);

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvasW,
    height: canvasH,
    imageCount: images.length,
    layout,
    outputSize: blob.size,
  };
}

export function revokeCombinePhotoResult(
  result: CombinePhotoResult | null | undefined,
) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadCombinedPhoto(
  blob: Blob,
  files: File[],
): void {
  const base =
    files.length === 1
      ? fileBaseName(files[0])
      : `${fileBaseName(files[0])}-combined`;
  downloadBlob(blob, `${base}.png`);
}

export function layoutLabel(layout: CombineLayout): string {
  switch (layout) {
    case "horizontal":
      return "Side by side";
    case "vertical":
      return "Stacked";
    case "grid":
      return "Grid";
  }
}

export function describeCombineOutput(
  result: CombinePhotoResult,
): string {
  return `${result.imageCount} photos · ${layoutLabel(result.layout)} · ${result.width}×${result.height} px · ${formatFileSize(result.outputSize)}`;
}
