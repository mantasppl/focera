import JSZip from "jszip";
import ImageTracer from "imagetracerjs";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_PNG_TYPES = ["image/png"] as const;

export const MAX_PNG_FILES = 10;
export const MAX_PNG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_PNG_TOTAL_BYTES = 40 * 1024 * 1024;
/** Large rasters are downscaled before tracing to keep conversion responsive. */
export const MAX_TRACE_DIMENSION = 1200;

export type PngSvgDetail = "simple" | "balanced" | "detailed";

export type ConvertedPngSvg = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type PngToSvgResult = {
  images: ConvertedPngSvg[];
  detail: PngSvgDetail;
  originalSize: number;
  outputSize: number;
};

export type ConvertPngToSvgOptions = {
  detail?: PngSvgDetail;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

const DETAIL_OPTIONS: Record<
  PngSvgDetail,
  Record<string, number | boolean>
> = {
  simple: {
    numberofcolors: 8,
    pathomit: 16,
    blurradius: 2,
    blurdelta: 32,
    ltres: 1,
    qtres: 1,
    roundcoords: 1,
    strokewidth: 0,
    viewbox: true,
    linefilter: true,
  },
  balanced: {
    numberofcolors: 16,
    pathomit: 8,
    blurradius: 0,
    ltres: 1,
    qtres: 1,
    roundcoords: 1,
    strokewidth: 0,
    viewbox: true,
    linefilter: false,
  },
  detailed: {
    numberofcolors: 32,
    pathomit: 0,
    blurradius: 0,
    ltres: 0.5,
    qtres: 0.5,
    roundcoords: 2,
    strokewidth: 0,
    viewbox: true,
    linefilter: false,
  },
};

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

export function detailLabel(detail: PngSvgDetail): string {
  switch (detail) {
    case "simple":
      return "Simple";
    case "detailed":
      return "Detailed";
    default:
      return "Balanced";
  }
}

function svgFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.svg`;
}

function fitTraceSize(width: number, height: number) {
  const longest = Math.max(width, height);
  if (longest <= MAX_TRACE_DIMENSION) {
    return { width, height };
  }
  const scale = MAX_TRACE_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function convertSinglePng(
  file: File,
  detail: PngSvgDetail,
  signal?: AbortSignal,
): Promise<ConvertedPngSvg> {
  throwIfAborted(signal);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      `"${file.name}" could not be read. Try another PNG image.`,
    );
  }

  try {
    throwIfAborted(signal);
    await yieldToUi();
    throwIfAborted(signal);

    const size = fitTraceSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = size.width;
    canvas.height = size.height;
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const imageData = context.getImageData(0, 0, size.width, size.height);

    throwIfAborted(signal);
    await yieldToUi();
    throwIfAborted(signal);

    const svgString = ImageTracer.imagedataToSVG(
      imageData,
      DETAIL_OPTIONS[detail],
    );

    throwIfAborted(signal);

    if (!svgString || !svgString.includes("<svg")) {
      throw new Error(
        `"${file.name}" could not be traced to SVG. Try another image or a simpler detail setting.`,
      );
    }

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty SVG. Try another image.`,
      );
    }

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName: file.name,
      blob,
      url: URL.createObjectURL(blob),
      outputSize: blob.size,
      originalSize: file.size,
      width: size.width,
      height: size.height,
    };
  } finally {
    bitmap.close();
  }
}

export async function convertPngToSvg(
  files: File[],
  options: ConvertPngToSvgOptions = {},
): Promise<PngToSvgResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PNG image to convert.");
  }

  const additionError = validatePngAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const detail = options.detail ?? "balanced";
  const images: ConvertedPngSvg[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSinglePng(file, detail, options.signal);
      images.push(converted);
    } catch (err) {
      revokePngToSvgResult({ images, detail, originalSize: 0, outputSize: 0 });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    detail,
    originalSize,
    outputSize,
  };
}

export function revokePngToSvgResult(result: PngToSvgResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedSvg(image: ConvertedPngSvg) {
  downloadBlob(image.blob, svgFileName(image.sourceName));
}

export async function downloadPngSvgResult(
  result: PngToSvgResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedSvg(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = svgFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.svg$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.svg`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.svg`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0
      ? fileBaseName(sourceFiles[0]) || "png"
      : "png";
  downloadBlob(zipBlob, `${base}-svg.zip`);
}

export function describePngSvgOutput(result: PngToSvgResult): string {
  const count =
    result.images.length === 1
      ? "1 SVG"
      : `${result.images.length} SVGs`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}
