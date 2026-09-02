"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  FLIP_DIRECTION_PRESETS,
  describeFlip,
  flipImageFile,
  flipScale,
  readImageDimensions,
  type FlipDirection,
  type FlipImageResult,
} from "@/lib/flip-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function FlipImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const directionGroupId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [direction, setDirection] = useState<FlipDirection>("horizontal");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlipImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && originalWidth);
  const hasResult = Boolean(result && resultUrl);
  const previewScale = flipScale(direction);
  const previewStyle = {
    transform: `scaleX(${previewScale.scaleX}) scaleY(${previewScale.scaleY})`,
  } satisfies CSSProperties;

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
        ? `${fileBaseName(sourceFile)}-flipped-${result.direction}`
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
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not read image dimensions.";
      setError(message);
      setOriginalWidth(0);
      setOriginalHeight(0);
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
    setDirection("horizontal");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  function handleDirection(next: FlipDirection) {
    setDirection(next);
    if (result) clearResult();
  }

  async function handleFlip() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
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
      const flipped = await flipImageFile(sourceFile, {
        direction,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(flipped.blob);
      setResult(flipped);
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
          : "Could not flip this image. Try another file or browser.";
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
        className="flip-image"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Flipping image…"}
        loadingSubtext="The flip runs locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${describeFlip(result!.direction)} · ${result!.width}×${result!.height} px`
            : hasSource
              ? `${originalWidth}×${originalHeight} px`
              : "Upload an image to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Choose direction and click Flip image"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Mirror photos in your browser · files never upload to Focera"
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

            <div className="flip-image__options">
              <div className="ui-field">
                <span className="ui-label" id={directionGroupId}>
                  Flip direction
                </span>
                <div
                  className="flip-image__chips"
                  role="group"
                  aria-labelledby={directionGroupId}
                >
                  {FLIP_DIRECTION_PRESETS.map((preset) => {
                    const selected = direction === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={cn(
                          "flip-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading || !hasSource}
                        onClick={() => handleDirection(preset.id)}
                      >
                        <span className="flip-image__chip-label">
                          {preset.label}
                        </span>
                        <span className="flip-image__chip-hint">
                          {preset.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="ui-hint">
                  Preview updates instantly. Export writes a PNG with pixels
                  flipped.
                </p>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => void handleFlip()}
                disabled={!hasSource || loading}
              >
                {loading ? "Flipping…" : "Flip image"}
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
          <div className="image-editor-shell__result flip-image__result">
            <p className="image-editor-shell__result-meta flip-image__result-meta">
              {describeFlip(result!.direction)}
              {" · "}
              {result!.width}×{result!.height}
              {" · "}
              {formatFileSize(result!.blob.size)}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original image"
              afterAlt="Flipped image"
              hint="Drag the slider to compare the original and flipped image."
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="image-editor-shell__preview-content preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Live flip preview"
              className="preview-single__image flip-image__preview-image"
              style={previewStyle}
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
