import { downloadBlob, fileBaseName } from "@/lib/image";

export const COLORIZE_MODEL_URL =
  "https://raw.githubusercontent.com/linmingren/openmodels/main/models/deoldify/deoldify.quant.onnx";

export const COLORIZE_MODEL_BYTES = 64_020_138;
export const COLORIZE_INPUT_SIZE = 256;
export const MAX_COLORIZE_DIMENSION = 4096;

export type ColorizeStrength = "subtle" | "natural" | "vivid";

export type ColorizePreset = {
  id: ColorizeStrength;
  label: string;
  hint: string;
  chroma: number;
};

export const COLORIZE_PRESETS: ColorizePreset[] = [
  { id: "subtle", label: "Subtle", hint: "Soft tint", chroma: 0.65 },
  { id: "natural", label: "Natural", hint: "Balanced", chroma: 1 },
  { id: "vivid", label: "Vivid", hint: "Rich color", chroma: 1.35 },
];

export type ColorizePhotoResult = {
  blob: Blob;
  width: number;
  height: number;
  strength: ColorizeStrength;
};

export type ColorizePhotoOptions = {
  strength?: ColorizeStrength;
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

type OrtModule = {
  Tensor: typeof import("onnxruntime-web").Tensor;
  InferenceSession: typeof import("onnxruntime-web").InferenceSession;
};
type ColorizeSession = import("onnxruntime-web").InferenceSession;

let ortModulePromise: Promise<OrtModule> | null = null;
let sessionPromise: Promise<ColorizeSession> | null = null;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Colorize cancelled.", "AbortError");
  }
}

function getPreset(strength: ColorizeStrength): ColorizePreset {
  return (
    COLORIZE_PRESETS.find((preset) => preset.id === strength) ??
    COLORIZE_PRESETS[1]
  );
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

async function getOrt(): Promise<OrtModule> {
  if (!ortModulePromise) {
    ortModulePromise = import("onnxruntime-web").then((mod) => {
      const ort = ("default" in mod && mod.default ? mod.default : mod) as OrtModule;
      return ort;
    });
  }
  return ortModulePromise;
}

async function fetchModelBuffer(
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  throwIfAborted(signal);

  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open("focera-colorize-model-v1");
      const cached = await cache.match(COLORIZE_MODEL_URL);
      if (cached) {
        onProgress?.("Loading colorize model…");
        return cached.arrayBuffer();
      }
    } catch {
      // Cache API may be unavailable (private mode); fall through to network.
    }
  }

  onProgress?.("Downloading colorize model (first visit)…");

  const response = await fetch(COLORIZE_MODEL_URL, {
    signal,
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(
      "Could not download the colorize model. Check your connection and try again.",
    );
  }

  const totalHeader = Number(response.headers.get("content-length"));
  const total =
    Number.isFinite(totalHeader) && totalHeader > 0
      ? totalHeader
      : COLORIZE_MODEL_BYTES;

  if (!response.body) {
    const buffer = await response.arrayBuffer();
    await storeModelCache(buffer);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    throwIfAborted(signal);
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      const percent = Math.min(99, Math.round((received / total) * 100));
      onProgress?.(`Downloading colorize model… ${percent}%`);
    }
  }

  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  await storeModelCache(buffer.buffer);
  return buffer.buffer;
}

async function storeModelCache(buffer: ArrayBuffer) {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open("focera-colorize-model-v1");
    await cache.put(
      COLORIZE_MODEL_URL,
      new Response(buffer, {
        headers: { "Content-Type": "application/octet-stream" },
      }),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

async function getSession(
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
): Promise<ColorizeSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await getOrt();
      const modelBuffer = await fetchModelBuffer(onProgress, signal);
      throwIfAborted(signal);
      onProgress?.("Preparing AI model…");
      return ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["wasm"],
      });
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
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

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }
  return ctx;
}

function fitDimensions(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) {
    return { width, height };
  }
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Convert RGBA ImageData to grayscale NCHW float tensor (0–255). */
function preprocessGrayscale(
  imageData: ImageData,
  size: number,
): Float32Array {
  const { data } = imageData;
  const plane = size * size;
  const tensor = new Float32Array(3 * plane);

  for (let i = 0; i < plane; i += 1) {
    const offset = i * 4;
    const gray =
      0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
    tensor[i] = gray;
    tensor[plane + i] = gray;
    tensor[plane * 2 + i] = gray;
  }

  return tensor;
}

function tensorToImageData(
  tensorData: Float32Array,
  width: number,
  height: number,
): ImageData {
  const imageData = new ImageData(width, height);
  const { data } = imageData;
  const plane = width * height;

  for (let i = 0; i < plane; i += 1) {
    const pixel = i * 4;
    data[pixel] = clampByte(tensorData[i]);
    data[pixel + 1] = clampByte(tensorData[plane + i]);
    data[pixel + 2] = clampByte(tensorData[plane * 2 + i]);
    data[pixel + 3] = 255;
  }

  return imageData;
}

function transferColor(
  original: ImageData,
  colorLowRes: ImageData,
  chroma: number,
): ImageData {
  const width = original.width;
  const height = original.height;
  const out = new ImageData(width, height);
  const src = original.data;
  const dst = out.data;

  const colorCanvas = createCanvas(width, height);
  const colorCtx = getContext(colorCanvas);
  const lowCanvas = createCanvas(colorLowRes.width, colorLowRes.height);
  const lowCtx = getContext(lowCanvas);
  lowCtx.putImageData(colorLowRes, 0, 0);
  colorCtx.imageSmoothingEnabled = true;
  colorCtx.imageSmoothingQuality = "high";
  colorCtx.drawImage(lowCanvas, 0, 0, width, height);
  const color = colorCtx.getImageData(0, 0, width, height).data;

  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    const or = src[o];
    const og = src[o + 1];
    const ob = src[o + 2];
    const y = 0.299 * or + 0.587 * og + 0.114 * ob;

    const cr = color[o];
    const cg = color[o + 1];
    const cb = color[o + 2];
    let chromaB = 128 - 0.168736 * cr - 0.331264 * cg + 0.5 * cb;
    let chromaR = 128 + 0.5 * cr - 0.418688 * cg - 0.081312 * cb;

    chromaB = 128 + (chromaB - 128) * chroma;
    chromaR = 128 + (chromaR - 128) * chroma;

    const r = y + 1.402 * (chromaR - 128);
    const g = y - 0.344136 * (chromaB - 128) - 0.714136 * (chromaR - 128);
    const b = y + 1.772 * (chromaB - 128);

    dst[o] = clampByte(r);
    dst[o + 1] = clampByte(g);
    dst[o + 2] = clampByte(b);
    dst[o + 3] = src[o + 3];
  }

  return out;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not export the colorized image."));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1,
    );
  });
}

export async function colorizePhotoFile(
  file: File,
  options: ColorizePhotoOptions = {},
): Promise<ColorizePhotoResult> {
  const strength = options.strength ?? "natural";
  const preset = getPreset(strength);
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Reading image…");

  const image = await loadImage(file);
  throwIfAborted(signal);

  if (image.naturalWidth < 1 || image.naturalHeight < 1) {
    throw new Error("This image has no readable dimensions.");
  }

  const fitted = fitDimensions(
    image.naturalWidth,
    image.naturalHeight,
    MAX_COLORIZE_DIMENSION,
  );

  const fullCanvas = createCanvas(fitted.width, fitted.height);
  const fullCtx = getContext(fullCanvas);
  fullCtx.drawImage(image, 0, 0, fitted.width, fitted.height);
  const originalData = fullCtx.getImageData(0, 0, fitted.width, fitted.height);

  const modelCanvas = createCanvas(COLORIZE_INPUT_SIZE, COLORIZE_INPUT_SIZE);
  const modelCtx = getContext(modelCanvas);
  modelCtx.drawImage(image, 0, 0, COLORIZE_INPUT_SIZE, COLORIZE_INPUT_SIZE);
  const modelInput = modelCtx.getImageData(
    0,
    0,
    COLORIZE_INPUT_SIZE,
    COLORIZE_INPUT_SIZE,
  );

  const session = await getSession(onProgress, signal);
  throwIfAborted(signal);

  onProgress?.("Colorizing photo…");
  const ort = await getOrt();
  const inputTensor = new ort.Tensor(
    "float32",
    preprocessGrayscale(modelInput, COLORIZE_INPUT_SIZE),
    [1, 3, COLORIZE_INPUT_SIZE, COLORIZE_INPUT_SIZE],
  );

  const outputMap = await session.run({ input: inputTensor });
  throwIfAborted(signal);

  const output = outputMap.out ?? Object.values(outputMap)[0];
  if (!output || !(output.data instanceof Float32Array)) {
    throw new Error("Colorize model returned an unexpected result.");
  }

  onProgress?.("Blending colors…");
  const colorLowRes = tensorToImageData(
    output.data,
    COLORIZE_INPUT_SIZE,
    COLORIZE_INPUT_SIZE,
  );
  const blended = transferColor(originalData, colorLowRes, preset.chroma);
  fullCtx.putImageData(blended, 0, 0);

  onProgress?.("Exporting PNG…");
  const blob = await canvasToPngBlob(fullCanvas);
  throwIfAborted(signal);

  return {
    blob,
    width: fitted.width,
    height: fitted.height,
    strength,
  };
}

export function downloadColorizedImage(
  blob: Blob,
  sourceFile: File,
): void {
  downloadBlob(blob, `${fileBaseName(sourceFile)}-colorized.png`);
}

export function describeColorizeResult(
  width: number,
  height: number,
  strength: ColorizeStrength,
): string {
  const label = getPreset(strength).label;
  return `${width}×${height} · ${label}`;
}
