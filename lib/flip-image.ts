import { downloadBlob, fileBaseName } from "@/lib/image";

export type FlipDirection = "horizontal" | "vertical" | "both";

export type FlipDirectionPreset = {
  id: FlipDirection;
  label: string;
  hint: string;
};

export const FLIP_DIRECTION_PRESETS: FlipDirectionPreset[] = [
  { id: "horizontal", label: "Horizontal", hint: "Mirror left–right" },
  { id: "vertical", label: "Vertical", hint: "Mirror top–bottom" },
  { id: "both", label: "Both", hint: "Flip both axes" },
];

export type FlipImageResult = {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  direction: FlipDirection;
};

export type FlipImageOptions = {
  direction: FlipDirection;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Flip cancelled.", "AbortError");
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

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the flipped image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function flipScale(direction: FlipDirection): {
  scaleX: number;
  scaleY: number;
} {
  return {
    scaleX: direction === "vertical" ? 1 : -1,
    scaleY: direction === "horizontal" ? 1 : -1,
  };
}

export function describeFlip(direction: FlipDirection): string {
  if (direction === "horizontal") return "Flipped horizontally";
  if (direction === "vertical") return "Flipped vertically";
  return "Flipped horizontally and vertically";
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

export function downloadFlippedImage(
  blob: Blob,
  sourceFile: File,
  direction: FlipDirection,
) {
  downloadBlob(blob, `${fileBaseName(sourceFile)}-flipped-${direction}.png`);
}

export async function flipImageFile(
  file: File,
  options: FlipImageOptions,
): Promise<FlipImageResult> {
  const { onProgress, signal, direction } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  onProgress?.(`${describeFlip(direction)}…`);

  const canvas = document.createElement("canvas");
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const { scaleX, scaleY } = flipScale(direction);
  ctx.translate(scaleX === -1 ? originalWidth : 0, scaleY === -1 ? originalHeight : 0);
  ctx.scale(scaleX, scaleY);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0);

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width: originalWidth,
    height: originalHeight,
    originalWidth,
    originalHeight,
    direction,
  };
}
