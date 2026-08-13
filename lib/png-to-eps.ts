import JSZip from "jszip";
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

export type PngEpsColor = "rgb" | "gray";
export type PngEpsDpi = 72 | 150 | 300;

export type ConvertedPngEps = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
};

export type PngToEpsResult = {
  images: ConvertedPngEps[];
  color: PngEpsColor;
  dpi: PngEpsDpi;
  originalSize: number;
  outputSize: number;
};

export type ConvertPngToEpsOptions = {
  color?: PngEpsColor;
  dpi?: PngEpsDpi;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
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

export function colorLabel(color: PngEpsColor): string {
  return color === "gray" ? "Grayscale" : "Color";
}

export function dpiLabel(dpi: PngEpsDpi): string {
  switch (dpi) {
    case 150:
      return "Draft 150 DPI";
    case 300:
      return "Print 300 DPI";
    default:
      return "Screen 72 DPI";
  }
}

function epsFileName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.eps`;
}

function sanitizeDscTitle(name: string): string {
  return name.replace(/[^\x20-\x7E]/g, "_").replace(/%/g, "_").slice(0, 80);
}

function formatPoint(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(4).replace(/\.?0+$/, "");
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not create a preview image."));
    }, "image/png");
  });
}

/** Adobe ASCII85 (Ascii85) with 75-character line wraps, terminated by `~>`. */
async function encodeAscii85(
  bytes: Uint8Array,
  signal?: AbortSignal,
): Promise<string> {
  const lineWidth = 75;
  const yieldEvery = 256 * 1024;
  const lines: string[] = [];
  let line = "";

  function pushChar(code: number) {
    line += String.fromCharCode(code);
    if (line.length >= lineWidth) {
      lines.push(line);
      line = "";
    }
  }

  const length = bytes.length;
  for (let index = 0; index < length; index += 4) {
    if (index > 0 && index % yieldEvery === 0) {
      throwIfAborted(signal);
      await yieldToUi();
    }

    const remaining = Math.min(4, length - index);
    let tuple = 0;
    for (let offset = 0; offset < 4; offset += 1) {
      tuple = tuple * 256 + (offset < remaining ? bytes[index + offset] : 0);
    }

    if (remaining === 4 && tuple === 0) {
      pushChar(122); // z
      continue;
    }

    const digits = [0, 0, 0, 0, 0];
    for (let digit = 4; digit >= 0; digit -= 1) {
      digits[digit] = tuple % 85;
      tuple = Math.floor(tuple / 85);
    }

    const count = remaining + 1;
    for (let digit = 0; digit < count; digit += 1) {
      pushChar(digits[digit] + 33);
    }
  }

  line += "~>";
  lines.push(line);
  return lines.join("\n");
}

function extractSampleBytes(
  imageData: ImageData,
  color: PngEpsColor,
): Uint8Array {
  const src = imageData.data;
  const pixelCount = imageData.width * imageData.height;

  if (color === "gray") {
    const gray = new Uint8Array(pixelCount);
    let out = 0;
    for (let index = 0; index < src.length; index += 4) {
      gray[out] = src[index];
      out += 1;
    }
    return gray;
  }

  const rgb = new Uint8Array(pixelCount * 3);
  let out = 0;
  for (let index = 0; index < src.length; index += 4) {
    rgb[out] = src[index];
    rgb[out + 1] = src[index + 1];
    rgb[out + 2] = src[index + 2];
    out += 3;
  }
  return rgb;
}

function applyGrayscale(imageData: ImageData) {
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = Math.round(
      0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2],
    );
    data[index] = gray;
    data[index + 1] = gray;
    data[index + 2] = gray;
  }
}

function buildEpsDocument(options: {
  title: string;
  width: number;
  height: number;
  dpi: PngEpsDpi;
  color: PngEpsColor;
  ascii85: string;
}): string {
  const scale = 72 / options.dpi;
  const pointWidth = options.width * scale;
  const pointHeight = options.height * scale;
  const bboxWidth = Math.max(1, Math.round(pointWidth));
  const bboxHeight = Math.max(1, Math.round(pointHeight));
  const hiresWidth = formatPoint(pointWidth);
  const hiresHeight = formatPoint(pointHeight);
  const cols = options.width;
  const rows = options.height;
  const imageOp =
    options.color === "gray"
      ? `{ currentfile /ASCII85Decode filter }\nimage`
      : `{ currentfile /ASCII85Decode filter }\nfalse 3\ncolorimage`;

  return [
    "%!PS-Adobe-3.0 EPSF-3.0",
    "%%Creator: Focera PNG to EPS",
    `%%Title: ${sanitizeDscTitle(options.title)}`,
    `%%BoundingBox: 0 0 ${bboxWidth} ${bboxHeight}`,
    `%%HiResBoundingBox: 0 0 ${hiresWidth} ${hiresHeight}`,
    "%%LanguageLevel: 2",
    "%%Pages: 1",
    "%%DocumentData: Clean7Bit",
    "%%EndComments",
    "%%BeginProlog",
    "%%EndProlog",
    "%%Page: 1 1",
    "gsave",
    "0 0 translate",
    `${hiresWidth} ${hiresHeight} scale`,
    `${cols} ${rows} 8`,
    `[${cols} 0 0 -${rows} 0 ${rows}]`,
    imageOp,
    options.ascii85,
    "grestore",
    "showpage",
    "%%Trailer",
    "%%EOF",
    "",
  ].join("\n");
}

async function convertSinglePng(
  file: File,
  color: PngEpsColor,
  dpi: PngEpsDpi,
  signal?: AbortSignal,
): Promise<ConvertedPngEps> {
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

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas is not supported in this browser.");
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    // Flatten transparency onto white — classic EPS has no PNG-style alpha.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (color === "gray") {
      applyGrayscale(imageData);
      context.putImageData(imageData, 0, 0);
    }

    throwIfAborted(signal);
    await yieldToUi();
    throwIfAborted(signal);

    const samples = extractSampleBytes(imageData, color);
    const ascii85 = await encodeAscii85(samples, signal);
    throwIfAborted(signal);

    const epsText = buildEpsDocument({
      title: file.name,
      width: canvas.width,
      height: canvas.height,
      dpi,
      color,
      ascii85,
    });

    const blob = new Blob([epsText], { type: "application/postscript" });
    if (blob.size < 1) {
      throw new Error(
        `"${file.name}" produced an empty EPS. Try another image.`,
      );
    }

    const previewBlob = await canvasToPngBlob(canvas);
    throwIfAborted(signal);

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      sourceName: file.name,
      blob,
      url: URL.createObjectURL(previewBlob),
      outputSize: blob.size,
      originalSize: file.size,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    bitmap.close();
  }
}

export async function convertPngToEps(
  files: File[],
  options: ConvertPngToEpsOptions = {},
): Promise<PngToEpsResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PNG image to convert.");
  }

  const additionError = validatePngAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const color = options.color ?? "rgb";
  const dpi = options.dpi ?? 72;
  const images: ConvertedPngEps[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSinglePng(
        file,
        color,
        dpi,
        options.signal,
      );
      images.push(converted);
    } catch (err) {
      revokePngToEpsResult({
        images,
        color,
        dpi,
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
    color,
    dpi,
    originalSize,
    outputSize,
  };
}

export function revokePngToEpsResult(result: PngToEpsResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedEps(image: ConvertedPngEps) {
  downloadBlob(image.blob, epsFileName(image.sourceName));
}

export async function downloadPngEpsResult(
  result: PngToEpsResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedEps(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = epsFileName(image.sourceName);
    if (usedNames.has(name)) {
      const base = name.replace(/\.eps$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.eps`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.eps`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0 ? fileBaseName(sourceFiles[0]) || "png" : "png";
  downloadBlob(zipBlob, `${base}-eps.zip`);
}

export function describePngEpsOutput(result: PngToEpsResult): string {
  const count =
    result.images.length === 1 ? "1 EPS" : `${result.images.length} EPS files`;
  return `${count} · ${formatFileSize(result.outputSize)}`;
}
