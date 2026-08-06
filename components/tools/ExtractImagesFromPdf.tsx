"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  downloadAllExtractedImagesZip,
  downloadExtractedImage,
  extractImagesFromPdf,
  extractImagesFromPdfLimitsHint,
  revokeExtractedImages,
  type ExtractedImage,
} from "@/lib/extract-images-from-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ExtractImagesFromPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const abortRef = useRef<AbortController | null>(null);
  const imagesRef = useRef<ExtractedImage[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasImages = images.length > 0;
  const activeImage =
    images.find((image) => image.index === selectedIndex) ?? images[0] ?? null;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeExtractedImages(imagesRef.current);
    };
  }, []);

  function clearImages() {
    setImages((current) => {
      revokeExtractedImages(current);
      return [];
    });
    setSelectedIndex(1);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearImages();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearImages();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
  }

  async function handleExtract() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PDF…");
    clearImages();

    try {
      const extracted = await extractImagesFromPdf(sourceFile, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Scanning page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokeExtractedImages(extracted);
        return;
      }

      setImages(extracted);
      setSelectedIndex(extracted[0]?.index ?? 1);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not extract images from this PDF. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadImage() {
    if (!sourceFile || !activeImage) return;
    downloadExtractedImage(activeImage, fileBaseName(sourceFile));
  }

  async function handleDownloadAll() {
    if (!sourceFile || !hasImages) return;
    setZipping(true);
    setError("");
    try {
      await downloadAllExtractedImagesZip(images, fileBaseName(sourceFile));
    } catch {
      setError(
        "Could not create the ZIP download. Try downloading images one by one.",
      );
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="tool-grid extract-images-from-pdf">
      <div className="tool-panel">
        <PdfDropzone
          onFile={handleFile}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
            </p>
          </div>
        ) : null}

        <div className="tool-actions">
          <Button
            onClick={() => void handleExtract()}
            disabled={!hasSource || loading}
          >
            {loading ? "Extracting…" : "Extract images"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasImages) || loading}
          >
            Start over
          </Button>
        </div>

        {hasImages ? (
          <div className="tool-actions">
            <Button
              onClick={handleDownloadImage}
              disabled={!activeImage || zipping}
            >
              Download image
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleDownloadAll()}
              disabled={zipping}
            >
              {zipping ? "Preparing ZIP…" : "Download all (ZIP)"}
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div
          className={`tool-stage${hasImages ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Extracting images…"}
              </span>
              <span className="tool-loading__subtext">
                Embedded images are pulled locally in your browser.
              </span>
            </div>
          ) : activeImage ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={`Extracted image ${activeImage.index}`}
                className="preview-single__image extract-images-from-pdf__preview-image"
              />
              <p className="tool-placeholder preview-single__hint">
                Image {activeImage.index} of {images.length} · page{" "}
                {activeImage.pageNumber} · {activeImage.width}×
                {activeImage.height}px · {formatFileSize(activeImage.blob.size)}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and extract to preview embedded images here
            </p>
          )}
        </div>

        {hasImages ? (
          <div
            className="extract-images-from-pdf__thumbs"
            role="list"
            aria-label="Extracted images"
          >
            {images.map((image) => {
              const selected = image.index === activeImage?.index;
              return (
                <button
                  key={image.id}
                  type="button"
                  role="listitem"
                  className={cn(
                    "extract-images-from-pdf__thumb",
                    selected && "is-active",
                  )}
                  onClick={() => setSelectedIndex(image.index)}
                  aria-pressed={selected}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    className="extract-images-from-pdf__thumb-image"
                  />
                  <span className="extract-images-from-pdf__thumb-label">
                    #{image.index}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="tool-hint">
          {hasImages
            ? `${images.length} image${images.length === 1 ? "" : "s"} found · download one or a ZIP · processed locally`
            : `${extractImagesFromPdfLimitsHint()} · private & local`}
        </p>
      </div>
    </div>
  );
}
