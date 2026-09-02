"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import WebpToGifDropzone from "@/components/tools/WebpToGifDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertWebpToGif,
  describeWebpGifOutput,
  revokeWebpToGifResult,
  WEBP_TO_GIF_QUALITY_PRESETS,
  WEBP_TO_GIF_SIZE_PRESETS,
  type WebpToGifQuality,
  type WebpToGifResult,
  type WebpToGifSize,
} from "@/lib/webp-to-gif";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function WebpToGif() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sizeId = useId();
  const qualityId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<WebpToGifResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [size, setSize] = useState<WebpToGifSize>("medium");
  const [quality, setQuality] = useState<WebpToGifQuality>("medium");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<WebpToGifResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  const {
    formatOpen,
    setFormatOpen,
    downloading: formatDownloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () =>
      sourceFile ? `${fileBaseName(sourceFile)}-webp-to-gif` : null,
  });

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeWebpToGifResult(resultRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  function clearResult() {
    setResult((current) => {
      revokeWebpToGifResult(current);
      return null;
    });
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleConvert() {
    if (!sourceFile) {
      setError("Upload a WebP to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading WebP…");
    clearResult();

    try {
      const converted = await convertWebpToGif(sourceFile, {
        size,
        quality,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) {
        revokeWebpToGifResult(converted);
        return;
      }

      setResult(converted);
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
          : "Could not convert this WebP. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <ImageEditorShell
        className="video-to-gif"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Converting WebP…"}
        loadingSubtext="Conversion runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult && result
            ? describeWebpGifOutput(result)
            : hasSource
              ? sourceFile?.name
              : "Upload a WebP to start"
        }
        previewHint={
          hasSource && !hasResult ? "Click Convert to GIF" : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Animated or still WebP · conversion runs in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <WebpToGifDropzone
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

            <div className="video-to-gif__options">
              <div className="ui-field">
                <span className="ui-label" id={sizeId}>
                  Output size
                </span>
                <div
                  className="video-to-gif__chips"
                  role="radiogroup"
                  aria-labelledby={sizeId}
                >
                  {WEBP_TO_GIF_SIZE_PRESETS.map((preset) => {
                    const selected = size === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "video-to-gif__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => {
                          setSize(preset.id);
                          clearResult();
                        }}
                      >
                        <span className="video-to-gif__chip-label">
                          {preset.label}
                        </span>
                        <span className="video-to-gif__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={qualityId}>
                  Color quality
                </span>
                <div
                  className="video-to-gif__chips"
                  role="radiogroup"
                  aria-labelledby={qualityId}
                >
                  {WEBP_TO_GIF_QUALITY_PRESETS.map((preset) => {
                    const selected = quality === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "video-to-gif__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => {
                          setQuality(preset.id);
                          clearResult();
                        }}
                      >
                        <span className="video-to-gif__chip-label">
                          {preset.label}
                        </span>
                        <span className="video-to-gif__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleConvert()}
                disabled={!hasSource || loading}
              >
                {loading ? "Converting…" : "Convert to GIF"}
              </Button>
              {hasResult ? (
                <Button
                  onClick={openDownload}
                  disabled={loading || formatDownloading}
                >
                  Download
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
        {hasResult && result ? (
          <div className="image-editor-shell__result video-to-gif__success">
            <p className="image-editor-shell__result-meta video-to-gif__success-meta">
              {describeWebpGifOutput(result)}
            </p>
            <ul className="video-to-gif__stats" aria-label="Conversion summary">
              <li>
                <span className="video-to-gif__stat-label">Frames</span>
                <span className="video-to-gif__stat-value">
                  {result.frameCount}
                </span>
              </li>
              <li>
                <span className="video-to-gif__stat-label">WebP</span>
                <span className="video-to-gif__stat-value">
                  {formatFileSize(result.originalSize)}
                </span>
              </li>
              <li>
                <span className="video-to-gif__stat-label">GIF</span>
                <span className="video-to-gif__stat-value">
                  {formatFileSize(result.gifSize)}
                </span>
              </li>
            </ul>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="video-to-gif__preview"
              src={result.url}
              alt="Converted GIF preview"
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="video-to-gif__preview"
              src={originalUrl}
              alt="Uploaded WebP preview"
            />
            <p className="tool-placeholder preview-single__hint">
              Choose options and click Convert to GIF.
            </p>
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
