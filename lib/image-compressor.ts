import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  validateImageFile,
} from "@/lib/image";

export type CompressLevel = "extreme" | "strong" | "balanced" | "light";

export type OutputFormat = "auto" | "jpeg" | "webp";

export type CompressImagePreset = {
  level: CompressLevel;
  label: string;
  hint: string;
  quality: number;
  maxDimension: number;
};

export const COMPRESS_IMAGE_PRESETS: CompressImagePreset[] = [
  {
    level: "extreme",
    label: "Extreme",
    hint: "Smallest file",
    quality: 0.4,
    maxDimension: 1280,
  },
  {
    level: "strong",
    label: "Strong",
    hint: "High savings",
    quality: 0.55,
    maxDimension: 1600,
  },
  {
    level: "balanced",
    label: "Balanced",
    hint: "Good default",
    quality: 0.72,
    maxDimension: 2048,
  },
  {
    level: "light",
    label: "Light",
    hint: "Best quality",
    quality: 0.85,
    maxDimension: 4096,
  },
];

export const OUTPUT_FORMAT_OPTIONS: {
  value: OutputFormat;
  label: string;
  hint: string;
}[] = [
  { value: "auto", label: "Auto", hint: "Smart pick" },
  { value: "jpeg", label: "JPEG", hint: "Photos" },
  { value: "webp", label: "WebP", hint: "Modern" },
];

export type CompressImageResult = {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  mimeType: "image/jpeg" | "image/webp";
  extension: "jpg" | "webp";
};

export type CompressImageOptions = {
  level?: CompressLevel;
  format?: OutputFormat;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Compression cancelled.", "AbortError");
  }
}

function getPreset(level: CompressLevel): CompressImagePreset {
  return (
    COMPRESS_IMAGE_PRESETS.find((preset) => preset.level === level) ??
    COMPRESS_IMAGE_PRESETS[2]
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

function targetDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function resolveFormat(
  format: OutputFormat,
  sourceType: string,
): "image/jpeg" | "image/webp" {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (sourceType === "image/png" || sourceType === "image/webp") {
    return "image/webp";
  }
  return "image/jpeg";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/jpeg" | "image/webp",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              mimeType === "image/webp"
                ? "WebP encoding is not supported in this browser. Try JPEG instead."
                : "Could not encode the compressed image.",
            ),
          );
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  throwIfAborted(options.signal);
  options.onProgress?.("Loading image…");

  const image = await loadImage(file);
  throwIfAborted(options.signal);

  const preset = getPreset(options.level ?? "balanced");
  const { width, height } = targetDimensions(
    image.naturalWidth,
    image.naturalHeight,
    preset.maxDimension,
  );

  options.onProgress?.(
    width === image.naturalWidth && height === image.naturalHeight
      ? "Encoding…"
      : `Resizing to ${width}×${height}…`,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const mimeType = resolveFormat(options.format ?? "auto", file.type);
  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  throwIfAborted(options.signal);
  options.onProgress?.("Compressing…");

  let blob = await canvasToBlob(canvas, mimeType, preset.quality);

  // If Auto + WebP didn't shrink (or grew), fall back to JPEG when helpful.
  if (
    (options.format ?? "auto") === "auto" &&
    mimeType === "image/webp" &&
    blob.size >= file.size
  ) {
    throwIfAborted(options.signal);
    options.onProgress?.("Trying JPEG for better savings…");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", preset.quality);
    if (jpegBlob.size < blob.size) {
      blob = jpegBlob;
    }
  }

  canvas.width = 0;
  canvas.height = 0;

  throwIfAborted(options.signal);

  const originalSize = file.size;
  const compressedSize = blob.size;
  const savingsPercent =
    originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;
  const finalMime =
    blob.type === "image/webp" ? "image/webp" : "image/jpeg";

  return {
    blob,
    originalSize,
    compressedSize,
    savingsPercent,
    width,
    height,
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
    mimeType: finalMime,
    extension: finalMime === "image/webp" ? "webp" : "jpg",
  };
}

export function downloadCompressedImage(blob: Blob, sourceFile: File, extension: "jpg" | "webp") {
  const base = fileBaseName(sourceFile) || "image";
  downloadBlob(blob, `${base}-compressed.${extension}`);
}

export function describeSavings(
  originalSize: number,
  compressedSize: number,
  savingsPercent: number,
): string {
  if (compressedSize < originalSize) {
    return `Reduced ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savingsPercent}% smaller)`;
  }
  if (compressedSize === originalSize) {
    return `Size unchanged at ${formatFileSize(compressedSize)}`;
  }
  return `Result is ${formatFileSize(compressedSize)} (original ${formatFileSize(originalSize)}). Try a stronger level.`;
}
