export const UNBLUR_MODEL_URL =
  "https://huggingface.co/CoderViking/realesr-general-x4v3-onnx/resolve/main/realesr-general-x4v3.onnx";

export const UNBLUR_MODEL_BYTES = 4_866_417;
export const UNBLUR_MODEL_CACHE = "focera-unblur-model-v1";
export const UNBLUR_SCALE = 4;
export const UNBLUR_FIRST_RUN_HINT =
  "The first run downloads a 5 MB AI model, then caches it on this device.";

const MODEL_READY_KEY = "focera-unblur-model-ready";
const TILE_SIZE = 96;
const TILE_OVERLAP = 16;

type OrtModule = {
  env?: {
    wasm?: { numThreads?: number; proxy?: boolean };
  };
  Tensor: typeof import("onnxruntime-web").Tensor;
  InferenceSession: typeof import("onnxruntime-web").InferenceSession;
};
type UnblurSession = import("onnxruntime-web").InferenceSession;

let ortModulePromise: Promise<OrtModule> | null = null;
let sessionPromise: Promise<UnblurSession> | null = null;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Unblur cancelled.", "AbortError");
  }
}

async function yieldToMain(signal?: AbortSignal) {
  throwIfAborted(signal);
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
  throwIfAborted(signal);
}

export function hasPreparedUnblurModel(): boolean {
  try {
    return window.sessionStorage.getItem(MODEL_READY_KEY) === "1";
  } catch {
    return false;
  }
}

function markUnblurModelPrepared() {
  try {
    window.sessionStorage.setItem(MODEL_READY_KEY, "1");
  } catch {
    // Private mode can block sessionStorage.
  }
}

function isConstrainedClient(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|Android.+Mobile|webOS|BlackBerry/i.test(ua)) return true;
  if (/iPad|Android/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}

function maxWorkSide(): number {
  if (isConstrainedClient()) return 192;
  const memory = Number(
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  );
  if (Number.isFinite(memory) && memory > 0 && memory <= 4) return 256;
  return 320;
}

function disposeTensor(tensor: unknown) {
  const disposable = tensor as { dispose?: () => void } | undefined;
  try {
    disposable?.dispose?.();
  } catch {
    // Already released, or this ORT build has no dispose().
  }
}

let sessionGate: Promise<void> = Promise.resolve();

async function releaseSession() {
  const pending = sessionPromise;
  sessionPromise = null;
  if (!pending) return;
  try {
    const session = await pending;
    await session.release?.();
  } catch {
    // Session may already be gone.
  }
}

async function getOrt(): Promise<OrtModule> {
  if (!ortModulePromise) {
    ortModulePromise = import("onnxruntime-web").then((mod) => {
      const ort = ("default" in mod && mod.default ? mod.default : mod) as OrtModule;
      if (ort.env?.wasm) {
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;
      }
      return ort;
    });
  }
  return ortModulePromise;
}

async function storeModelCache(buffer: ArrayBuffer) {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(UNBLUR_MODEL_CACHE);
    await cache.put(
      UNBLUR_MODEL_URL,
      new Response(buffer, {
        headers: { "Content-Type": "application/octet-stream" },
      }),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

async function fetchModelBuffer(
  onProgress?: (message: string) => void,
): Promise<ArrayBuffer> {
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(UNBLUR_MODEL_CACHE);
      const cached = await cache.match(UNBLUR_MODEL_URL);
      if (cached) {
        onProgress?.("Loading AI model…");
        markUnblurModelPrepared();
        return cached.arrayBuffer();
      }
    } catch {
      // Cache API may be unavailable (private mode); fall through to network.
    }
  }

  onProgress?.("Downloading AI model (first visit)…");

  const response = await fetch(UNBLUR_MODEL_URL, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Could not download the unblur model.");
  }

  const totalHeader = Number(response.headers.get("content-length"));
  const total =
    Number.isFinite(totalHeader) && totalHeader > 0
      ? totalHeader
      : UNBLUR_MODEL_BYTES;

  if (!response.body) {
    const buffer = await response.arrayBuffer();
    await storeModelCache(buffer);
    markUnblurModelPrepared();
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      const percent = Math.min(99, Math.round((received / total) * 100));
      onProgress?.(`Downloading AI model… ${percent}%`);
    }
  }

  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  await storeModelCache(buffer.buffer);
  markUnblurModelPrepared();
  return buffer.buffer;
}

async function getSession(
  onProgress?: (message: string) => void,
): Promise<UnblurSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await getOrt();
      const modelBuffer = await fetchModelBuffer(onProgress);
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

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
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

function rgbaToNchw(data: Uint8ClampedArray, width: number, height: number) {
  const plane = width * height;
  const tensor = new Float32Array(plane * 3);
  for (let i = 0; i < plane; i += 1) {
    const o = i * 4;
    tensor[i] = data[o] / 255;
    tensor[plane + i] = data[o + 1] / 255;
    tensor[plane * 2 + i] = data[o + 2] / 255;
  }
  return tensor;
}

function tileStarts(length: number): number[] {
  if (length <= TILE_SIZE) return [0];
  const stride = Math.max(1, TILE_SIZE - TILE_OVERLAP);
  const starts: number[] = [];
  for (let pos = 0; pos < length; pos += stride) {
    const start = Math.min(pos, length - TILE_SIZE);
    if (starts.length === 0 || starts[starts.length - 1] !== start) {
      starts.push(start);
    }
    if (start + TILE_SIZE >= length) break;
  }
  return starts;
}

function collectTiles(width: number, height: number) {
  const tiles: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (const y of tileStarts(height)) {
    for (const x of tileStarts(width)) {
      tiles.push({
        x,
        y,
        w: Math.min(TILE_SIZE, width - x),
        h: Math.min(TILE_SIZE, height - y),
      });
    }
  }
  return tiles;
}

function edgeFeather(
  local: number,
  size: number,
  overlap: number,
  atLowEdge: boolean,
  atHighEdge: boolean,
): number {
  let weight = 1;
  if (!atLowEdge && overlap > 0 && local < overlap) {
    weight = (local + 0.5) / overlap;
  }
  if (!atHighEdge && overlap > 0 && local > size - overlap - 1) {
    weight = Math.min(weight, (size - local - 0.5) / overlap);
  }
  return Math.max(0, Math.min(1, weight));
}

function accumulateTile(
  accR: Float32Array,
  accG: Float32Array,
  accB: Float32Array,
  accW: Float32Array,
  outW: number,
  outH: number,
  floats: Float32Array,
  tileOutW: number,
  tileOutH: number,
  destX: number,
  destY: number,
  overlapOut: number,
  atLeft: boolean,
  atTop: boolean,
  atRight: boolean,
  atBottom: boolean,
) {
  const plane = tileOutW * tileOutH;
  for (let y = 0; y < tileOutH; y += 1) {
    const gy = destY + y;
    if (gy < 0 || gy >= outH) continue;
    const wy = edgeFeather(y, tileOutH, overlapOut, atTop, atBottom);
    if (wy <= 0) continue;
    for (let x = 0; x < tileOutW; x += 1) {
      const gx = destX + x;
      if (gx < 0 || gx >= outW) continue;
      const w = wy * edgeFeather(x, tileOutW, overlapOut, atLeft, atRight);
      if (w <= 0) continue;
      const i = y * tileOutW + x;
      const o = gy * outW + gx;
      accR[o] += floats[i] * w;
      accG[o] += floats[plane + i] * w;
      accB[o] += floats[plane * 2 + i] * w;
      accW[o] += w;
    }
  }
}

function accumulatorsToImageData(
  accR: Float32Array,
  accG: Float32Array,
  accB: Float32Array,
  accW: Float32Array,
  width: number,
  height: number,
): ImageData {
  const image = new ImageData(width, height);
  const { data } = image;
  for (let i = 0; i < width * height; i += 1) {
    const w = accW[i] > 1e-6 ? accW[i] : 1;
    const o = i * 4;
    data[o] = Math.max(0, Math.min(255, Math.round((accR[i] / w) * 255)));
    data[o + 1] = Math.max(0, Math.min(255, Math.round((accG[i] / w) * 255)));
    data[o + 2] = Math.max(0, Math.min(255, Math.round((accB[i] / w) * 255)));
    data[o + 3] = 255;
  }
  return image;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export the unblurred image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export type UnblurAiOptions = {
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

export async function unblurWithAi(
  image: HTMLImageElement | ImageBitmap,
  options: UnblurAiOptions = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const { onProgress, signal } = options;
  throwIfAborted(signal);

  const width =
    "naturalWidth" in image && image.naturalWidth
      ? image.naturalWidth
      : image.width;
  const height =
    "naturalHeight" in image && image.naturalHeight
      ? image.naturalHeight
      : image.height;
  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }

  const work = fitDimensions(width, height, maxWorkSide());
  const workCanvas = createCanvas(work.width, work.height);
  const workCtx = getContext(workCanvas);
  workCtx.imageSmoothingEnabled = true;
  workCtx.imageSmoothingQuality = "high";
  workCtx.drawImage(image, 0, 0, work.width, work.height);
  if ("close" in image) {
    try {
      image.close();
    } catch {
      // Already closed.
    }
  }

  let unlockGate = () => {};
  const previousGate = sessionGate;
  sessionGate = new Promise<void>((resolve) => {
    unlockGate = resolve;
  });
  await previousGate;

  try {
    const session = await getSession(onProgress);
    throwIfAborted(signal);
    const ort = await getOrt();

    const tiles = collectTiles(work.width, work.height);
    const outW = work.width * UNBLUR_SCALE;
    const outH = work.height * UNBLUR_SCALE;
    let accR = new Float32Array(outW * outH);
    let accG = new Float32Array(outW * outH);
    let accB = new Float32Array(outW * outH);
    let accW = new Float32Array(outW * outH);
    const overlapOut = TILE_OVERLAP * UNBLUR_SCALE;

    for (let index = 0; index < tiles.length; index += 1) {
      throwIfAborted(signal);
      onProgress?.(
        tiles.length === 1
          ? "Enhancing with AI…"
          : `Enhancing with AI… ${index + 1}/${tiles.length}`,
      );
      await yieldToMain(signal);

      const tile = tiles[index];
      const tileData = workCtx.getImageData(tile.x, tile.y, tile.w, tile.h);
      const inputTensor = new ort.Tensor(
        "float32",
        rgbaToNchw(tileData.data, tile.w, tile.h),
        [1, 3, tile.h, tile.w],
      );
      const inputName = session.inputNames[0] ?? "input";
      let outputMap: Awaited<ReturnType<UnblurSession["run"]>> | undefined;
      try {
        outputMap = await session.run({ [inputName]: inputTensor });
        throwIfAborted(signal);
        const outputName = session.outputNames[0];
        const output =
          (outputName ? outputMap[outputName] : undefined) ??
          outputMap.output ??
          Object.values(outputMap)[0];
        const raw = output?.data;
        if (!output || raw == null) {
          throw new Error("Unblur model returned an unexpected result.");
        }

        const dims = output.dims;
        const tileOutH =
          dims && dims.length === 4 ? Number(dims[2]) : tile.h * UNBLUR_SCALE;
        const tileOutW =
          dims && dims.length === 4 ? Number(dims[3]) : tile.w * UNBLUR_SCALE;
        const floats =
          raw instanceof Float32Array
            ? raw.slice()
            : Float32Array.from(raw as ArrayLike<number>);

        disposeTensor(inputTensor);
        for (const value of Object.values(outputMap)) {
          disposeTensor(value);
        }
        outputMap = undefined;

        accumulateTile(
          accR,
          accG,
          accB,
          accW,
          outW,
          outH,
          floats,
          tileOutW,
          tileOutH,
          tile.x * UNBLUR_SCALE,
          tile.y * UNBLUR_SCALE,
          overlapOut,
          tile.x === 0,
          tile.y === 0,
          tile.x + tile.w >= work.width,
          tile.y + tile.h >= work.height,
        );
      } finally {
        disposeTensor(inputTensor);
        if (outputMap) {
          for (const value of Object.values(outputMap)) {
            disposeTensor(value);
          }
        }
      }
    }

    throwIfAborted(signal);
    onProgress?.("Applying AI result…");
    const enhancedData = accumulatorsToImageData(
      accR,
      accG,
      accB,
      accW,
      outW,
      outH,
    );
    accR = new Float32Array(0);
    accG = new Float32Array(0);
    accB = new Float32Array(0);
    accW = new Float32Array(0);
    await yieldToMain(signal);

    const enhanced = createCanvas(outW, outH);
    const enhancedCtx = getContext(enhanced);
    enhancedCtx.putImageData(enhancedData, 0, 0);
    workCanvas.width = 0;
    workCanvas.height = 0;

    const exportWidth = Math.min(width, outW);
    const exportHeight = Math.min(height, outH);
    let exportCanvas = enhanced;
    if (exportWidth !== outW || exportHeight !== outH) {
      exportCanvas = createCanvas(exportWidth, exportHeight);
      const exportCtx = getContext(exportCanvas);
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = "high";
      exportCtx.drawImage(enhanced, 0, 0, exportWidth, exportHeight);
      enhanced.width = 0;
      enhanced.height = 0;
    }

    onProgress?.("Exporting PNG…");
    const blob = await canvasToPngBlob(exportCanvas);
    exportCanvas.width = 0;
    exportCanvas.height = 0;

    return { blob, width: exportWidth, height: exportHeight };
  } catch (error) {
    workCanvas.width = 0;
    workCanvas.height = 0;
    throw error;
  } finally {
    await releaseSession();
    unlockGate();
  }
}
