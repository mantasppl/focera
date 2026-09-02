"use client";

import { useCallback, useState } from "react";
import {
  downloadImageInFormat,
  type ImageDownloadFormat,
} from "@/lib/image-download-formats";

type UseImageFormatDownloadOptions = {
  getFilename: () => string | null;
  getBlob: () => Blob | null;
};

export function useImageFormatDownload({
  getFilename,
  getBlob,
}: UseImageFormatDownloadOptions) {
  const [formatOpen, setFormatOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const openDownload = useCallback(() => {
    setDownloadError("");
    setFormatOpen(true);
  }, []);

  const handleFormat = useCallback(
    async (format: ImageDownloadFormat) => {
      const blob = getBlob();
      const filename = getFilename();
      if (!blob || !filename || downloading) return;

      setDownloading(true);
      setDownloadError("");
      try {
        await downloadImageInFormat(blob, filename, format);
        setFormatOpen(false);
      } catch {
        setDownloadError("Could not export this format. Try PNG instead.");
      } finally {
        setDownloading(false);
      }
    },
    [downloading, getBlob, getFilename],
  );

  return {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  };
}
