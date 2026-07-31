declare module "gifenc" {
  export type GifPalette = number[][];

  export type QuantizeOptions = {
    format?: "rgb565" | "rgb444" | "rgba4444";
    oneBitAlpha?: boolean | number;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  };

  export type GifEncoderOptions = {
    auto?: boolean;
    initialCapacity?: number;
  };

  export type WriteFrameOptions = {
    palette?: GifPalette;
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  };

  export type GifEncoder = {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      opts?: WriteFrameOptions,
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
    bytesView: () => Uint8Array;
    writeHeader: () => void;
    reset: () => void;
    buffer: ArrayBuffer;
  };

  export function GIFEncoder(opts?: GifEncoderOptions): GifEncoder;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): GifPalette;
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: GifPalette,
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
