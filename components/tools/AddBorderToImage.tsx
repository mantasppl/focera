"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  BORDER_COLORS,
  BORDER_WIDTH_PRESETS,
  addBorderToImage,
  describeBorderResult,
  downloadBorderedImage,
  type AddBorderToImageResult,
  type BorderColorId,
  type BorderWidthId,
} from "@/lib/add-border-to-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function AddBorderToImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const widthId = useId();
  const colorId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [borderWidth, setBorderWidth] = useState<BorderWidthId>("medium");
  const [borderColor, setBorderColor] = useState<BorderColorId>("white");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddBorderToImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);

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
      setError("Upload a photo to get started.");
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
      const bordered = await addBorderToImage(sourceFile, {
        widthId: borderWidth,
        colorId: borderColor,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(bordered.blob);
      setResult(bordered);
      setResultUrl(url);
      downloadBorderedImage(bordered.blob, sourceFile);
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
          : "Could not add a border to this photo. Try a smaller file or another browser.";
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
    downloadBorderedImage(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid add-border-to-image">
      <div className="tool-panel">
        <ImageDropzone
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

        <div className="add-border-to-image__options">
          <div className="ui-field">
            <span className="ui-label" id={widthId}>
              Border width
            </span>
            <div
              className="add-border-to-image__chips"
              role="radiogroup"
              aria-labelledby={widthId}
            >
              {BORDER_WIDTH_PRESETS.map((preset) => {
                const selected = borderWidth === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-border-to-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setBorderWidth(preset.id)}
                  >
                    <span className="add-border-to-image__chip-label">
                      {preset.label}
                    </span>
                    <span className="add-border-to-image__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={colorId}>
              Border color
            </span>
            <div
              className="add-border-to-image__chips add-border-to-image__chips--colors"
              role="radiogroup"
              aria-labelledby={colorId}
            >
              {BORDER_COLORS.map((option) => {
                const selected = borderColor === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-border-to-image__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setBorderColor(option.value)}
                  >
                    <span className="add-border-to-image__chip-label">
                      {option.label}
                    </span>
                    <span className="add-border-to-image__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleConvert()}
            disabled={!hasSource || loading}
          >
            {loading ? "Adding border…" : "Add border"}
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
                {progressText || "Adding border…"}
              </span>
              <span className="tool-loading__subtext">
                Processing runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="add-border-to-image__result">
              <p className="add-border-to-image__result-meta">
                {describeBorderResult(
                  result!.width,
                  result!.height,
                  result!.borderPx,
                  result!.colorId,
                  result!.widthId,
                  result!.blob.size,
                )}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original photo"
                afterAlt="Photo with border"
                hint="Drag the slider to compare the original and bordered photo."
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Uploaded preview"
                className="preview-single__image"
              />
              <p className="tool-placeholder preview-single__hint">
                Choose width and color, then click Add border.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a photo to add a border here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Add a photo border in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
