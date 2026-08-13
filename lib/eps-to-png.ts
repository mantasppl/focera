import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";

export const ACCEPTED_EPS_TYPES = [
  "application/postscript",
  "application/eps",
  "application/x-eps",
  "image/x-eps",
  "image/eps",
] as const;

export const MAX_EPS_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_PNG_EDGE = 8192;

/** Pinned CDN assets for @bentopdf/gs-wasm (gs.js + gs.wasm). */
const GS_ASSETS_BASE =
  "https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;

export type EpsPngDpi = 72 | 150 | 300;
export type EpsPngBackground = "transparent" | "white";

export type EpsToPngResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  dpi: EpsPngDpi;
  background: EpsPngBackground;
  originalSize: number;
  outputSize: number;
};

export type ConvertEpsToPngOptions = {
  dpi?: EpsPngDpi;
  background?: EpsPngBackground;
  onProgress?: (label: string) => void;
  signal?: AbortSignal;
};

type GhostscriptModule = {
  callMain: (args?: string[]) => number;
  FS: {
    writeFile: (path: string, data: Uint8Array | string) => void;
    readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
    unlink: (path: string) => void;
  };
};

type GhostscriptModuleFactory = (config: {
  locateFile: (path: string) => string;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}) => Promise<GhostscriptModule>;

let gsModulePromise: Promise<GhostscriptModule> | null = null;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Conversion cancelled.", "AbortError");
  }
}

function isAcceptedEps(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".eps") || name.endsWith(".epsf")) {
    return true;
  }
  return ACCEPTED_EPS_TYPES.includes(
    file.type as (typeof ACCEPTED_EPS_TYPES)[number],
  );
}

export function validateEpsFile(file: File): string | null {
  if (!isAcceptedEps(file)) {
    return "Please upload an EPS file (.eps or .epsf).";
  }

  if (file.size > MAX_EPS_SIZE_BYTES) {
    return `EPS file must be ${formatFileSize(MAX_EPS_SIZE_BYTES)} or smaller.`;
  }

  if (file.size === 0) {
    return "This EPS file is empty.";
  }

  return null;
}

export function dpiLabel(dpi: EpsPngDpi): string {
  switch (dpi) {
    case 150:
      return "Draft 150 DPI";
    case 300:
      return "Print 300 DPI";
    default:
      return "Screen 72 DPI";
  }
}

export function backgroundLabel(background: EpsPngBackground): string {
  return background === "white" ? "White background" : "Transparent";
}

async function loadGhostscriptModule(): Promise<GhostscriptModule> {
  if (!gsModulePromise) {
    gsModulePromise = (async () => {
      const jsUrl = `${GS_ASSETS_BASE}gs.js`;
      const response = await fetch(jsUrl);
      if (!response.ok) {
        throw new Error(
          `Could not load the EPS converter engine (HTTP ${response.status}). Check your connection and try again.`,
        );
      }

      const jsText = await response.text();
      const blob = new Blob([jsText], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);

      try {
        const moduleNs = (await import(
          /* webpackIgnore: true */ blobUrl
        )) as { default: GhostscriptModuleFactory };
        const factory = moduleNs.default;
        if (typeof factory !== "function") {
          throw new Error("Ghostscript module factory is unavailable.");
        }

        return await factory({
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) {
              return `${GS_ASSETS_BASE}gs.wasm`;
            }
            return `${GS_ASSETS_BASE}${path}`;
          },
          print: () => {},
          printErr: () => {},
        });
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    })().catch((error) => {
      gsModulePromise = null;
      throw error;
    });
  }

  return gsModulePromise;
}

function safeUnlink(gs: GhostscriptModule, path: string) {
  try {
    gs.FS.unlink(path);
  } catch {
    // Ignore missing temp files.
  }
}

function buildGsArgs(
  inputPath: string,
  outputPath: string,
  dpi: EpsPngDpi,
  background: EpsPngBackground,
): string[] {
  const device = background === "white" ? "png16m" : "pngalpha";

  return [
    "-dNOSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-dQUIET",
    `-sDEVICE=${device}`,
    `-r${dpi}`,
    "-dEPSCrop",
    "-dTextAlphaBits=4",
    "-dGraphicsAlphaBits=4",
    "-dAlignToPixels=0",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 24) {
    throw new Error("Conversion produced an invalid PNG. Try another EPS.");
  }

  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (bytes[index] !== PNG_SIGNATURE[index]) {
      throw new Error(
        "Conversion did not produce a PNG image. The EPS may be damaged or use unsupported PostScript features.",
      );
    }
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);

  if (width < 1 || height < 1) {
    throw new Error("Conversion produced an empty PNG. Try another EPS.");
  }

  return { width, height };
}

async function runGhostscript(
  input: Uint8Array,
  dpi: EpsPngDpi,
  background: EpsPngBackground,
  onProgress?: (label: string) => void,
): Promise<Uint8Array> {
  onProgress?.("Loading converter…");
  const gs = await loadGhostscriptModule();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const inputPath = `/tmp/input-${id}.eps`;
  const outputPath = `/tmp/output-${id}.png`;

  onProgress?.("Rasterizing EPS…");
  gs.FS.writeFile(inputPath, input);

  let exitCode: number;
  try {
    exitCode = gs.callMain(buildGsArgs(inputPath, outputPath, dpi, background));
  } catch (error) {
    safeUnlink(gs, inputPath);
    safeUnlink(gs, outputPath);

    // Some WASM builds become unusable after a failed run — force reload next time.
    gsModulePromise = null;

    const detail =
      error instanceof Error ? error.message : "Unknown Ghostscript error";
    throw new Error(
      `Could not convert this EPS file. ${detail} Try another file or simplify the artwork.`,
    );
  }

  if (exitCode !== 0) {
    safeUnlink(gs, inputPath);
    safeUnlink(gs, outputPath);
    gsModulePromise = null;
    throw new Error(
      `EPS conversion failed (exit ${exitCode}). The file may be damaged or use unsupported PostScript features.`,
    );
  }

  let output: Uint8Array;
  try {
    output = gs.FS.readFile(outputPath);
  } catch {
    safeUnlink(gs, inputPath);
    safeUnlink(gs, outputPath);
    throw new Error("Conversion finished but no PNG was produced. Try another EPS.");
  } finally {
    safeUnlink(gs, inputPath);
    safeUnlink(gs, outputPath);
  }

  if (!output.length) {
    throw new Error("Conversion produced an empty PNG. Try another EPS.");
  }

  // Copy out of WASM heap so the buffer stays valid after FS cleanup.
  return output.slice();
}

export async function convertEpsToPng(
  file: File,
  options: ConvertEpsToPngOptions = {},
): Promise<EpsToPngResult> {
  const validationError = validateEpsFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const dpi = options.dpi ?? 150;
  const background = options.background ?? "transparent";
  throwIfAborted(options.signal);

  options.onProgress?.("Reading EPS…");
  const input = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(options.signal);

  const pngBytes = await runGhostscript(
    input,
    dpi,
    background,
    options.onProgress,
  );
  throwIfAborted(options.signal);

  options.onProgress?.("Finalizing PNG…");
  const { width, height } = readPngSize(pngBytes);

  if (width > MAX_PNG_EDGE || height > MAX_PNG_EDGE) {
    throw new Error(
      `This EPS rasterized to ${width}×${height} px, which is too large. Try Screen (72 DPI) or Draft (150 DPI).`,
    );
  }

  throwIfAborted(options.signal);

  const copy = new Uint8Array(pngBytes.length);
  copy.set(pngBytes);
  const blob = new Blob([copy], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    width,
    height,
    dpi,
    background,
    originalSize: file.size,
    outputSize: blob.size,
  };
}

export function revokeEpsToPngResult(result: EpsToPngResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadEpsPng(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "eps";
  downloadBlob(blob, `${base}.png`);
}

export function describeEpsPngOutput(result: EpsToPngResult): string {
  return `${result.width}×${result.height} · ${formatFileSize(result.outputSize)}`;
}
