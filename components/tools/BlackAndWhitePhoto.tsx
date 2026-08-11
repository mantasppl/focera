"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  BW_PRESETS,
  convertToBlackAndWhite,
  describeBwResult,
  downloadBlackAndWhiteImage,
  type BlackAndWhitePhotoResult,
  type BwStyle,
} from "@/lib/black-and-white-photo";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function BlackAndWhitePhoto() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const styleId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [style, setStyle] = useState<BwStyle>("classic");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<BlackAndWhitePhotoResult | null>(null);
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
      const converted = await convertToBlackAndWhite(sourceFile, {
        style,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(converted.blob);
      setResult(converted);
      setResultUrl(url);
      downloadBlackAndWhiteImage(converted.blob, sourceFile);
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
          : "Could not convert this photo. Try a smaller file or another browser.";
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
    downloadBlackAndWhiteImage(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid black-and-white-photo">
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

        <div className="black-and-white-photo__options">
          <div className="ui-field">
            <span className="ui-label" id={styleId}>
              Black &amp; white style
            </span>
            <div
              className="black-and-white-photo__chips"
              role="radiogroup"
              aria-labelledby={styleId}
            >
              {BW_PRESETS.map((preset) => {
                const selected = style === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "black-and-white-photo__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setStyle(preset.id)}
                  >
                    <span className="black-and-white-photo__chip-label">
                      {preset.label}
                    </span>
                    <span className="black-and-white-photo__chip-hint">
                      {preset.hint}
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
            {loading ? "Converting…" : "Make black & white"}
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
                {progressText || "Converting photo…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="black-and-white-photo__result">
              <p className="black-and-white-photo__result-meta">
                {describeBwResult(
                  result!.width,
                  result!.height,
                  result!.style,
                  result!.blob.size,
                )}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original photo"
                afterAlt="Black and white photo"
                hint="Drag the slider to compare the original and black & white photo."
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
                Choose a style and click Make black &amp; white.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a color photo to convert to black &amp; white here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Black & white conversion in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
