"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import JpgToTiffDropzone from "@/components/tools/JpgToTiffDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertJpgToTiff,
  describeJpgTiffOutput,
  downloadJpgTiffResult,
  MAX_JPG_FILES,
  revokeJpgToTiffResult,
  type JpgToTiffResult,
} from "@/lib/jpg-to-tiff";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};


function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function JpgToTiff() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<JpgToTiffResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<JpgToTiffResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const hasSource = fileCount > 0;
  const hasResult = Boolean(result);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const activeImage =
    result?.images.find((image) => image.id === selectedId) ??
    result?.images[0] ??
    null;

  const {
    formatOpen,
    setFormatOpen,
    downloading: formatDownloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => activeImage?.blob ?? null,
    getFilename: () =>
      activeImage ? (activeImage.sourceName.replace(/\.[^.]+$/, "") || "image") : null,
  });

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeJpgToTiffResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokeJpgToTiffResult(current);
      return null;
    });
    setSelectedId(null);
  }

  function handleAddFiles(incoming: File[]) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setEntries((current) => [...current, ...createEntries(incoming)]);
  }

  function handleRemove(id: string) {
    clearResult();
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setEntries([]);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
  }

  async function handleConvert() {
    if (fileCount === 0) {
      setError("Upload at least one JPG to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading JPG…");
    clearResult();

    try {
      const converted = await convertJpgToTiff(files, {
        signal: controller.signal,
        onProgress: (current, total, fileName) => {
          setProgressText(`Converting ${current} of ${total}: ${fileName}`);
        },
      });

      if (controller.signal.aborted) {
        revokeJpgToTiffResult(converted);
        return;
      }

      setResult(converted);
      setSelectedId(converted.images[0]?.id ?? null);
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
          : "Could not convert these JPG files. Try fewer or smaller images.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  async function handleDownloadZip() {
    if (!result || fileCount === 0) return;
    setZipping(true);
    setError("");
    try {
      await downloadJpgTiffResult(result, files);
    } catch {
      setError("Could not create the download. Try downloading images one by one.");
    } finally {
      setZipping(false);
    }
  }

  return (
    <>
      <ImageEditorShell
        className="heic-to-jpg"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Converting JPG…"}
        loadingSubtext="Conversion runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult && result
            ? `${describeJpgTiffOutput(result)}`
            : hasSource
              ? `${fileCount} file${fileCount === 1 ? "" : "s"} queued`
              : "Upload images to start"
        }
        previewHint={
          hasSource && !hasResult ? "Click Convert to TIFF" : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "JPG to TIFF runs in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <JpgToTiffDropzone
              existingFiles={files}
              onFiles={handleAddFiles}
              onError={setError}
              disabled={loading || fileCount >= MAX_JPG_FILES}
            />

            {fileCount > 0 ? (
              <div className="png-to-pdf__list-wrap">
                <div className="png-to-pdf__list-header">
                  <p className="png-to-pdf__list-title" id={listId}>
                    Queued files ({fileCount})
                  </p>
                  <p className="png-to-pdf__list-meta">
                    {formatFileSize(totalBytes)} total
                  </p>
                </div>
                <ol className="png-to-pdf__list" aria-labelledby={listId}>
                  {entries.map((entry) => (
                    <li key={entry.id} className="png-to-pdf__item">
                      <div className="png-to-pdf__file">
                        <p className="png-to-pdf__name">{entry.file.name}</p>
                        <p className="png-to-pdf__size">
                          {formatFileSize(entry.file.size)}
                        </p>
                      </div>
                      <div className="png-to-pdf__item-actions">
                        <button
                          type="button"
                          className={cn(
                            "png-to-pdf__icon-btn",
                            "png-to-pdf__icon-btn--danger",
                          )}
                          aria-label={`Remove ${entry.file.name}`}
                          disabled={loading}
                          onClick={() => handleRemove(entry.id)}
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleConvert()}
                disabled={!hasSource || loading}
              >
                {loading ? "Converting…" : "Convert to TIFF"}
              </Button>
              {hasResult ? (
                <Button
                  onClick={openDownload}
                  disabled={loading || !activeImage || formatDownloading}
                >
                  Download
                </Button>
              ) : null}
              {hasResult && result && result.images.length > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => void handleDownloadZip()}
                  disabled={zipping || loading}
                >
                  {zipping ? "Preparing…" : "Download all as ZIP"}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={(!hasSource && !hasResult) || loading}
              >
                Start over
              </Button>
            </div>
            {error ? (
              <p className="tool-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        }
      >
        {hasResult && result && activeImage ? (
          <div className="image-editor-shell__result png-to-pdf__success">
            <p className="image-editor-shell__result-meta png-to-pdf__success-meta">
              {describeJpgTiffOutput(result)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={`Converted ${activeImage.sourceName}`}
              className="pdf-to-jpg__preview-image"
            />
            {result.images.length > 1 ? (
              <div
                className="pdf-to-jpg__thumbs"
                role="radiogroup"
                aria-label="Converted images"
              >
                {result.images.map((image, index) => {
                  const selected = image.id === activeImage.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "pdf-to-jpg__thumb",
                        selected && "is-active",
                      )}
                      aria-label={`Show ${image.sourceName}`}
                      onClick={() => setSelectedId(image.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt=""
                        className="pdf-to-jpg__thumb-image"
                      />
                      <span className="pdf-to-jpg__thumb-label">
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            <ul className="png-to-pdf__stats" aria-label="Conversion summary">
              <li>
                <span className="png-to-pdf__stat-label">JPG files</span>
                <span className="png-to-pdf__stat-value">
                  {result.images.length}
                </span>
              </li>
              <li>
                <span className="png-to-pdf__stat-label">Original</span>
                <span className="png-to-pdf__stat-value">
                  {formatFileSize(result.originalSize)}
                </span>
              </li>
              <li>
                <span className="png-to-pdf__stat-label">TIFF size</span>
                <span className="png-to-pdf__stat-value">
                  {formatFileSize(result.outputSize)}
                </span>
              </li>
            </ul>
          </div>
        ) : hasSource ? (
          <div className="png-to-pdf__empty">
            <p className="tool-placeholder">
              {`${fileCount} JPG file${fileCount === 1 ? "" : "s"} queued · click Convert to TIFF`}
            </p>
            <ul className="png-to-pdf__summary" aria-label={`Queued JPG files`}>
              {entries.map((entry, index) => (
                <li key={entry.id}>
                  {index + 1}. {entry.file.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={formatDownloading}
        error={downloadError}
      />
    </>
  );
}
