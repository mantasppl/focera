import { clamp } from "@/lib/utils";

export type CutoutFormat = "png" | "webp";
export type CutoutShadow = "none" | "soft" | "hard";
export type CutoutOutline = "none" | "white" | "black" | "custom";

const ALPHA_THRESHOLD = 10;
const WEBP_QUALITY = 0.92;

export const CUTOUT_PADDING_PRESETS = [
  { value: 0, label: "None", hint: "No margin" },
  { value: 8, label: "8 px", hint: "Tight" },
  { value: 16, label: "16 px", hint: "Balanced" },
  { value: 32, label: "32 px", hint: "Roomy" },
] as const;

export const CUTOUT_SHADOW_PRESETS: Array<{
  value: CutoutShadow;
  label: string;
  hint: string;
}> = [
  { value: "none", label: "None", hint: "Flat cutout" },
  { value: "soft", label: "Soft", hint: "Natural drop" },
  { value: "hard", label: "Hard", hint: "Sharp contact" },
];

export const CUTOUT_OUTLINE_PRESETS: Array<{
  value: CutoutOutline;
  label: string;
  hint: string;
}> = [
  { value: "none", label: "None", hint: "Clean edge" },
  { value: "white", label: "White", hint: "Sticker" },
  { value: "black", label: "Black", hint: "High contrast" },
  { value: "custom", label: "Custom", hint: "Pick a color" },
];

export const CUTOUT_FORMAT_PRESETS: Array<{
  value: CutoutFormat;
  label: string;
  hint: string;
}> = [
  { value: "png", label: "PNG", hint: "Lossless alpha" },
  { value: "webp", label: "WebP", hint: "Smaller file" },
];

const SHADOW_STYLE: Record<
  Exclude<CutoutShadow, "none">,
  { blur: number; offsetX: number; offsetY: number; color: string }
> = {
  soft: { blur: 28, offsetX: 4, offsetY: 14, color: "rgba(0, 0, 0, 0.38)" },
  hard: { blur: 6, offsetX: 8, offsetY: 10, color: "rgba(0, 0, 0, 0.5)" },
};

export type TransparentCutoutOptions = {
  crop: boolean;
  padding: number;
  shadow: CutoutShadow;
  outline: CutoutOutline;
  outlineColor?: string;
  format: CutoutFormat;
};

export const DEFAULT_CUTOUT_OPTIONS: TransparentCutoutOptions = {
  crop: false,
  padding: 0,
  shadow: "none",
  outline: "none",
  outlineColor: "#ffffff",
  format: "png",
};

export function hasVisualCutoutOptions(
  options: TransparentCutoutOptions,
): boolean {
  return (
    options.crop ||
    options.padding > 0 ||
    options.shadow !== "none" ||
    options.outline !== "none"
  );
}

export function cutoutExtension(format: CutoutFormat, blobType?: string): "png" | "webp" {
  if (format === "webp" && blobType === "image/webp") return "webp";
  return "png";
}

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load cutout"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: CutoutFormat,
): Promise<Blob> {
  const mime = format === "webp" ? "image/webp" : "image/png";
  const quality = format === "webp" ? WEBP_QUALITY : 1;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export cutout"));
      },
      mime,
      quality,
    );
  });
}

function getContext(
  canvas: HTMLCanvasElement,
  willReadFrequently = false,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently });
  if (!ctx) throw new Error("Canvas is not supported in this browser");
  return ctx;
}

function cropToOpaque(source: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = getContext(source, true);
  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return source;

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  if (cropW === width && cropH === height && minX === 0 && minY === 0) {
    return source;
  }

  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  getContext(cropped).drawImage(
    source,
    minX,
    minY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH,
  );
  return cropped;
}

function resolveOutlineColor(
  outline: CutoutOutline,
  customColor?: string,
): string | null {
  if (outline === "none") return null;
  if (outline === "white") return "#ffffff";
  if (outline === "black") return "#111111";
  const custom = customColor?.trim().toLowerCase();
  return custom && /^#[0-9a-f]{6}$/.test(custom) ? custom : "#ffffff";
}

function outlineWidthFor(minDim: number): number {
  return clamp(Math.round(minDim * 0.028), 8, 36);
}

function makeSilhouette(source: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = getContext(canvas);
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function buildSticker(
  subject: HTMLCanvasElement,
  outlineColor: string | null,
): HTMLCanvasElement {
  const outlineW = outlineColor
    ? outlineWidthFor(Math.min(subject.width, subject.height))
    : 0;

  if (!outlineColor || outlineW <= 0) return subject;

  const canvas = document.createElement("canvas");
  canvas.width = subject.width + outlineW * 2;
  canvas.height = subject.height + outlineW * 2;
  const ctx = getContext(canvas);
  const silhouette = makeSilhouette(subject, outlineColor);
  const steps = Math.max(24, Math.ceil(outlineW * Math.PI));

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ctx.drawImage(
      silhouette,
      outlineW + Math.cos(angle) * outlineW,
      outlineW + Math.sin(angle) * outlineW,
    );
  }

  ctx.drawImage(subject, outlineW, outlineW);
  return canvas;
}

function shadowExtents(shadow: CutoutShadow): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  if (shadow === "none") {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }

  const style = SHADOW_STYLE[shadow];
  const blur = Math.ceil(style.blur);
  return {
    left: blur + Math.max(0, -style.offsetX),
    right: blur + Math.max(0, style.offsetX),
    top: blur + Math.max(0, -style.offsetY),
    bottom: blur + Math.max(0, style.offsetY),
  };
}

export async function applyTransparentCutoutOptions(
  source: Blob,
  options: TransparentCutoutOptions,
): Promise<Blob> {
  const padding = clamp(Math.round(options.padding), 0, 64);
  const visual = hasVisualCutoutOptions({ ...options, padding });

  if (!visual && options.format === "png") {
    return source;
  }

  const image = await loadImage(source);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  getContext(sourceCanvas).drawImage(image, 0, 0);

  if (!visual) {
    return canvasToBlob(sourceCanvas, options.format);
  }

  const subject = options.crop ? cropToOpaque(sourceCanvas) : sourceCanvas;
  const outlineColor = resolveOutlineColor(options.outline, options.outlineColor);
  const sticker = buildSticker(subject, outlineColor);
  const shadowPad = shadowExtents(options.shadow);

  const canvas = document.createElement("canvas");
  canvas.width = sticker.width + padding * 2 + shadowPad.left + shadowPad.right;
  canvas.height = sticker.height + padding * 2 + shadowPad.top + shadowPad.bottom;

  const ctx = getContext(canvas);
  const x = padding + shadowPad.left;
  const y = padding + shadowPad.top;

  if (options.shadow !== "none") {
    const style = SHADOW_STYLE[options.shadow];
    ctx.shadowColor = style.color;
    ctx.shadowBlur = style.blur;
    ctx.shadowOffsetX = style.offsetX;
    ctx.shadowOffsetY = style.offsetY;
  }

  ctx.drawImage(sticker, x, y);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  try {
    const blob = await canvasToBlob(canvas, options.format);
    if (options.format === "webp" && blob.type !== "image/webp") {
      return canvasToBlob(canvas, "png");
    }
    return blob;
  } catch {
    if (options.format === "webp") {
      return canvasToBlob(canvas, "png");
    }
    throw new Error("Failed to export cutout");
  }
}
