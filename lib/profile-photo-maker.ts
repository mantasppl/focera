import { downloadBlob, fileBaseName } from "@/lib/image";

export const MIN_OUTPUT_SIZE = 32;
export const MAX_OUTPUT_SIZE = 2048;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export type ProfileShape = "square" | "circle";

export type ProfileSizePreset = {
  id: string;
  label: string;
  hint: string;
  size: number;
};

export const PROFILE_SIZE_PRESETS: ProfileSizePreset[] = [
  { id: "linkedin", label: "400×400", hint: "LinkedIn", size: 400 },
  { id: "instagram", label: "320×320", hint: "Instagram", size: 320 },
  { id: "twitter", label: "400×400", hint: "X / Twitter", size: 400 },
  { id: "facebook", label: "180×180", hint: "Facebook", size: 180 },
  { id: "discord", label: "128×128", hint: "Discord", size: 128 },
  { id: "hd", label: "800×800", hint: "HD", size: 800 },
  { id: "retina", label: "1024×1024", hint: "Retina", size: 1024 },
];

export type CropState = {
  /** Zoom ≥ 1. 1 = largest square that fits the image. */
  zoom: number;
  /** Horizontal pan 0–1 (0 = left-aligned crop, 1 = right-aligned). */
  panX: number;
  /** Vertical pan 0–1 (0 = top-aligned crop, 1 = bottom-aligned). */
  panY: number;
};

export type ProfilePhotoResult = {
  blob: Blob;
  size: number;
  shape: ProfileShape;
  originalWidth: number;
  originalHeight: number;
};

export type CreateProfilePhotoOptions = {
  size: number;
  shape: ProfileShape;
  crop: CropState;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Profile photo cancelled.", "AbortError");
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
        reject(new Error("Could not export the profile photo."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function clampOutputSize(value: number): number {
  if (!Number.isFinite(value)) return MIN_OUTPUT_SIZE;
  return Math.min(MAX_OUTPUT_SIZE, Math.max(MIN_OUTPUT_SIZE, Math.round(value)));
}

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return MIN_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function clampPan(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

export function defaultCropState(): CropState {
  return { zoom: 1, panX: 0.5, panY: 0.5 };
}

/** Source crop square for the given image size and crop state. */
export function getSourceCropRect(
  imageWidth: number,
  imageHeight: number,
  crop: CropState,
): { sx: number; sy: number; sSize: number } {
  const base = Math.min(imageWidth, imageHeight);
  const zoom = clampZoom(crop.zoom);
  const sSize = base / zoom;
  const maxX = Math.max(0, imageWidth - sSize);
  const maxY = Math.max(0, imageHeight - sSize);
  const sx = clampPan(crop.panX) * maxX;
  const sy = clampPan(crop.panY) * maxY;
  return { sx, sy, sSize };
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

export function downloadProfilePhoto(
  blob: Blob,
  sourceFile: File,
  size: number,
  shape: ProfileShape,
) {
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-profile-${shape}-${size}x${size}.png`,
  );
}

export async function createProfilePhoto(
  file: File,
  options: CreateProfilePhotoOptions,
): Promise<ProfilePhotoResult> {
  const { onProgress, signal, shape } = options;
  const size = clampOutputSize(options.size);
  const crop: CropState = {
    zoom: clampZoom(options.crop.zoom),
    panX: clampPan(options.crop.panX),
    panY: clampPan(options.crop.panY),
  };

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  const { sx, sy, sSize } = getSourceCropRect(
    originalWidth,
    originalHeight,
    crop,
  );

  onProgress?.(`Creating ${size}×${size} ${shape} profile…`);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(image, sx, sy, sSize, sSize, 0, 0, size, size);

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    size,
    shape,
    originalWidth,
    originalHeight,
  };
}
