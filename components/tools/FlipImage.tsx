"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  FLIP_DIRECTION_PRESETS,
  describeFlip,
  downloadFlippedImage,
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
      downloadFlippedImage(flipped.blob, sourceFile, flipped.direction);
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

  function handleDownloadAgain() {
    if (!sourceFile || !result) return;
    downloadFlippedImage(result.blob, sourceFile, result.direction);
  }

  return (
    <div className="tool-grid flip-image">
      <div className="tool-panel">
        <ImageDropzone
          onFile={(file) => void handleFile(file)}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
              {originalWidth
                ? ` · ${originalWidth}×${originalHeight} px`
                : ""}
            </p>
          </div>
        ) : null}

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

        <div className="tool-actions">
          <Button
            onClick={() => void handleFlip()}
            disabled={!hasSource || loading}
          >
            {loading ? "Flipping…" : "Flip image"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || loading}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadAgain}>Download again</Button>
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Flipping image…"}
              </span>
              <span className="tool-loading__subtext">
                The flip runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="flip-image__result">
              <p className="flip-image__result-meta">
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
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Live flip preview"
                className="preview-single__image flip-image__preview-image"
                style={previewStyle}
              />
              <p className="tool-placeholder preview-single__hint">
                {describeFlip(direction)}. Click Flip image to download a PNG.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to flip it here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Mirror photos in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
