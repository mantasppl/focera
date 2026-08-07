import { PDFDocument } from "pdf-lib";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";

export const ACCEPTED_EPS_TYPES = [
  "application/postscript",
  "application/eps",
  "application/x-eps",
  "image/x-eps",
  "image/eps",
] as const;

export const MAX_EPS_SIZE_BYTES = 25 * 1024 * 1024;

/** Pinned CDN assets for @bentopdf/gs-wasm (gs.js + gs.wasm). */
const GS_ASSETS_BASE =
  "https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/";

export type EpsPdfPageSize = "crop" | "a4" | "letter";

export type EpsToPdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
  pageSize: EpsPdfPageSize;
  originalSize: number;
  outputSize: number;
};

export type ConvertEpsToPdfOptions = {
  pageSize?: EpsPdfPageSize;
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

const PAGE_POINTS: Record<"a4" | "letter", { width: number; height: number }> =
  {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  };

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
  pageSize: EpsPdfPageSize,
): string[] {
  const args = [
    "-dNOSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-dQUIET",
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dAutoRotatePages=/None",
    "-dEmbedAllFonts=true",
    "-dSubsetFonts=true",
  ];

  if (pageSize === "crop") {
    args.push("-dEPSCrop");
  } else {
    const { width, height } = PAGE_POINTS[pageSize];
    args.push(
      `-dDEVICEWIDTHPOINTS=${width}`,
      `-dDEVICEHEIGHTPOINTS=${height}`,
      "-dFIXEDMEDIA",
      "-dEPSFitPage",
    );
  }

  args.push(`-sOutputFile=${outputPath}`, inputPath);
  return args;
}

async function runGhostscript(
  input: Uint8Array,
  pageSize: EpsPdfPageSize,
  onProgress?: (label: string) => void,
): Promise<Uint8Array> {
  onProgress?.("Loading converter…");
  const gs = await loadGhostscriptModule();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const inputPath = `/tmp/input-${id}.eps`;
  const outputPath = `/tmp/output-${id}.pdf`;

  onProgress?.("Converting EPS…");
  gs.FS.writeFile(inputPath, input);

  let exitCode: number;
  try {
    exitCode = gs.callMain(buildGsArgs(inputPath, outputPath, pageSize));
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
    throw new Error("Conversion finished but no PDF was produced. Try another EPS.");
  } finally {
    safeUnlink(gs, inputPath);
    safeUnlink(gs, outputPath);
  }

  if (!output.length) {
    throw new Error("Conversion produced an empty PDF. Try another EPS.");
  }

  // Copy out of WASM heap so the buffer stays valid after FS cleanup.
  return output.slice();
}

export async function convertEpsToPdf(
  file: File,
  options: ConvertEpsToPdfOptions = {},
): Promise<EpsToPdfResult> {
  const validationError = validateEpsFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const pageSize = options.pageSize ?? "crop";
  throwIfAborted(options.signal);

  options.onProgress?.("Reading EPS…");
  const input = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(options.signal);

  const pdfBytes = await runGhostscript(input, pageSize, options.onProgress);
  throwIfAborted(options.signal);

  options.onProgress?.("Finalizing PDF…");
  let pageCount = 1;
  try {
    const pdf = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
    });
    pageCount = pdf.getPageCount() || 1;
  } catch {
    // Still return the Ghostscript output even if pdf-lib cannot count pages.
  }

  throwIfAborted(options.signal);

  const copy = new Uint8Array(pdfBytes.length);
  copy.set(pdfBytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    pageCount,
    pageSize,
    originalSize: file.size,
    outputSize: blob.size,
  };
}

export function revokeEpsToPdfResult(result: EpsToPdfResult | null) {
  if (result?.url) {
    URL.revokeObjectURL(result.url);
  }
}

export function downloadEpsPdf(blob: Blob, sourceFile: File) {
  const base = fileBaseName(sourceFile) || "eps";
  downloadBlob(blob, `${base}.pdf`);
}

export function describeEpsPdfOutput(result: EpsToPdfResult): string {
  const pages =
    result.pageCount === 1 ? "1 page" : `${result.pageCount} pages`;
  return `${pages} · ${formatFileSize(result.outputSize)}`;
}

export function pageSizeLabel(pageSize: EpsPdfPageSize): string {
  switch (pageSize) {
    case "a4":
      return "A4";
    case "letter":
      return "Letter";
    default:
      return "Crop to artwork";
  }
}
