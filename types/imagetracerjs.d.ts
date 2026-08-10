declare module "imagetracerjs" {
  type ImageTracerOptions = Record<string, unknown> | string;

  type ImageTracerApi = {
    imagedataToSVG: (
      imageData: ImageData,
      options?: ImageTracerOptions,
    ) => string;
    checkoptions: (options?: ImageTracerOptions) => Record<string, unknown>;
  };

  const ImageTracer: ImageTracerApi;
  export default ImageTracer;
}
