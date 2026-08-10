import { downloadBlob, fileBaseName } from "@/lib/image";

export type TextPosition =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type TextPositionOption = {
  value: TextPosition;
  label: string;
  hint: string;
};

export const TEXT_POSITIONS: TextPositionOption[] = [
  { value: "center", label: "Center", hint: "Middle" },
  { value: "top-left", label: "Top left", hint: "Header corner" },
  { value: "top-center", label: "Top center", hint: "Header" },
  { value: "top-right", label: "Top right", hint: "Header corner" },
  { value: "bottom-left", label: "Bottom left", hint: "Footer corner" },
  { value: "bottom-center", label: "Bottom center", hint: "Footer" },
  { value: "bottom-right", label: "Bottom right", hint: "Footer corner" },
];

export type TextFontId =
  | "sans"
  | "sans-bold"
  | "serif"
  | "serif-bold"
  | "mono";

export type TextFontOption = {
  value: TextFontId;
  label: string;
  hint: string;
  css: string;
};

export const TEXT_FONTS: TextFontOption[] = [
  {
    value: "sans",
    label: "Sans",
    hint: "Clean",
    css: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  },
  {
    value: "sans-bold",
    label: "Sans Bold",
    hint: "Strong",
    css: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  },
  {
    value: "serif",
    label: "Serif",
    hint: "Classic",
    css: 'Georgia, "Times New Roman", Times, serif',
  },
  {
    value: "serif-bold",
    label: "Serif Bold",
    hint: "Strong",
    css: 'Georgia, "Times New Roman", Times, serif',
  },
  {
    value: "mono",
    label: "Mono",
    hint: "Fixed width",
    css: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
];

export type TextColorId =
  | "white"
  | "black"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "yellow";

export type TextColorOption = {
  value: TextColorId;
  label: string;
  hint: string;
  hex: string;
};

export const TEXT_COLORS: TextColorOption[] = [
  { value: "white", label: "White", hint: "Bright", hex: "#ffffff" },
  { value: "black", label: "Black", hint: "Default", hex: "#1f1f1f" },
  { value: "gray", label: "Gray", hint: "Subtle", hex: "#737373" },
  { value: "red", label: "Red", hint: "Highlight", hex: "#c01e1e" },
  { value: "blue", label: "Blue", hint: "Accent", hex: "#1f4799" },
  { value: "green", label: "Green", hint: "Accent", hex: "#147352" },
  { value: "yellow", label: "Yellow", hint: "Bright", hex: "#f5c518" },
];

export type TextRotation = 0 | 45 | -45;

export type TextRotationOption = {
  value: TextRotation;
  label: string;
  hint: string;
};

export const TEXT_ROTATIONS: TextRotationOption[] = [
  { value: 0, label: "None", hint: "Upright" },
  { value: 45, label: "45°", hint: "Diagonal" },
  { value: -45, label: "-45°", hint: "Diagonal" },
];

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 240;
export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_OPACITY = 1;
export const MAX_TEXT_LENGTH = 500;
export const LINE_HEIGHT_RATIO = 1.25;
const MARGIN_RATIO = 0.04;

export type AddTextOnImageOptions = {
  text: string;
  position?: TextPosition;
  fontId?: TextFontId;
  colorId?: TextColorId;
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
  position: TextPosition;
  fontId: TextFontId;
  colorId: TextColorId;
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
  if (!Number.isFinite(value)) return DEFAULT_FONT_SIZE;
  return Math.round(clamp(value, MIN_FONT_SIZE, MAX_FONT_SIZE));
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

function resolveFont(fontId: TextFontId): TextFontOption {
  return TEXT_FONTS.find((option) => option.value === fontId) ?? TEXT_FONTS[0]!;
}

function resolveColor(colorId: TextColorId): string {
  return (
    TEXT_COLORS.find((option) => option.value === colorId)?.hex ?? "#1f1f1f"
  );
}

function isBold(fontId: TextFontId): boolean {
  return fontId === "sans-bold" || fontId === "serif-bold";
}

function fontCss(fontId: TextFontId, fontSize: number): string {
  const weight = isBold(fontId) ? 700 : 400;
  const family = resolveFont(fontId).css;
  return `${weight} ${fontSize}px ${family}`;
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

function positionBlock(
  position: TextPosition,
  imageWidth: number,
  imageHeight: number,
  blockWidth: number,
  blockHeight: number,
): { x: number; y: number } {
  const margin = Math.max(8, Math.min(imageWidth, imageHeight) * MARGIN_RATIO);

  switch (position) {
    case "top-left":
      return { x: margin, y: margin };
    case "top-center":
      return { x: (imageWidth - blockWidth) / 2, y: margin };
    case "top-right":
      return { x: imageWidth - blockWidth - margin, y: margin };
    case "bottom-left":
      return { x: margin, y: imageHeight - blockHeight - margin };
    case "bottom-center":
      return {
        x: (imageWidth - blockWidth) / 2,
        y: imageHeight - blockHeight - margin,
      };
    case "bottom-right":
      return {
        x: imageWidth - blockWidth - margin,
        y: imageHeight - blockHeight - margin,
      };
    case "center":
    default:
      return {
        x: (imageWidth - blockWidth) / 2,
        y: (imageHeight - blockHeight) / 2,
      };
  }
}

function horizontalAlign(position: TextPosition): CanvasTextAlign {
  if (position.endsWith("left")) return "left";
  if (position.endsWith("right")) return "right";
  return "center";
}

function lineX(
  originX: number,
  blockWidth: number,
  align: CanvasTextAlign,
): number {
  if (align === "left") return originX;
  if (align === "right") return originX + blockWidth;
  return originX + blockWidth / 2;
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

  const fontSize = clampFontSize(options.fontSize) * scale;
  const opacity = clamp(options.opacity, 0.05, 1);
  const color = resolveColor(options.colorId);
  const align = horizontalAlign(options.position);

  ctx.save();
  ctx.font = fontCss(options.fontId, fontSize);
  ctx.textBaseline = "top";
  ctx.textAlign = align;
  ctx.globalAlpha = opacity;

  const maxWidth = Math.max(16, canvasWidth * (1 - MARGIN_RATIO * 2));
  const lines = layoutLines(ctx, text, maxWidth);
  const size = blockSize(ctx, lines, fontSize);
  const origin = positionBlock(
    options.position,
    canvasWidth,
    canvasHeight,
    size.width,
    size.height,
  );

  const centerX = origin.x + size.width / 2;
  const centerY = origin.y + size.height / 2;
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;

  if (options.rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((options.rotation * Math.PI) / 180);
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
    const x = lineX(origin.x, size.width, align);
    if (options.outline && line) {
      ctx.strokeText(line, x, y);
    }
    if (line) {
      ctx.fillText(line, x, y);
    }
  });

  ctx.restore();
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the image with text."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function downloadTextImage(blob: Blob, sourceFile: File) {
  downloadBlob(blob, `${fileBaseName(sourceFile)}-with-text.png`);
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
    position = "center",
    fontId = "sans",
    colorId = "white",
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
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  drawTextOnCanvas(ctx, image, width, height, width, height, {
    text,
    position,
    fontId,
    colorId,
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
