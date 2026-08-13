import { GIFEncoder, quantize, applyPalette } from "gifenc";
import JSZip from "jszip";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_PNG_TYPES = ["image/png"] as const;

export const MAX_PNG_FILES = 20;
export const MAX_PNG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_PNG_TOTAL_BYTES = 80 * 1024 * 1024;

export type PngToGifSize = "small" | "medium" | "large";
export type PngToGifQuality = "low" | "medium" | "high";
export type PngToGifDelay = 100 | 200 | 500 | 1000;
export type PngToGifMode = "separate" | "animated";

export type PngToGifSizePreset = {
  id: PngToGifSize;
  label: string;
  hint: string;
  maxDimension: number;
};

export type PngToGifQualityPreset = {
  id: PngToGifQuality;
  label: string;
  hint: string;
  maxColors: number;
};

export type PngToGifDelayPreset = {
  id: PngToGifDelay;
  label: string;
  hint: string;
};

export const PNG_TO_GIF_SIZE_PRESETS: PngToGifSizePreset[] = [
  { id: "small", label: "Small", hint: "320px wide", maxDimension: 320 },
  { id: "medium", label: "Medium", hint: "480px wide", maxDimension: 480 },
  { id: "large", label: "Large", hint: "640px wide", maxDimension: 640 },
];

export const PNG_TO_GIF_QUALITY_PRESETS: PngToGifQualityPreset[] = [
  { id: "low", label: "Low", hint: "64 colors", maxColors: 64 },
  { id: "medium", label: "Medium", hint: "128 colors", maxColors: 128 },
  { id: "high", label: "High", hint: "256 colors", maxColors: 256 },
];

export const PNG_TO_GIF_DELAY_PRESETS: PngToGifDelayPreset[] = [
  { id: 100, label: "0.1s", hint: "Fast" },
  { id: 200, label: "0.2s", hint: "Default" },
  { id: 500, label: "0.5s", hint: "Slower" },
  { id: 1000, label: "1s", hint: "Slideshow" },
];

export type ConvertedGifImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
  frameCount: number;
};

export type PngToGifResult = {
  images: ConvertedGifImage[];
  animated: boolean;
  originalSize: number;
  outputSize: number;
  width: number;
  height: number;
  frameCount: number;
};

export type ConvertPngToGifOptions = {
  mode?: PngToGifMode;
  size?: PngToGifSize;
  quality?: PngToGifQuality;
  delay?: PngToGifDelay;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedPng(file: File): boolean {
  if (file.name.toLowerCase().endsWith(".png")) {
    return true;
  }
  return ACCEPTED_PNG_TYPES.includes(
    file.type as (typeof ACCEPTED_PNG_TYPES)[number],
  );
}

export function validatePngFile(file: File): string | null {
  if (!isAcceptedPng(file)) {
    return "Please upload a PNG image (.png).";
  }

  if (file.size > MAX_PNG_SIZE_BYTES) {
    return `Each PNG must be ${formatFileSize(MAX_PNG_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validatePngAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one PNG image.";
  }

  for (const file of incoming) {
    const singleError = validatePngFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_PNG_FILES) {
    return `You can convert up to ${MAX_PNG_FILES} PNG files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_PNG_TOTAL_BYTES) {
    return `Combined PNG size must be ${formatFileSize(MAX_PNG_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

function getSizePreset(size: PngToGifSize): PngToGifSizePreset {
  return (
    PNG_TO_GIF_SIZE_PRESETS.find((preset) => preset.id === size) ??
    PNG_TO_GIF_SIZE_PRESETS[1]
  );
}

function getQualityPreset(quality: PngToGifQuality): PngToGifQualityPreset {
  return (
    PNG_TO_GIF_QUALITY_PRESETS.find((preset) => preset.id === quality) ??
    PNG_TO_GIF_QUALITY_PRESETS[1]
  );
}

function targetDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function gifFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.gif`;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another PNG image.`,
    );
  }
}

function encodeCanvasToGif(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  options: {
    maxColors: number;
    delayMs: number;
    extraFrames?: Array<() => void>;
    signal?: AbortSignal;
    onFrame?: (index: number, total: number) => void;
  },
): Promise<Blob> {
  const { width, height } = canvas;
  const gif = GIFEncoder();
  const total = 1 + (options.extraFrames?.length ?? 0);

  function writeCurrentFrame(index: number) {
    const { data } = context.getImageData(0, 0, width, height);
    const palette = quantize(data, options.maxColors);
    const indexed = applyPalette(data, palette);
    gif.writeFrame(indexed, width, height, {
      palette,
      delay: options.delayMs,
      ...(index === 0 ? { repeat: 0 } : {}),
    });
  }

  async function run(): Promise<Blob> {
    throwIfAborted(options.signal);
    writeCurrentFrame(0);
    options.onFrame?.(1, total);
    await yieldToUi();

    if (options.extraFrames) {
      for (let i = 0; i < options.extraFrames.length; i += 1) {
        throwIfAborted(options.signal);
        options.extraFrames[i]();
        writeCurrentFrame(i + 1);
        options.onFrame?.(i + 2, total);
        await yieldToUi();
      }
    }

    throwIfAborted(options.signal);
    gif.finish();

    const bytes = gif.bytes();
    if (!bytes.length) {
      throw new Error("Conversion produced an empty GIF. Try another image.");
    }

    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return new Blob([copy], { type: "image/gif" });
  }

  return run();
}

function drawContained(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  canvasWidth: number,
  canvasHeight: number,
) {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  const scale = Math.min(
    canvasWidth / bitmap.width,
    canvasHeight / bitmap.height,
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const x = Math.round((canvasWidth - width) / 2);
  const y = Math.round((canvasHeight - height) / 2);
  context.drawImage(bitmap, x, y, width, height);
}

async function convertSinglePng(
  file: File,
  maxDimension: number,
  maxColors: number,
  signal?: AbortSignal,
): Promise<ConvertedGifImage> {
  throwIfAborted(signal);
  const bitmap = await loadBitmap(file);

  try {
    throwIfAborted(signal);

    const { width, height } = targetDimensions(
      bitmap.width,
      bitmap.height,
      maxDimension,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await encodeCanvasToGif(canvas, context, {
      maxColors,
      delayMs: 100,
      signal,
    });

    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty GIF. Try another image.`,
      );
    }

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName: file.name,
      blob,
      url: URL.createObjectURL(blob),
      outputSize: blob.size,
      originalSize: file.size,
      width,
      height,
      frameCount: 1,
    };
  } finally {
    bitmap.close();
  }
}

async function convertAnimatedGif(
  files: File[],
  maxDimension: number,
  maxColors: number,
  delayMs: number,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): Promise<ConvertedGifImage> {
  const bitmaps: ImageBitmap[] = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      throwIfAborted(signal);
      onProgress?.(
        `Reading ${index + 1} of ${files.length}: ${files[index].name}`,
      );
      bitmaps.push(await loadBitmap(files[index]));
    }

    const scaled = bitmaps.map((bitmap) =>
      targetDimensions(bitmap.width, bitmap.height, maxDimension),
    );
    const width = Math.max(...scaled.map((size) => size.width));
    const height = Math.max(...scaled.map((size) => size.height));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    drawContained(context, bitmaps[0], width, height);

    const blob = await encodeCanvasToGif(canvas, context, {
      maxColors,
      delayMs,
      signal,
      extraFrames: bitmaps.slice(1).map((bitmap) => () => {
        drawContained(context, bitmap, width, height);
      }),
      onFrame: (current, total) => {
        onProgress?.(`Encoding frame ${current} of ${total}…`);
      },
    });

    if (blob.size < 1) {
      throw new Error("Conversion produced an empty GIF. Try other images.");
    }

    const originalSize = files.reduce((sum, file) => sum + file.size, 0);
    const sourceName =
      files.length === 1
        ? files[0].name
        : `${fileBaseName(files[0]) || "png"}-animated.png`;

    return {
      id: `animated-${originalSize}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName,
      blob,
      url: URL.createObjectURL(blob),
      outputSize: blob.size,
      originalSize,
      width,
      height,
      frameCount: files.length,
    };
  } finally {
    for (const bitmap of bitmaps) {
      bitmap.close();
    }
  }
}

export async function convertPngToGif(
  files: File[],
  options: ConvertPngToGifOptions = {},
): Promise<PngToGifResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PNG image to convert.");
  }

  const additionError = validatePngAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const sizePreset = getSizePreset(options.size ?? "medium");
  const qualityPreset = getQualityPreset(options.quality ?? "medium");
  const delay = options.delay ?? 200;
  const mode: PngToGifMode =
    files.length < 2 ? "separate" : (options.mode ?? "animated");

  if (mode === "animated") {
    options.onProgress?.("Preparing animated GIF…");
    const converted = await convertAnimatedGif(
      files,
      sizePreset.maxDimension,
      qualityPreset.maxColors,
      delay,
      options.onProgress,
      options.signal,
    );

    return {
      images: [converted],
      animated: true,
      originalSize: converted.originalSize,
      outputSize: converted.outputSize,
      width: converted.width,
      height: converted.height,
      frameCount: converted.frameCount,
    };
  }

  const images: ConvertedGifImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(
      `Converting ${index + 1} of ${files.length}: ${file.name}`,
    );

    try {
      const converted = await convertSinglePng(
        file,
        sizePreset.maxDimension,
        qualityPreset.maxColors,
        options.signal,
      );
      images.push(converted);
    } catch (err) {
      revokePngToGifResult({
        images,
        animated: false,
        originalSize: 0,
        outputSize: 0,
        width: 0,
        height: 0,
        frameCount: 0,
      });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    animated: false,
    originalSize,
    outputSize,
    width: images[0]?.width ?? 0,
    height: images[0]?.height ?? 0,
    frameCount: images.length,
  };
}

export function revokePngToGifResult(result: PngToGifResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedGif(image: ConvertedGifImage) {
  downloadBlob(image.blob, gifFileName(image.sourceName));
}

export async function downloadPngGifResult(
  result: PngToGifResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedGif(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = gifFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.gif$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.gif`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.gif`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0 ? fileBaseName(sourceFiles[0]) || "png" : "png";
  downloadBlob(zipBlob, `${base}-gif.zip`);
}

export function describePngGifOutput(result: PngToGifResult): string {
  if (result.animated) {
    const frames =
      result.frameCount === 1 ? "1 frame" : `${result.frameCount} frames`;
    return `${result.width}×${result.height} · ${frames} · ${formatFileSize(result.outputSize)}`;
  }

  const count =
    result.images.length === 1 ? "1 GIF" : `${result.images.length} GIFs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}
