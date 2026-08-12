import JSZip from "jszip";
import {
  downloadBlob,
  fileBaseName,
  formatFileSize,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/image";

export const ACCEPTED_SVG_TYPES = ["image/svg+xml"] as const;

export const MAX_SVG_FILES = 20;
export const MAX_SVG_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;
export const MAX_SVG_TOTAL_BYTES = 80 * 1024 * 1024;
export const MAX_PNG_EDGE = 8192;

export type SvgPngScale = 1 | 2 | 3 | 4;

export type ConvertedSvgImage = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  outputSize: number;
  originalSize: number;
  width: number;
  height: number;
  scale: SvgPngScale;
};

export type SvgToPngResult = {
  images: ConvertedSvgImage[];
  originalSize: number;
  outputSize: number;
  scale: SvgPngScale;
};

export type ConvertSvgToPngOptions = {
  scale?: SvgPngScale;
  onProgress?: (current: number, total: number, fileName: string) => void;
  signal?: AbortSignal;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedSvg(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".svg")) {
    return true;
  }
  return ACCEPTED_SVG_TYPES.includes(
    file.type as (typeof ACCEPTED_SVG_TYPES)[number],
  );
}

export function validateSvgFile(file: File): string | null {
  if (!isAcceptedSvg(file)) {
    return "Please upload an SVG image (.svg).";
  }

  if (file.size > MAX_SVG_SIZE_BYTES) {
    return `Each SVG must be ${formatFileSize(MAX_SVG_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function validateSvgAddition(
  incoming: File[],
  existing: File[],
): string | null {
  if (incoming.length === 0) {
    return "Please upload at least one SVG image.";
  }

  for (const file of incoming) {
    const singleError = validateSvgFile(file);
    if (singleError) {
      return singleError;
    }
  }

  const nextCount = existing.length + incoming.length;
  if (nextCount > MAX_SVG_FILES) {
    return `You can convert up to ${MAX_SVG_FILES} SVG files at a time.`;
  }

  const existingTotal = existing.reduce((sum, file) => sum + file.size, 0);
  const incomingTotal = incoming.reduce((sum, file) => sum + file.size, 0);
  if (existingTotal + incomingTotal > MAX_SVG_TOTAL_BYTES) {
    return `Combined SVG size must be ${formatFileSize(MAX_SVG_TOTAL_BYTES)} or smaller.`;
  }

  return null;
}

export function scaleLabel(scale: SvgPngScale): string {
  return `${scale}×`;
}

function pngFileName(sourceName: string, scale: SvgPngScale): string {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  if (scale === 1) {
    return `${base}.png`;
  }
  return `${base}@${scale}x.png`;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not encode PNG."));
    }, "image/png");
  });
}

function parseSvgLength(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.endsWith("%")) return null;

  const match = /^([\d.]+)\s*(px|pt|pc|in|cm|mm)?$/i.exec(trimmed);
  if (!match) return null;

  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return null;

  const unit = (match[2] || "px").toLowerCase();
  switch (unit) {
    case "px":
      return n;
    case "pt":
      return (n * 96) / 72;
    case "pc":
      return n * 16;
    case "in":
      return n * 96;
    case "cm":
      return (n * 96) / 2.54;
    case "mm":
      return (n * 96) / 25.4;
    default:
      return n;
  }
}

function parseViewBox(
  value: string | null | undefined,
): { width: number; height: number } | null {
  if (!value) return null;
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 4) return null;
  const [, , width, height] = parts;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  return { width, height };
}

function getSvgRoot(svgText: string): Element {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Could not parse SVG. Check that the file is valid XML.");
  }

  const svg = doc.documentElement;
  if (svg.nodeName.toLowerCase() !== "svg") {
    throw new Error("File does not contain a root <svg> element.");
  }

  return svg;
}

function resolveSvgSize(svg: Element): { width: number; height: number } {
  const widthAttr = parseSvgLength(svg.getAttribute("width"));
  const heightAttr = parseSvgLength(svg.getAttribute("height"));
  if (widthAttr && heightAttr) {
    return { width: widthAttr, height: heightAttr };
  }

  const viewBox = parseViewBox(svg.getAttribute("viewBox"));
  if (viewBox) {
    if (widthAttr && !heightAttr) {
      return {
        width: widthAttr,
        height: (widthAttr * viewBox.height) / viewBox.width,
      };
    }
    if (heightAttr && !widthAttr) {
      return {
        width: (heightAttr * viewBox.width) / viewBox.height,
        height: heightAttr,
      };
    }
    return viewBox;
  }

  if (widthAttr) {
    return { width: widthAttr, height: widthAttr };
  }
  if (heightAttr) {
    return { width: heightAttr, height: heightAttr };
  }

  return { width: 512, height: 512 };
}

function prepareSvgMarkup(
  svgText: string,
  width: number,
  height: number,
): string {
  const svg = getSvgRoot(svgText);

  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  if (!svg.getAttribute("viewBox")) {
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

function loadSvgImage(
  svgMarkup: string,
  signal?: AbortSignal,
): Promise<HTMLImageElement> {
  throwIfAborted(signal);

  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(url);
      action();
    };

    const onAbort = () => {
      finish(() => {
        reject(new DOMException("Conversion cancelled.", "AbortError"));
      });
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    image.onload = () => {
      finish(() => resolve(image));
    };

    image.onerror = () => {
      finish(() => {
        reject(
          new Error(
            "Could not render this SVG. External fonts or linked images may be unsupported.",
          ),
        );
      });
    };

    image.src = url;
  });
}

function clampOutputSize(
  width: number,
  height: number,
  scale: SvgPngScale,
): { width: number; height: number } {
  let outW = Math.max(1, Math.round(width * scale));
  let outH = Math.max(1, Math.round(height * scale));

  const longest = Math.max(outW, outH);
  if (longest > MAX_PNG_EDGE) {
    const factor = MAX_PNG_EDGE / longest;
    outW = Math.max(1, Math.round(outW * factor));
    outH = Math.max(1, Math.round(outH * factor));
  }

  return { width: outW, height: outH };
}

async function convertSingleSvg(
  file: File,
  scale: SvgPngScale,
  signal?: AbortSignal,
): Promise<ConvertedSvgImage> {
  throwIfAborted(signal);

  let svgText: string;
  try {
    svgText = await file.text();
  } catch {
    throw new Error(`"${file.name}" could not be read. Try another SVG file.`);
  }

  throwIfAborted(signal);

  let intrinsic: { width: number; height: number };
  let markup: string;
  try {
    const root = getSvgRoot(svgText);
    intrinsic = resolveSvgSize(root);
    markup = prepareSvgMarkup(svgText, intrinsic.width, intrinsic.height);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not parse SVG.";
    throw new Error(`"${file.name}": ${message}`);
  }

  const image = await loadSvgImage(markup, signal);
  throwIfAborted(signal);

  const output = clampOutputSize(intrinsic.width, intrinsic.height, scale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  canvas.width = output.width;
  canvas.height = output.height;
  context.clearRect(0, 0, output.width, output.height);
  context.drawImage(image, 0, 0, output.width, output.height);

  const blob = await canvasToPngBlob(canvas);
  throwIfAborted(signal);

  if (blob.size < 1) {
    throw new Error(`"${file.name}" produced an empty PNG. Try another SVG.`);
  }

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    sourceName: file.name,
    blob,
    url: URL.createObjectURL(blob),
    outputSize: blob.size,
    originalSize: file.size,
    width: output.width,
    height: output.height,
    scale,
  };
}

export async function convertSvgToPng(
  files: File[],
  options: ConvertSvgToPngOptions = {},
): Promise<SvgToPngResult> {
  if (files.length === 0) {
    throw new Error("Add at least one SVG image to convert.");
  }

  const additionError = validateSvgAddition(files, []);
  if (additionError) {
    throw new Error(additionError);
  }

  const scale = options.scale ?? 1;
  const images: ConvertedSvgImage[] = [];

  for (let index = 0; index < files.length; index += 1) {
    throwIfAborted(options.signal);
    const file = files[index];
    options.onProgress?.(index + 1, files.length, file.name);

    try {
      const converted = await convertSingleSvg(file, scale, options.signal);
      images.push(converted);
    } catch (err) {
      revokeSvgToPngResult({ images, originalSize: 0, outputSize: 0, scale });
      throw err;
    }
  }

  throwIfAborted(options.signal);

  const originalSize = files.reduce((sum, file) => sum + file.size, 0);
  const outputSize = images.reduce((sum, image) => sum + image.outputSize, 0);

  return {
    images,
    originalSize,
    outputSize,
    scale,
  };
}

export function revokeSvgToPngResult(result: SvgToPngResult | null) {
  if (!result) return;
  for (const image of result.images) {
    URL.revokeObjectURL(image.url);
  }
}

export function downloadConvertedPng(image: ConvertedSvgImage) {
  downloadBlob(image.blob, pngFileName(image.sourceName, image.scale));
}

export async function downloadSvgPngResult(
  result: SvgToPngResult,
  sourceFiles: File[],
) {
  if (result.images.length === 1) {
    downloadConvertedPng(result.images[0]);
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of result.images) {
    let name = pngFileName(image.sourceName, image.scale);
    if (usedNames.has(name)) {
      const base = name.replace(/\.png$/i, "");
      let suffix = 2;
      while (usedNames.has(`${base}-${suffix}.png`)) {
        suffix += 1;
      }
      name = `${base}-${suffix}.png`;
    }
    usedNames.add(name);
    zip.file(name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const base =
    sourceFiles.length > 0
      ? fileBaseName(sourceFiles[0]) || "svg"
      : "svg";
  downloadBlob(zipBlob, `${base}-png.zip`);
}

export function describeSvgPngOutput(result: SvgToPngResult): string {
  const count =
    result.images.length === 1
      ? "1 PNG"
      : `${result.images.length} PNGs`;
  return `${count} · ${formatFileSize(result.outputSize)} · ${scaleLabel(result.scale)}`;
}
