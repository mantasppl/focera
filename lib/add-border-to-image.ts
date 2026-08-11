import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  validateImageFile,
} from "@/lib/image";

export type BorderWidthId = "thin" | "medium" | "thick" | "xl";

export type BorderWidthPreset = {
  id: BorderWidthId;
  label: string;
  hint: string;
  /** Fraction of the shorter image side used as padding on each edge. */
  ratio: number;
};

export const BORDER_WIDTH_PRESETS: BorderWidthPreset[] = [
  { id: "thin", label: "Thin", hint: "Subtle edge", ratio: 0.02 },
  { id: "medium", label: "Medium", hint: "Balanced", ratio: 0.05 },
  { id: "thick", label: "Thick", hint: "Bold frame", ratio: 0.09 },
  { id: "xl", label: "Extra", hint: "Polaroid feel", ratio: 0.14 },
];

export type BorderColorId =
  | "white"
  | "black"
  | "gray"
  | "cream"
  | "navy"
  | "forest";

export type BorderColorOption = {
  value: BorderColorId;
  label: string;
  hint: string;
  hex: string;
};

export const BORDER_COLORS: BorderColorOption[] = [
  { value: "white", label: "White", hint: "Clean", hex: "#ffffff" },
  { value: "black", label: "Black", hint: "Classic", hex: "#111111" },
  { value: "gray", label: "Gray", hint: "Soft", hex: "#9ca3af" },
  { value: "cream", label: "Cream", hint: "Warm", hex: "#f5f0e6" },
  { value: "navy", label: "Navy", hint: "Deep", hex: "#1e3a5f" },
  { value: "forest", label: "Forest", hint: "Green", hex: "#1f4d3a" },
];

export type AddBorderToImageResult = {
  blob: Blob;
  width: number;
  height: number;
  borderPx: number;
  colorId: BorderColorId;
  widthId: BorderWidthId;
};

export type AddBorderToImageOptions = {
  widthId?: BorderWidthId;
  colorId?: BorderColorId;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Add border cancelled.", "AbortError");
  }
}

function getWidthPreset(id: BorderWidthId): BorderWidthPreset {
  return (
    BORDER_WIDTH_PRESETS.find((preset) => preset.id === id) ??
    BORDER_WIDTH_PRESETS[1]
  );
}

function resolveColor(colorId: BorderColorId): string {
  return (
    BORDER_COLORS.find((option) => option.value === colorId)?.hex ?? "#ffffff"
  );
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

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the bordered image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function borderPixelsForImage(
  imageWidth: number,
  imageHeight: number,
  widthId: BorderWidthId,
): number {
  const preset = getWidthPreset(widthId);
  const shorter = Math.min(imageWidth, imageHeight);
  return Math.max(1, Math.round(shorter * preset.ratio));
}

export async function addBorderToImage(
  file: File,
  options: AddBorderToImageOptions = {},
): Promise<AddBorderToImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  throwIfAborted(options.signal);
  options.onProgress?.("Loading image…");

  const image = await loadImage(file);
  throwIfAborted(options.signal);

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("Could not read image dimensions.");
  }

  const widthId = options.widthId ?? "medium";
  const colorId = options.colorId ?? "white";
  const borderPx = borderPixelsForImage(sourceWidth, sourceHeight, widthId);
  const outWidth = sourceWidth + borderPx * 2;
  const outHeight = sourceHeight + borderPx * 2;

  options.onProgress?.("Adding border…");

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = resolveColor(colorId);
  context.fillRect(0, 0, outWidth, outHeight);
  context.drawImage(image, borderPx, borderPx, sourceWidth, sourceHeight);

  throwIfAborted(options.signal);
  options.onProgress?.("Encoding PNG…");

  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  throwIfAborted(options.signal);

  return {
    blob,
    width: outWidth,
    height: outHeight,
    borderPx,
    colorId,
    widthId,
  };
}

export function downloadBorderedImage(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "photo";
  downloadBlob(blob, `${base}-border.png`);
}

export function describeBorderResult(
  width: number,
  height: number,
  borderPx: number,
  colorId: BorderColorId,
  widthId: BorderWidthId,
  byteSize: number,
): string {
  const color =
    BORDER_COLORS.find((option) => option.value === colorId)?.label ?? "Border";
  const size =
    BORDER_WIDTH_PRESETS.find((preset) => preset.id === widthId)?.label ??
    "Medium";
  return `${width}×${height} · ${size} ${color} (${borderPx}px) · ${formatFileSize(byteSize)}`;
}
