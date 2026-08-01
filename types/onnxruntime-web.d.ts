declare module "onnxruntime-web" {
  export type TensorType = "float32" | "int32" | "int64" | "bool" | string;

  export class Tensor {
    readonly data: Float32Array | Int32Array | BigInt64Array | Uint8Array;
    readonly dims: readonly number[];
    readonly type: TensorType;

    constructor(
      type: TensorType,
      data: Float32Array | Int32Array | number[],
      dims?: readonly number[],
    );
  }

  export type InferenceSessionCreateOptions = {
    executionProviders?: Array<string | { name: string }>;
  };

  export interface InferenceSession {
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
    run(
      feeds: Record<string, Tensor>,
      options?: Record<string, unknown>,
    ): Promise<Record<string, Tensor>>;
  }

  export namespace InferenceSession {
    function create(
      uriOrBuffer: string | ArrayBuffer | Uint8Array,
      options?: InferenceSessionCreateOptions,
    ): Promise<InferenceSession>;
  }

  const ort: {
    Tensor: typeof Tensor;
    InferenceSession: typeof InferenceSession;
  };

  export default ort;
}
