"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  MAX_OUTPUT_DIMENSION,
  MIN_OUTPUT_DIMENSION,
  RESIZE_SCALE_PRESETS,
  clampDimension,
  describeDimensions,
  dimensionsFromPercent,
  pairedHeight,
  pairedWidth,
  readImageDimensions,
  resizeImageFile,
  type ResizeImageResult,
} from "@/lib/resize-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ResizeImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const widthId = useId();
  const heightId = useId();
  const scaleId = useId();
  const lockId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResizeImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const widthNum = Number(width);
  const heightNum = Number(height);
  const dimensionsValid =
    Number.isFinite(widthNum) &&
    Number.isFinite(heightNum) &&
    widthNum >= MIN_OUTPUT_DIMENSION &&
    heightNum >= MIN_OUTPUT_DIMENSION &&
    widthNum <= MAX_OUTPUT_DIMENSION &&
    heightNum <= MAX_OUTPUT_DIMENSION;

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () =>
      sourceFile && result
        ? `${fileBaseName(sourceFile)}-resized-${result.width}x${result.height}`
        : null,
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl("");
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));

    try {
      const dims = await readImageDimensions(file);
      setOriginalWidth(dims.width);
      setOriginalHeight(dims.height);
      setWidth(String(dims.width));
      setHeight(String(dims.height));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read image dimensions.";
      setError(message);
      setOriginalWidth(0);
      setOriginalHeight(0);
      setWidth("");
      setHeight("");
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth("");
    setHeight("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  function handleWidthChange(value: string) {
    setWidth(value);
    if (!lockAspect || !originalWidth || !originalHeight) return;
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    setHeight(String(pairedHeight(next, originalWidth, originalHeight)));
  }

  function handleHeightChange(value: string) {
    setHeight(value);
    if (!lockAspect || !originalWidth || !originalHeight) return;
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    setWidth(String(pairedWidth(next, originalWidth, originalHeight)));
  }

  function handleScalePreset(percent: number) {
    if (!originalWidth || !originalHeight) return;
    const dims = dimensionsFromPercent(
      originalWidth,
      originalHeight,
      percent,
    );
    setWidth(String(dims.width));
    setHeight(String(dims.height));
  }

  function handleLockToggle(checked: boolean) {
    setLockAspect(checked);
    if (!checked || !originalWidth || !originalHeight) return;
    const nextWidth = Number(width);
    if (Number.isFinite(nextWidth) && nextWidth > 0) {
      setHeight(
        String(pairedHeight(nextWidth, originalWidth, originalHeight)),
      );
    }
  }

  async function handleResize() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }
    if (!dimensionsValid) {
      setError(
        `Enter width and height between ${MIN_OUTPUT_DIMENSION} and ${MAX_OUTPUT_DIMENSION} px.`,
      );
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const resized = await resizeImageFile(sourceFile, {
        width: clampDimension(widthNum),
        height: clampDimension(heightNum),
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(resized.blob);
      setResult(resized);
      setResultUrl(url);
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
          : "Could not resize this image. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  const activeScalePercent =
    originalWidth && widthNum > 0
      ? Math.round((widthNum / originalWidth) * 100)
      : null;

  return (
    <>
      <ImageEditorShell
        className="resize-image"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Resizing image…"}
        loadingSubtext="Dimension changes run locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? describeDimensions(
                result!.originalWidth,
                result!.originalHeight,
                result!.width,
                result!.height,
              )
            : hasSource
              ? `${originalWidth}×${originalHeight} px`
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Set dimensions and click Resize image"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Exact pixel resize in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone
                onFile={(file) => void handleFile(file)}
                onError={setError}
                disabled={loading}
              />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                width={originalWidth}
                height={originalHeight}
                disabled={loading}
                onReplace={(file) => void handleFile(file)}
              />
            )}

            <div className="resize-image__options">
              <div className="resize-image__dims">
                <div className="ui-field">
                  <label className="ui-label" htmlFor={widthId}>
                    Width (px)
                  </label>
                  <input
                    id={widthId}
                    className="ui-input"
                    type="number"
                    min={MIN_OUTPUT_DIMENSION}
                    max={MAX_OUTPUT_DIMENSION}
                    step={1}
                    inputMode="numeric"
                    value={width}
                    disabled={loading || !hasSource}
                    onChange={(event) => handleWidthChange(event.target.value)}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor={heightId}>
                    Height (px)
                  </label>
                  <input
                    id={heightId}
                    className="ui-input"
                    type="number"
                    min={MIN_OUTPUT_DIMENSION}
                    max={MAX_OUTPUT_DIMENSION}
                    step={1}
                    inputMode="numeric"
                    value={height}
                    disabled={loading || !hasSource}
                    onChange={(event) =>
                      handleHeightChange(event.target.value)
                    }
                  />
                </div>
              </div>

              <label className="resize-image__lock" htmlFor={lockId}>
                <input
                  id={lockId}
                  type="checkbox"
                  checked={lockAspect}
                  disabled={loading || !hasSource}
                  onChange={(event) => handleLockToggle(event.target.checked)}
                />
                <span>
                  <span className="resize-image__lock-title">
                    Lock aspect ratio
                  </span>
                  <span className="resize-image__lock-hint">
                    Keep original proportions when you change width or height
                  </span>
                </span>
              </label>

              <div className="ui-field">
                <span className="ui-label" id={scaleId}>
                  Quick scale
                </span>
                <div
                  className="resize-image__chips"
                  role="group"
                  aria-labelledby={scaleId}
                >
                  {RESIZE_SCALE_PRESETS.map((preset) => {
                    const selected = activeScalePercent === preset.percent;
                    return (
                      <button
                        key={preset.percent}
                        type="button"
                        className={cn(
                          "resize-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading || !hasSource}
                        onClick={() => handleScalePreset(preset.percent)}
                      >
                        <span className="resize-image__chip-label">
                          {preset.label}
                        </span>
                        <span className="resize-image__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="ui-hint">
                  Max output {MAX_OUTPUT_DIMENSION}px on either side.
                </p>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleResize()}
                disabled={!hasSource || loading || !dimensionsValid}
              >
                {loading ? "Resizing…" : "Resize image"}
              </Button>
              {hasResult ? (
                <Button onClick={openDownload} disabled={loading}>
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
        {hasResult && originalUrl && resultUrl ? (
          <div className="image-editor-shell__result resize-image__result">
            <p className="image-editor-shell__result-meta resize-image__result-meta">
              {describeDimensions(
                result!.originalWidth,
                result!.originalHeight,
                result!.width,
                result!.height,
              )}
              {" · "}
              {formatFileSize(result!.blob.size)}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Resized image"
              hint="Drag the slider to compare the original and resized image."
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="image-editor-shell__preview-content preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Uploaded preview"
              className="preview-single__image"
            />
          </div>
        ) : null}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={downloading}
        error={downloadError}
      />
    </>
  );
}
