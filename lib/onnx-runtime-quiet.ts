type OrtLike = {
  env?: {
    debug?: boolean;
    logLevel?: string;
    wasm?: { numThreads?: number; proxy?: boolean };
  };
  InferenceSession: {
    create: (
      model: unknown,
      options?: Record<string, unknown>,
    ) => Promise<unknown>;
  };
};

const patchedOrt = new WeakSet<object>();
let onnxConsoleFilterInstalled = false;

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
      ort.env.wasm.proxy = false;
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

function supportsWebGpu(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|Android.+Mobile|webOS|BlackBerry/i.test(ua)) return false;
  if (/iPad|Android/i.test(ua)) return false;
  return "gpu" in navigator;
}

/** Load onnxruntime-web once with quiet logging and single-thread WASM. */
export async function ensureQuietOnnxRuntime(): Promise<void> {
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
    // onnxruntime-web may already be loaded through another tool.
  }
}
