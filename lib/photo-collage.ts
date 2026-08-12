import {
  ACCEPTED_IMAGE_TYPES,
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "@/lib/image";

export const ACCEPTED_COLLAGE_TYPES = ACCEPTED_IMAGE_TYPES;

export const MAX_COLLAGE_FILES = 6;
export const MIN_COLLAGE_FILES = 2;
export const MAX_COLLAGE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_COLLAGE_TOTAL_BYTES = 60 * 1024 * 1024;
/** Soft browser canvas limit — keep under common Chromium caps. */
export const MAX_OUTPUT_DIMENSION = 8192;
/** Longest edge of the collage canvas before canvas-cap scaling. */
export const DEFAULT_CANVAS_EDGE = 2400;

export type CollageGap = "none" | "small" | "medium";
export type CollageBackground = "white" | "black" | "transparent";
export type CollageFit = "cover" | "contain";
export type CollageRatio = "square" | "landscape" | "portrait" | "story";

/** Normalized cell rect in 0–1 collage space (before gap inset). */
export type CollageCell = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CollageTemplate = {
  id: string;
  label: string;
  hint: string;
  slots: number;
  cells: CollageCell[];
};

export type PhotoCollageResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  imageCount: number;
  templateId: string;
  ratio: CollageRatio;
  outputSize: number;
};

export type PhotoCollageOptions = {
  templateId?: string;
  ratio?: CollageRatio;
  gap?: CollageGap;
  background?: CollageBackground;
  fit?: CollageFit;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

const GAP_FRACTION: Record<CollageGap, number> = {
  none: 0,
  small: 0.012,
  medium: 0.028,
};

const BACKGROUND_FILL: Record<Exclude<CollageBackground, "transparent">, string> =
  {
    white: "#ffffff",
    black: "#000000",
  };

const RATIO_SIZE: Record<CollageRatio, { width: number; height: number }> = {
  square: { width: 1, height: 1 },
  landscape: { width: 16, height: 9 },
  portrait: { width: 3, height: 4 },
  story: { width: 9, height: 16 },
};

/**
 * Template cells use unit coordinates covering the full canvas.
 * Gaps are applied at render time by inseting each cell.
 */
export const COLLAGE_TEMPLATES: CollageTemplate[] = [
  // 2 photos
  {
    id: "2-split",
    label: "Split",
    hint: "Equal halves",
    slots: 2,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    id: "2-hero-left",
    label: "Hero left",
    hint: "Wide + narrow",
    slots: 2,
    cells: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 1 },
    ],
  },
  {
    id: "2-stack",
    label: "Stack",
    hint: "Top + bottom",
    slots: 2,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ],
  },
  // 3 photos
  {
    id: "3-left-hero",
    label: "Left hero",
    hint: "Tall + two",
    slots: 3,
    cells: [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.5 },
      { x: 0.55, y: 0.5, w: 0.45, h: 0.5 },
    ],
  },
  {
    id: "3-right-hero",
    label: "Right hero",
    hint: "Two + tall",
    slots: 3,
    cells: [
      { x: 0, y: 0, w: 0.45, h: 0.5 },
      { x: 0, y: 0.5, w: 0.45, h: 0.5 },
      { x: 0.45, y: 0, w: 0.55, h: 1 },
    ],
  },
  {
    id: "3-top-hero",
    label: "Top hero",
    hint: "Wide + pair",
    slots: 3,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.58 },
      { x: 0, y: 0.58, w: 0.5, h: 0.42 },
      { x: 0.5, y: 0.58, w: 0.5, h: 0.42 },
    ],
  },
  // 4 photos
  {
    id: "4-grid",
    label: "Grid",
    hint: "2×2 classic",
    slots: 4,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "4-left-hero",
    label: "Left feature",
    hint: "Tall + three",
    slots: 4,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 2 / 3, w: 0.5, h: 1 / 3 },
    ],
  },
  {
    id: "4-magazine",
    label: "Magazine",
    hint: "Feature + strip",
    slots: 4,
    cells: [
      { x: 0, y: 0, w: 0.62, h: 0.62 },
      { x: 0.62, y: 0, w: 0.38, h: 0.62 },
      { x: 0, y: 0.62, w: 0.38, h: 0.38 },
      { x: 0.38, y: 0.62, w: 0.62, h: 0.38 },
    ],
  },
  // 5 photos
  {
    id: "5-left-hero",
    label: "Left feature",
    hint: "Tall + four",
    slots: 5,
    cells: [
      { x: 0, y: 0, w: 0.46, h: 1 },
      { x: 0.46, y: 0, w: 0.54, h: 0.5 },
      { x: 0.46, y: 0.5, w: 0.27, h: 0.5 },
      { x: 0.73, y: 0.5, w: 0.27, h: 0.25 },
      { x: 0.73, y: 0.75, w: 0.27, h: 0.25 },
    ],
  },
  {
    id: "5-top-row",
    label: "Top trio",
    hint: "3 + 2",
    slots: 5,
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  // 6 photos
  {
    id: "6-grid",
    label: "Grid",
    hint: "2×3 tidy",
    slots: 6,
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    ],
  },
  {
    id: "6-magazine",
    label: "Magazine",
    hint: "Feature + five",
    slots: 6,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 2 / 3 },
      { x: 0.5, y: 0, w: 0.5, h: 1 / 3 },
      { x: 0.5, y: 1 / 3, w: 0.5, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ],
  },
];

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Collage cancelled.", "AbortError");
  }
}

export function validateCollageFile(file: File): string | null {
  return validateImageFile(file);
}

export function validateCollageAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one image.";
  }

  for (const file of incoming) {
    const singleError = validateCollageFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_COLLAGE_FILES) {
    return `You can use up to ${MAX_COLLAGE_FILES} photos in one collage.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_COLLAGE_TOTAL_BYTES) {
    return `Collage photo size must be ${formatFileSize(MAX_COLLAGE_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

export function templatesForCount(count: number): CollageTemplate[] {
  return COLLAGE_TEMPLATES.filter((template) => template.slots === count);
}

export function getCollageTemplate(
  templateId: string | undefined,
  count: number,
): CollageTemplate {
  const matching = templatesForCount(count);
  if (matching.length === 0) {
    throw new Error(
      `Add ${MIN_COLLAGE_FILES}–${MAX_COLLAGE_FILES} photos to build a collage.`,
    );
  }
  return matching.find((template) => template.id === templateId) ?? matching[0];
}

export function ratioLabel(ratio: CollageRatio): string {
  switch (ratio) {
    case "square":
      return "Square";
    case "landscape":
      return "Landscape";
    case "portrait":
      return "Portrait";
    case "story":
      return "Story";
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
    canvas.toBlob((blob) => {
      if (!blob || blob.size < 1) {
        reject(new Error("Could not create the collage image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function drawImageInCell(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  fit: CollageFit,
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
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasSizeForRatio(ratio: CollageRatio): {
  width: number;
  height: number;
} {
  const { width: rw, height: rh } = RATIO_SIZE[ratio];
  const longest = Math.max(rw, rh);
  const width = Math.round((DEFAULT_CANVAS_EDGE * rw) / longest);
  const height = Math.round((DEFAULT_CANVAS_EDGE * rh) / longest);
  return scaleCanvasToMax(width, height, MAX_OUTPUT_DIMENSION);
}

/** Inset a unit cell so neighboring cells share an even visual gap. */
function insetCell(
  cell: CollageCell,
  gapX: number,
  gapY: number,
): CollageCell {
  const left = cell.x > 0.001 ? gapX / 2 : 0;
  const right = cell.x + cell.w < 0.999 ? gapX / 2 : 0;
  const top = cell.y > 0.001 ? gapY / 2 : 0;
  const bottom = cell.y + cell.h < 0.999 ? gapY / 2 : 0;
  return {
    x: cell.x + left,
    y: cell.y + top,
    w: Math.max(0, cell.w - left - right),
    h: Math.max(0, cell.h - top - bottom),
  };
}

export async function createPhotoCollage(
  files: File[],
  options: PhotoCollageOptions = {},
): Promise<PhotoCollageResult> {
  const ratio = options.ratio ?? "square";
  const gap = options.gap ?? "small";
  const background = options.background ?? "white";
  const fit = options.fit ?? "cover";
  const { onProgress, signal } = options;

  if (files.length < MIN_COLLAGE_FILES) {
    throw new Error(
      `Add at least ${MIN_COLLAGE_FILES} photos to build a collage.`,
    );
  }
  if (files.length > MAX_COLLAGE_FILES) {
    throw new Error(
      `You can use up to ${MAX_COLLAGE_FILES} photos in one collage.`,
    );
  }

  for (const file of files) {
    const error = validateCollageFile(file);
    if (error) throw new Error(error);
  }

  const template = getCollageTemplate(options.templateId, files.length);

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

  const { width: canvasW, height: canvasH } = canvasSizeForRatio(ratio);
  const gapFraction = GAP_FRACTION[gap];
  const gapX = gapFraction * canvasW;
  const gapY = gapFraction * canvasH;

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

  for (let i = 0; i < template.cells.length; i += 1) {
    throwIfAborted(signal);
    onProgress?.(`Placing photo ${i + 1} of ${template.cells.length}…`);
    const inset = insetCell(template.cells[i], gapX / canvasW, gapY / canvasH);
    const x = Math.round(inset.x * canvasW);
    const y = Math.round(inset.y * canvasH);
    const cellW = Math.max(1, Math.round(inset.w * canvasW));
    const cellH = Math.max(1, Math.round(inset.h * canvasH));
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
    templateId: template.id,
    ratio,
    outputSize: blob.size,
  };
}

export function revokePhotoCollageResult(
  result: PhotoCollageResult | null | undefined,
) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadPhotoCollage(blob: Blob, files: File[]): void {
  const base =
    files.length === 1
      ? fileBaseName(files[0])
      : `${fileBaseName(files[0])}-collage`;
  downloadBlob(blob, `${base}.png`);
}

export function describeCollageOutput(result: PhotoCollageResult): string {
  const template =
    COLLAGE_TEMPLATES.find((item) => item.id === result.templateId)?.label ??
    "Collage";
  return `${result.imageCount} photos · ${template} · ${ratioLabel(result.ratio)} · ${result.width}×${result.height} px · ${formatFileSize(result.outputSize)}`;
}
