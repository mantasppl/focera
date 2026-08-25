import JSZip from "jszip";
import { initializeCanvas, readPsd, type Layer, type Psd } from "ag-psd";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_PSD_TYPES = [
  "image/vnd.adobe.photoshop",
  "image/x-photoshop",
  "application/x-photoshop",
  "application/photoshop",
  "application/psd",
  "image/psd",
] as const;

export const MAX_PSD_FILES = 10;
export const MAX_PSD_SIZE_BYTES = Math.max(
  MAX_IMAGE_SIZE_BYTES,
  25 * 1024 * 1024,
);
export const MAX_PSD_TOTAL_BYTES = 80 * 1024 * 1024;

export type PsdJpgQuality = 0.7 | 0.85 | 0.92;

export type ConvertedPsdJpg = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
  layerCount: number;
};

export type PsdToJpgResult = {
  images: ConvertedPsdJpg[];
  quality: PsdJpgQuality;
  originalSize: number;
  outputSize: number;
};

export type ConvertPsdToJpgOptions = {
  quality?: PsdJpgQuality;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

let canvasInitialized = false;

function ensureBrowserCanvas() {
  if (canvasInitialized || typeof document === "undefined") return;
  initializeCanvas((width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  });
  canvasInitialized = true;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function yieldToUi() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

function isAcceptedPsd(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".psd")) {
    return true;
  }
  return ACCEPTED_PSD_TYPES.includes(
    file.type as (typeof ACCEPTED_PSD_TYPES)[number],
  );
}

export function validatePsdFile(file: File): string | null {
  if (!isAcceptedPsd(file)) {
    return "Please upload a Photoshop PSD file (.psd).";
  }

  if (file.size > MAX_PSD_SIZE_BYTES) {
    return `Each PSD must be ${formatFileSize(MAX_PSD_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validatePsdAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one PSD file.";
  }

  for (const file of incoming) {
    const singleError = validatePsdFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_PSD_FILES) {
    return `You can convert up to ${MAX_PSD_FILES} PSD files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_PSD_TOTAL_BYTES) {
    return `Combined PSD size must be ${formatFileSize(MAX_PSD_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function jpgFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.jpg`;
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Could not encode JPEG."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function countRasterLayers(layers?: Layer[]): number {
  if (!layers?.length) return 0;
  let count = 0;
  for (const layer of layers) {
    if (layer.children?.length) {
      count += countRasterLayers(layer.children);
    } else {
      count += 1;
    }
  }
  return count;
}

function friendlyPsdError(err: unknown, fileName: string): Error {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const lower = raw.toLowerCase();

  if (
    lower.includes("cmyk") ||
    lower.includes("lab") ||
    lower.includes("indexed") ||
    lower.includes("duotone") ||
    lower.includes("multichannel") ||
    lower.includes("color mode")
  ) {
    return new Error(
      `"${fileName}" uses a color mode this converter cannot read (CMYK, Lab, or Indexed). Convert it to 8-bit RGB in Photoshop and try again.`,
    );
  }

  if (lower.includes("16") && (lower.includes("bit") || lower.includes("channel"))) {
    return new Error(
      `"${fileName}" is 16-bit. Convert it to 8-bit RGB in Photoshop and try again.`,
    );
  }

  if (lower.includes("psb") || lower.includes("8bpb") || lower.includes("large document")) {
    return new Error(
      `"${fileName}" is a PSB (large document). Save it as a .psd and try again.`,
    );
  }

  if (raw && !raw.includes("could not")) {
    return new Error(
      `"${fileName}" could not be read. ${raw} Try re-saving it in Photoshop as 8-bit RGB.`,
    );
  }

  return new Error(
    `"${fileName}" could not be read. Try another PSD, or re-save it in Photoshop as 8-bit RGB.`,
  );
}

function canvasFromImageData(psd: Psd): HTMLCanvasElement | null {
  if (!psd.imageData?.data || !psd.width || !psd.height) return null;
  const canvas = document.createElement("canvas");
  canvas.width = psd.width;
  canvas.height = psd.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const imageData = new ImageData(
    new Uint8ClampedArray(psd.imageData.data),
    psd.width,
    psd.height,
  );
  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function convertSinglePsd(
  file: File,
  quality: PsdJpgQuality,
  signal?: AbortSignal,
): Promise<ConvertedPsdJpg> {
  throwIfAborted(signal);
  ensureBrowserCanvas();

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new Error(`"${file.name}" could not be read. Try another PSD file.`);
  }

  throwIfAborted(signal);
  await yieldToUi();
  throwIfAborted(signal);

  let psd: Psd;
  try {
    psd = readPsd(buffer, {
      skipLayerImageData: true,
      skipLinkedFilesData: true,
      skipThumbnail: true,
    });
  } catch (err) {
    throw friendlyPsdError(err, file.name);
  }

  throwIfAborted(signal);

  const sourceCanvas = psd.canvas ?? canvasFromImageData(psd);
  if (!sourceCanvas || sourceCanvas.width < 1 || sourceCanvas.height < 1) {
    throw new Error(
      `"${file.name}" has no flattened preview. Re-save it in Photoshop (File > Save) as 8-bit RGB and try again.`,
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  // White background so transparent PSD areas don't become black in JPG
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(sourceCanvas, 0, 0);

  throwIfAborted(signal);
  await yieldToUi();
  throwIfAborted(signal);

  const blob = await canvasToJpegBlob(canvas, quality);
  if (blob.size < 1) {
    throw new Error(`"${file.name}" produced an empty JPG. Try another PSD.`);
  }

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    sourceName: file.name,
    blob,
    url: URL.createObjectURL(blob),
    outputSize: blob.size,
    originalSize: file.size,
    width: canvas.width,
    height: canvas.height,
    layerCount: countRasterLayers(psd.children),
  };
}

export async function convertPsdToJpg(
  files: File[],
  options: ConvertPsdToJpgOptions = {},
): Promise<PsdToJpgResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PSD file to convert.");
  }

  const additionError = validatePsdAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const quality = options.quality ?? 0.85;
  const images: ConvertedPsdJpg[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSinglePsd(file, quality, options.signal);
      images.push(converted);
    } catch (err) {
      revokePsdToJpgResult({
        images,
        quality,
        originalSize: 0,
        outputSize: 0,
      });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    quality,
    originalSize,
    outputSize,
  };
}

export function revokePsdToJpgResult(result: PsdToJpgResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedJpg(image: ConvertedPsdJpg) {
  downloadBlob(image.blob, jpgFileName(image.sourceName));
}

export async function downloadPsdJpgResult(
  result: PsdToJpgResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedJpg(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = jpgFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.jpg$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.jpg`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.jpg`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0 ? fileBaseName(sourceFiles[0]) || "psd" : "psd";
  downloadBlob(zipBlob, `${base}-jpg.zip`);
}

export function describePsdJpgOutput(result: PsdToJpgResult): string {
  const count =
    result.images.length === 1 ? "1 JPG" : `${result.images.length} JPGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}

export function qualityLabel(quality: PsdJpgQuality): string {
  switch (quality) {
    case 0.7:
      return "Smaller file";
    case 0.92:
      return "High quality";
    default:
      return "Balanced";
  }
}
