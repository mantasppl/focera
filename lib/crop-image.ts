import { downloadBlob, fileBaseName } from "@/lib/image";

export const MIN_CROP_SIZE = 1;

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AspectRatioPreset = {
  id: string;
  label: string;
  hint: string;
  /** null = freeform */
  ratio: number | null;
};

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { id: "free", label: "Free", hint: "Any shape", ratio: null },
  { id: "1:1", label: "1:1", hint: "Square", ratio: 1 },
  { id: "4:3", label: "4:3", hint: "Classic", ratio: 4 / 3 },
  { id: "3:2", label: "3:2", hint: "Photo", ratio: 3 / 2 },
  { id: "16:9", label: "16:9", hint: "Widescreen", ratio: 16 / 9 },
  { id: "9:16", label: "9:16", hint: "Story", ratio: 9 / 16 },
];

export type CropImageResult = {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  crop: CropRect;
};

export type CropImageOptions = {
  crop: CropRect;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Crop cancelled.", "AbortError");
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
        reject(new Error("Could not export the cropped image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
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

/** Centered crop covering ~80% of the shorter side (or full image if square). */
export function defaultCropRect(
  imageWidth: number,
  imageHeight: number,
  ratio: number | null = null,
): CropRect {
  if (!imageWidth || !imageHeight) {
    return { x: 0, y: 0, width: MIN_CROP_SIZE, height: MIN_CROP_SIZE };
  }

  if (ratio == null) {
    const width = Math.max(MIN_CROP_SIZE, Math.round(imageWidth * 0.8));
    const height = Math.max(MIN_CROP_SIZE, Math.round(imageHeight * 0.8));
    return {
      x: Math.round((imageWidth - width) / 2),
      y: Math.round((imageHeight - height) / 2),
      width,
      height,
    };
  }

  let width: number;
  let height: number;
  if (imageWidth / imageHeight > ratio) {
    height = Math.max(MIN_CROP_SIZE, Math.round(imageHeight * 0.8));
    width = Math.max(MIN_CROP_SIZE, Math.round(height * ratio));
    if (width > imageWidth) {
      width = imageWidth;
      height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));
    }
  } else {
    width = Math.max(MIN_CROP_SIZE, Math.round(imageWidth * 0.8));
    height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));
    if (height > imageHeight) {
      height = imageHeight;
      width = Math.max(MIN_CROP_SIZE, Math.round(height * ratio));
    }
  }

  return {
    x: Math.round((imageWidth - width) / 2),
    y: Math.round((imageHeight - height) / 2),
    width,
    height,
  };
}

export function clampCropRect(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
  ratio: number | null = null,
): CropRect {
  let width = Math.max(
    MIN_CROP_SIZE,
    Math.min(imageWidth, Math.round(crop.width)),
  );
  let height = Math.max(
    MIN_CROP_SIZE,
    Math.min(imageHeight, Math.round(crop.height)),
  );

  if (ratio != null && ratio > 0) {
    // Prefer width, then re-clamp to image bounds.
    height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));
    if (height > imageHeight) {
      height = imageHeight;
      width = Math.max(MIN_CROP_SIZE, Math.round(height * ratio));
    }
    if (width > imageWidth) {
      width = imageWidth;
      height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));
    }
  }

  const maxX = Math.max(0, imageWidth - width);
  const maxY = Math.max(0, imageHeight - height);
  const x = Math.min(maxX, Math.max(0, Math.round(crop.x)));
  const y = Math.min(maxY, Math.max(0, Math.round(crop.y)));

  return { x, y, width, height };
}

/** Fit crop to a new aspect ratio while keeping center when possible. */
export function applyAspectRatio(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
  ratio: number | null,
): CropRect {
  if (ratio == null) {
    return clampCropRect(crop, imageWidth, imageHeight, null);
  }

  const cx = crop.x + crop.width / 2;
  const cy = crop.y + crop.height / 2;
  let width = crop.width;
  let height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));

  if (height > imageHeight) {
    height = imageHeight;
    width = Math.max(MIN_CROP_SIZE, Math.round(height * ratio));
  }
  if (width > imageWidth) {
    width = imageWidth;
    height = Math.max(MIN_CROP_SIZE, Math.round(width / ratio));
  }

  return clampCropRect(
    {
      x: Math.round(cx - width / 2),
      y: Math.round(cy - height / 2),
      width,
      height,
    },
    imageWidth,
    imageHeight,
    ratio,
  );
}

export function describeCrop(
  originalWidth: number,
  originalHeight: number,
  width: number,
  height: number,
): string {
  return `${originalWidth}×${originalHeight} → ${width}×${height}`;
}

export function downloadCroppedImage(
  blob: Blob,
  sourceFile: File,
  width: number,
  height: number,
) {
  downloadBlob(
    blob,
    `${fileBaseName(sourceFile)}-cropped-${width}x${height}.png`,
  );
}

export async function cropImageFile(
  file: File,
  options: CropImageOptions,
): Promise<CropImageResult> {
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) {
    throw new Error("Could not determine image dimensions.");
  }

  const crop = clampCropRect(options.crop, originalWidth, originalHeight, null);
  if (
    crop.width < MIN_CROP_SIZE ||
    crop.height < MIN_CROP_SIZE ||
    crop.x + crop.width > originalWidth ||
    crop.y + crop.height > originalHeight
  ) {
    throw new Error("Crop area is outside the image. Adjust the selection.");
  }

  onProgress?.(`Cropping to ${crop.width}×${crop.height}…`);

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  throwIfAborted(signal);
  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(canvas);
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    width: crop.width,
    height: crop.height,
    originalWidth,
    originalHeight,
    crop,
  };
}
