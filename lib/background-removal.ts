export type RemovalProgress = {
  key: string;
  current: number;
  total: number;
};

export type RemoveBackgroundOptions = {
  onProgress?: (progress: RemovalProgress) => void;
};

const MODEL_READY_KEY = "focera-bg-model-ready";

export const BACKGROUND_FIRST_RUN_HINT =
  "The first run can take a little longer.";

export function hasPreparedBackgroundModel(): boolean {
  try {
    return window.sessionStorage.getItem(MODEL_READY_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBackgroundModelPrepared(): void {
  try {
    window.sessionStorage.setItem(MODEL_READY_KEY, "1");
  } catch {
    // Private mode can block sessionStorage.
  }
}

type RemovalDevice = "gpu" | "cpu";

type ImglyConfig = {
  model: "isnet_quint8";
  device: RemovalDevice;
  debug: false;
  proxyToWorker: false;
  output: {
    format: "image/png";
    quality: number;
  };
  progress?: (key: string, current: number, total: number) => void;
};

let preloadPromise: Promise<void> | null = null;
let preferredDevice: RemovalDevice | null = null;

export function isConstrainedClient(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  if (/iPhone|iPod|Android.+Mobile|webOS|BlackBerry/i.test(ua)) return true;
  if (/iPad|Android/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }

  return false;
}

function supportsWebGpu(): boolean {
  if (isConstrainedClient()) return false;
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

function resolveDevice(): RemovalDevice {
  if (preferredDevice) return preferredDevice;
  return supportsWebGpu() ? "gpu" : "cpu";
}

type ProgressListener = (percent: number) => void;

const progressListeners = new Set<ProgressListener>();
let lastRemovalPercent = 0;

export function subscribeRemovalProgress(
  listener: ProgressListener,
): () => void {
  progressListeners.add(listener);
  listener(lastRemovalPercent);
  return () => {
    progressListeners.delete(listener);
  };
}

function emitRemovalPercent(percent: number) {
  const next = Math.max(0, Math.min(100, Math.round(percent)));
  if (next === lastRemovalPercent) return;
  lastRemovalPercent = next;
  progressListeners.forEach((listener) => listener(next));
}

function removalProgressPercent({
  key,
  current,
  total,
}: RemovalProgress): number {
  if (key.startsWith("fetch:")) {
    if (total <= 0) return 4;
    return Math.max(1, Math.min(36, Math.round((current / total) * 36)));
  }

  if (total <= 0) return 40;
  return Math.max(38, Math.min(99, Math.round(38 + (current / total) * 61)));
}

function buildConfig(
  device: RemovalDevice,
  onProgress?: RemoveBackgroundOptions["onProgress"],
): ImglyConfig {
  return {
    model: "isnet_quint8",
    device,
    debug: false,
    proxyToWorker: false,
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: (key, current, total) => {
      emitRemovalPercent(removalProgressPercent({ key, current, total }));
      onProgress?.({ key, current, total });
    },
  };
}

let onnxConsoleFilterInstalled = false;

type OrtLike = {
  env?: {
    debug?: boolean;
    logLevel?: string;
    wasm?: { numThreads?: number };
  };
  InferenceSession: {
    create: (
      model: unknown,
      options?: Record<string, unknown>,
    ) => Promise<unknown>;
  };
};

const patchedOrt = new WeakSet<object>();

function isBenignOnnxLog(args: unknown[]): boolean {
  const text = args.map(String).join(" ");
  return (
    text.includes("VerifyEachNodeIsAssignedToAnEp") ||
    text.includes("[W:onnxruntime") ||
    text.includes("env.wasm.numThreads") ||
    text.includes("WebAssembly multi-threading is not supported")
  );
}

function installBenignOnnxConsoleFilter() {
  if (onnxConsoleFilterInstalled || typeof console === "undefined") return;
  onnxConsoleFilterInstalled = true;

  for (const method of ["log", "info", "warn", "error"] as const) {
    let current = console[method].bind(console);
    const filtered = (...args: unknown[]) => {
      if (!isBenignOnnxLog(args)) current(...args);
    };

    Object.defineProperty(console, method, {
      configurable: true,
      enumerable: true,
      get: () => filtered,
      set: (next: typeof console.log) => {
        current = next.bind(console);
      },
    });
  }
}

function asOrtModule(mod: unknown): OrtLike | null {
  if (!mod || typeof mod !== "object") return null;
  const record = mod as { default?: OrtLike } & Partial<OrtLike>;
  const ort = record.default ?? record;
  return ort.InferenceSession ? (ort as OrtLike) : null;
}

function patchOrt(mod: unknown) {
  const ort = asOrtModule(mod);
  if (!ort || patchedOrt.has(ort)) return;
  patchedOrt.add(ort);

  if (ort.env) {
    ort.env.debug = false;
    ort.env.logLevel = "error";
    if (ort.env.wasm) {
      Object.defineProperty(ort.env.wasm, "numThreads", {
        configurable: true,
        enumerable: true,
        get: () => 1,
        set: () => {
          // Page is not cross-origin isolated, so extra threads cannot start.
        },
      });
    }
  }

  const create = ort.InferenceSession.create.bind(
    ort.InferenceSession,
  ) as OrtLike["InferenceSession"]["create"];
  ort.InferenceSession.create = (model, options = {}) =>
    create(model, {
      ...options,
      logSeverityLevel: 3,
      logVerbosityLevel: 0,
    });
}

async function quietOnnxRuntime() {
  installBenignOnnxConsoleFilter();

  if (supportsWebGpu()) {
    try {
      patchOrt(await import("onnxruntime-web/webgpu"));
      return;
    } catch {
      // Fall through to the CPU ORT bundle.
    }
  }

  try {
    patchOrt(await import("onnxruntime-web"));
  } catch {
    // onnxruntime-web may already be loaded through @imgly.
  }
}

async function yieldToUi(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

let previewPrepare: Promise<void> = Promise.resolve();
let settlePreviewPrepare: (() => void) | null = null;

export function beginPreviewPrepare(): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    settlePreviewPrepare?.();
  };

  previewPrepare = new Promise<void>((resolve) => {
    settlePreviewPrepare = resolve;
  });

  const timeout = window.setTimeout(settle, 2000);
  return () => {
    window.clearTimeout(timeout);
    settle();
  };
}

function waitForPreviewPrepare(): Promise<void> {
  return previewPrepare;
}

async function prepareRemovalSource(source: Blob): Promise<Blob> {
  if (!isConstrainedClient() || typeof createImageBitmap !== "function") {
    return source;
  }

  const maxEdge = 1600;
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));

  if (scale >= 1) {
    bitmap.close();
    return source;
  }

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    bitmap.close();
    return source;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const prepared = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  return prepared ?? source;
}

async function loadRemovalApi() {
  await quietOnnxRuntime();
  return import("@imgly/background-removal");
}

/** Start downloading the ONNX model as soon as a cutout tool is open. */
export function preloadBackgroundRemoval(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      const { preload } = await loadRemovalApi();
      const device = resolveDevice();

      try {
        await preload(buildConfig(device));
        preferredDevice = device;
      } catch {
        if (device !== "gpu") throw new Error("Could not load the cutout model.");
        preferredDevice = "cpu";
        await preload(buildConfig("cpu"));
      }
    })().catch(() => {
      preloadPromise = null;
    });
  }

  return preloadPromise ?? Promise.resolve();
}

export async function removeImageBackground(
  source: Blob,
  options: RemoveBackgroundOptions = {},
): Promise<Blob> {
  emitRemovalPercent(1);
  await yieldToUi();
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
  await waitForPreviewPrepare();
  const prepared = await prepareRemovalSource(source);
  const { removeBackground } = await loadRemovalApi();
  await preloadBackgroundRemoval();

  const tryGpu = resolveDevice() === "gpu";

  if (tryGpu) {
    try {
      const blob = await removeBackground(
        prepared,
        buildConfig("gpu", options.onProgress),
      );
      preferredDevice = "gpu";
      markBackgroundModelPrepared();
      emitRemovalPercent(100);
      return blob;
    } catch {
      preferredDevice = "cpu";
      preloadPromise = null;
    }
  }

  const blob = await removeBackground(
    prepared,
    buildConfig("cpu", options.onProgress),
  );
  preferredDevice = "cpu";
  markBackgroundModelPrepared();
  emitRemovalPercent(100);
  return blob;
}
