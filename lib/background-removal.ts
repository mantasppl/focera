export type RemovalProgress = {
  key: string;
  current: number;
  total: number;
};

export type RemoveBackgroundOptions = {
  onProgress?: (progress: RemovalProgress) => void;
};

export async function removeImageBackground(
  source: Blob,
  options: RemoveBackgroundOptions = {},
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");

  return removeBackground(source, {
    model: "isnet_quint8",
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: options.onProgress
      ? (key, current, total) => options.onProgress?.({ key, current, total })
      : undefined,
  });
}
