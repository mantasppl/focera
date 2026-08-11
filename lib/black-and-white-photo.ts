import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  validateImageFile,
} from "@/lib/image";

export type BwStyle = "classic" | "soft" | "contrast";

export type BwPreset = {
  id: BwStyle;
  label: string;
  hint: string;
  /** CSS canvas filter applied after draw (grayscale + tone). */
  filter: string;
};

export const BW_PRESETS: BwPreset[] = [
  {
    id: "classic",
    label: "Classic",
    hint: "True grayscale",
    filter: "grayscale(100%)",
  },
  {
    id: "soft",
    label: "Soft",
    hint: "Gentle tones",
    filter: "grayscale(100%) contrast(0.88) brightness(1.04)",
  },
  {
    id: "contrast",
    label: "High contrast",
    hint: "Bold B&W",
    filter: "grayscale(100%) contrast(1.4)",
  },
];

export type BlackAndWhitePhotoResult = {
  blob: Blob;
  width: number;
  height: number;
  style: BwStyle;
};

export type BlackAndWhitePhotoOptions = {
  style?: BwStyle;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Black and white conversion cancelled.", "AbortError");
  }
}

function getPreset(style: BwStyle): BwPreset {
  return BW_PRESETS.find((preset) => preset.id === style) ?? BW_PRESETS[0];
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
        reject(new Error("Could not export the black and white photo."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function convertToBlackAndWhite(
  file: File,
  options: BlackAndWhitePhotoOptions = {},
): Promise<BlackAndWhitePhotoResult> {
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

  const preset = getPreset(options.style ?? "classic");
  options.onProgress?.("Converting to black and white…");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = preset.filter;
  context.drawImage(image, 0, 0, width, height);
  context.filter = "none";

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
    style: preset.id,
  };
}

export function downloadBlackAndWhiteImage(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "photo";
  downloadBlob(blob, `${base}-black-and-white.png`);
}

export function describeBwResult(
  width: number,
  height: number,
  style: BwStyle,
  byteSize: number,
): string {
  const preset = getPreset(style);
  return `${width}×${height} · ${preset.label} · ${formatFileSize(byteSize)}`;
}
