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
  output: {
    format: "image/png";
    quality: number;
  };
  progress?: (key: string, current: number, total: number) => void;
};

let preloadPromise: Promise<void> | null = null;
let preferredDevice: RemovalDevice | null = null;

function supportsWebGpu(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

function resolveDevice(): RemovalDevice {
  if (preferredDevice) return preferredDevice;
  return supportsWebGpu() ? "gpu" : "cpu";
}

function buildConfig(
  device: RemovalDevice,
  onProgress?: RemoveBackgroundOptions["onProgress"],
): ImglyConfig {
  return {
    model: "isnet_quint8",
    device,
    debug: false,
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: onProgress
      ? (key, current, total) => onProgress({ key, current, total })
      : undefined,
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

function patchOrt(mod: { default?: OrtLike } | OrtLike) {
  const ort = (
    "default" in mod && mod.default ? mod.default : mod
  ) as OrtLike;
  if (!ort?.InferenceSession || patchedOrt.has(ort)) return;
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

  const create = ort.InferenceSession.create.bind(ort.InferenceSession);
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
  const { removeBackground } = await loadRemovalApi();
  await preloadBackgroundRemoval();

  const tryGpu = resolveDevice() === "gpu";

  if (tryGpu) {
    try {
      const blob = await removeBackground(
        source,
        buildConfig("gpu", options.onProgress),
      );
      preferredDevice = "gpu";
      markBackgroundModelPrepared();
      return blob;
    } catch {
      preferredDevice = "cpu";
      preloadPromise = null;
    }
  }

  const blob = await removeBackground(
    source,
    buildConfig("cpu", options.onProgress),
  );
  preferredDevice = "cpu";
  markBackgroundModelPrepared();
  return blob;
}
