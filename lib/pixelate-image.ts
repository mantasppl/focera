import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  validateImageFile,
} from "@/lib/image";

export type PixelateIntensity = "light" | "medium" | "heavy";

export type PixelatePreset = {
  id: PixelateIntensity;
  label: string;
  hint: string;
  /** Smaller divisor → larger blocks. Applied to min(width, height). */
  divisor: number;
};

export const PIXELATE_PRESETS: PixelatePreset[] = [
  {
    id: "light",
    label: "Light",
    hint: "Subtle mosaic",
    divisor: 64,
  },
  {
    id: "medium",
    label: "Medium",
    hint: "Classic pixel look",
    divisor: 32,
  },
  {
    id: "heavy",
    label: "Heavy",
    hint: "Bold blocks",
    divisor: 16,
  },
];

export type PixelateImageResult = {
  blob: Blob;
  width: number;
  height: number;
  intensity: PixelateIntensity;
  blockSize: number;
};

export type PixelateImageOptions = {
  intensity?: PixelateIntensity;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Pixelate cancelled.", "AbortError");
  }
}

function getPreset(intensity: PixelateIntensity): PixelatePreset {
  return (
    PIXELATE_PRESETS.find((preset) => preset.id === intensity) ??
    PIXELATE_PRESETS[1]
  );
}

function resolveBlockSize(
  width: number,
  height: number,
  divisor: number,
): number {
  const minDim = Math.min(width, height);
  return Math.max(2, Math.round(minDim / divisor));
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
        reject(new Error("Could not export the pixelated image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function pixelateImage(
  file: File,
  options: PixelateImageOptions = {},
): Promise<PixelateImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  throwIfAborted(options.signal);
  options.onProgress?.("Loading image…");

  const image = await loadImage(file);
  throwIfAborted(options.signal);

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) {
    throw new Error("Could not read image dimensions.");
  }

  const preset = getPreset(options.intensity ?? "medium");
  const blockSize = resolveBlockSize(width, height, preset.divisor);
  const smallWidth = Math.max(1, Math.round(width / blockSize));
  const smallHeight = Math.max(1, Math.round(height / blockSize));

  options.onProgress?.("Pixelating…");

  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = smallWidth;
  smallCanvas.height = smallHeight;
  const smallContext = smallCanvas.getContext("2d");
  if (!smallContext) {
    throw new Error("Canvas is not supported in this browser.");
  }

  smallContext.imageSmoothingEnabled = true;
  smallContext.drawImage(image, 0, 0, smallWidth, smallHeight);

  throwIfAborted(options.signal);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(smallCanvas, 0, 0, width, height);

  smallCanvas.width = 0;
  smallCanvas.height = 0;

  throwIfAborted(options.signal);
  options.onProgress?.("Encoding PNG…");

  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  throwIfAborted(options.signal);

  return {
    blob,
    width,
    height,
    intensity: preset.id,
    blockSize,
  };
}

export function downloadPixelatedImage(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "image";
  downloadBlob(blob, `${base}-pixelated.png`);
}

export function describePixelateResult(
  width: number,
  height: number,
  intensity: PixelateIntensity,
  blockSize: number,
  byteSize: number,
): string {
  const preset = getPreset(intensity);
  return `${width}×${height} · ${preset.label} · ${blockSize}px blocks · ${formatFileSize(byteSize)}`;
}
