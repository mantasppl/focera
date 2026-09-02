import { downloadBlob, fileBaseName } from "@/lib/image";
import {
  TEXT_FONTS,
  TEXT_FONT_CATEGORIES,
  TEXT_FONT_COUNT,
  ensureFontReady,
  ensureTextFontsLoaded,
  fontCss,
  getFontOption,
  type TextFontCategory,
  type TextFontId,
  type TextFontOption,
  type TextFontSource,
} from "@/lib/add-text-on-image-fonts";

export {
  TEXT_FONTS,
  TEXT_FONT_CATEGORIES,
  TEXT_FONT_COUNT,
  ensureFontReady,
  ensureTextFontsLoaded,
  fontCss,
  getFontOption,
  type TextFontCategory,
  type TextFontId,
  type TextFontOption,
  type TextFontSource,
};

export const DEFAULT_TEXT_COLOR = "#ffffff";

export const TEXT_COLOR_PRESETS = [
  "#ffffff",
  "#000000",
  "#1f1f1f",
  "#404040",
  "#737373",
  "#a3a3a3",
  "#d4d4d4",
  "#f5f5f5",
  "#ef4444",
  "#dc2626",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#c01e1e",
  "#1f4799",
  "#147352",
  "#f5c518",
  "#ffb3ba",
  "#bae1ff",
  "#0f172a",
] as const;

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }
  return DEFAULT_TEXT_COLOR;
}

/** Top-left corner of the text block, as a fraction of image width/height. */
export type TextPlacement = {
  x: number;
  y: number;
};

export type TextBlockBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TextRotation = number;

export function normalizeRotation(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  let value = degrees % 360;
  if (value > 180) value -= 360;
  if (value < -180) value += 360;
  return Math.round(value * 10) / 10;
}

export const MIN_FONT_SIZE = 1;
export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_OPACITY = 1;
export const MAX_TEXT_LENGTH = 500;
export const LINE_HEIGHT_RATIO = 1.25;
const MARGIN_RATIO = 0.04;

export type AddTextOnImageOptions = {
  text: string;
  placement?: TextPlacement;
  fontId?: TextFontId;
  color?: string;
  rotation?: TextRotation;
  fontSize?: number;
  /** 0–1 */
  opacity?: number;
  /** Soft dark outline for contrast on busy photos. */
  outline?: boolean;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

export type AddTextOnImageResult = {
  blob: Blob;
  width: number;
  height: number;
};

export type DrawTextOptions = {
  text: string;
  placement: TextPlacement;
  fontId: TextFontId;
  color: string;
  rotation: TextRotation;
  fontSize: number;
  opacity: number;
  outline: boolean;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Add text cancelled.", "AbortError");
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampFontSize(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_FONT_SIZE;
  return Math.round(Math.max(MIN_FONT_SIZE, value));
}

export function defaultFontSizeForImage(
  width: number,
  height: number,
): number {
  const base = Math.min(width, height) * 0.07;
  return clampFontSize(base);
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

function wrapLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text) return [""];

  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];

  const lines: string[] = [];
  let current = words[0]!;

  for (let i = 1; i < words.length; i += 1) {
    const word = words[i]!;
    const next = `${current} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
}

function layoutLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const softLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];

  for (const softLine of softLines) {
    if (!softLine.trim()) {
      lines.push("");
      continue;
    }
    lines.push(...wrapLine(ctx, softLine, maxWidth));
  }

  return lines.length ? lines : [""];
}

function blockSize(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  fontSize: number,
): { width: number; height: number } {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const width = Math.max(
    0,
    ...lines.map((line) => (line ? ctx.measureText(line).width : 0)),
  );
  const height = Math.max(fontSize, lines.length * lineHeight);
  return { width, height };
}

function placementToOrigin(
  placement: TextPlacement,
  imageWidth: number,
  imageHeight: number,
): { x: number; y: number } {
  return {
    x: placement.x * imageWidth,
    y: placement.y * imageHeight,
  };
}

type TextLayout = {
  fontSize: number;
  lines: string[];
  size: { width: number; height: number };
  lineHeight: number;
};

function computeTextLayout(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  options: Pick<DrawTextOptions, "text" | "fontId" | "fontSize">,
  scale: number,
): TextLayout | null {
  const text = options.text.trimEnd();
  if (!text.trim()) return null;

  const fontSize = clampFontSize(options.fontSize) * scale;
  ctx.font = fontCss(options.fontId, fontSize);
  const maxWidth = Math.max(16, canvasWidth * (1 - MARGIN_RATIO * 2));
  const lines = layoutLines(ctx, text, maxWidth);
  const size = blockSize(ctx, lines, fontSize);
  return { fontSize, lines, size, lineHeight: fontSize * LINE_HEIGHT_RATIO };
}

/** Measure the text block on a canvas-sized surface (preview or full export). */
export function measureTextBlock(
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  options: DrawTextOptions,
): TextBlockBounds | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = canvasWidth / sourceWidth;
  const layout = computeTextLayout(ctx, canvasWidth, options, scale);
  if (!layout) return null;

  const origin = placementToOrigin(
    options.placement,
    canvasWidth,
    canvasHeight,
  );

  return {
    x: origin.x,
    y: origin.y,
    width: layout.size.width,
    height: layout.size.height,
  };
}

/** Measure text block size in full image coordinates. */
export function measureTextBlockSize(
  imageWidth: number,
  options: Omit<DrawTextOptions, "placement">,
): { width: number; height: number } | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const layout = computeTextLayout(ctx, imageWidth, options, 1);
  if (!layout) return null;
  return layout.size;
}

/** Keep the text block centered on a point while updating placement. */
export function placementForCenter(
  centerX: number,
  centerY: number,
  blockWidth: number,
  blockHeight: number,
  imageWidth: number,
  imageHeight: number,
): TextPlacement {
  return {
    x: (centerX - blockWidth / 2) / imageWidth,
    y: (centerY - blockHeight / 2) / imageHeight,
  };
}

export function textBlockCenter(
  bounds: TextBlockBounds,
): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/** Center the text block on the image (full-resolution coordinates). */
export function centeredPlacement(
  sourceWidth: number,
  sourceHeight: number,
  options: Omit<DrawTextOptions, "placement">,
): TextPlacement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { x: 0.5, y: 0.5 };

  const layout = computeTextLayout(ctx, sourceWidth, options, 1);
  if (!layout) return { x: 0.5, y: 0.5 };

  return {
    x: (sourceWidth - layout.size.width) / 2 / sourceWidth,
    y: (sourceHeight - layout.size.height) / 2 / sourceHeight,
  };
}

/** Draw the source image and text overlay onto an existing canvas (full or preview size). */
export function drawTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  options: DrawTextOptions,
) {
  const scaleX = canvasWidth / sourceWidth;
  const scaleY = canvasHeight / sourceHeight;
  const scale = Math.min(scaleX, scaleY);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);

  const text = options.text.trimEnd();
  if (!text.trim()) return;

  const opacity = clamp(options.opacity, 0.05, 1);
  const color = normalizeHexColor(options.color);

  const layout = computeTextLayout(ctx, canvasWidth, options, scale);
  if (!layout) return;

  const { fontSize, lines, size, lineHeight } = layout;
  const origin = placementToOrigin(
    options.placement,
    canvasWidth,
    canvasHeight,
  );

  const centerX = origin.x + size.width / 2;
  const centerY = origin.y + size.height / 2;

  ctx.save();
  ctx.font = fontCss(options.fontId, fontSize);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.globalAlpha = opacity;

  if (options.rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((normalizeRotation(options.rotation) * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  if (options.outline) {
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(2, fontSize * 0.12);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
  }

  ctx.fillStyle = color;

  lines.forEach((line, index) => {
    const y = origin.y + index * lineHeight;
    const x = origin.x;
    if (options.outline && line) {
      ctx.strokeText(line, x, y);
    }
    if (line) {
      ctx.fillText(line, x, y);
    }
  });

  ctx.restore();
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the image with text."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasToBlob(canvas, "image/png");
}

export type TextDownloadFormat = "jpg" | "png" | "webp";

export const TEXT_DOWNLOAD_FORMATS: Array<{
  value: TextDownloadFormat;
  label: string;
  hint: string;
}> = [
  {
    value: "jpg",
    label: "JPG",
    hint: "Smaller file size, great for photos",
  },
  {
    value: "png",
    label: "PNG",
    hint: "Lossless quality, supports transparency",
  },
  {
    value: "webp",
    label: "WebP",
    hint: "Modern format, best compression",
  },
];

async function encodeTextImageDownload(
  source: Blob,
  format: TextDownloadFormat,
): Promise<Blob> {
  if (format === "jpg" && source.type === "image/jpeg") return source;
  if (format === "png" && source.type === "image/png") return source;
  if (format === "webp" && source.type === "image/webp") return source;

  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha: format !== "jpg" });
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas is not supported in this browser.");
  }

  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mimeType =
    format === "jpg"
      ? "image/jpeg"
      : format === "webp"
        ? "image/webp"
        : "image/png";
  const blob = await canvasToBlob(canvas, mimeType, 0.92);
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

export async function downloadTextImage(
  blob: Blob,
  sourceFile: File,
  format: TextDownloadFormat = "png",
) {
  const encoded = await encodeTextImageDownload(blob, format);
  downloadBlob(encoded, `${fileBaseName(sourceFile)}-with-text.${format}`);
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

export async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return loadImage(file);
}

export async function addTextOnImage(
  file: File,
  options: AddTextOnImageOptions,
): Promise<AddTextOnImageResult> {
  const {
    onProgress,
    signal,
    text,
    placement,
    fontId = "system-sans",
    color = DEFAULT_TEXT_COLOR,
    rotation = 0,
    fontSize = DEFAULT_FONT_SIZE,
    opacity = DEFAULT_OPACITY,
    outline = true,
  } = options;

  throwIfAborted(signal);

  if (!text.trim()) {
    throw new Error("Enter some text to add to the image.");
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text must be ${MAX_TEXT_LENGTH} characters or fewer.`);
  }

  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }

  onProgress?.("Drawing text…");
  await ensureFontReady(fontId, clampFontSize(fontSize));
  throwIfAborted(signal);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const resolvedPlacement =
    placement ??
    centeredPlacement(width, height, {
      text,
      fontId,
      color,
      rotation,
      fontSize: clampFontSize(fontSize),
      opacity,
      outline,
    });

  drawTextOnCanvas(ctx, image, width, height, width, height, {
    text,
    placement: resolvedPlacement,
    fontId,
    color: normalizeHexColor(color),
    rotation,
    fontSize: clampFontSize(fontSize),
    opacity,
    outline,
  });

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return { blob, width, height };
}
