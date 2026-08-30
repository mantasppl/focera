"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  UNBLUR_PRESETS,
  downloadUnblurredImage,
  strengthLabel,
  unblurImageFile,
  type UnblurImageResult,
  type UnblurStrength,
} from "@/lib/unblur-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function UnblurImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const strengthId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [strength, setStrength] = useState<UnblurStrength>("medium");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnblurImageResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

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
    void runUnblur(file, strength);
  }

  function handleStrength(next: UnblurStrength) {
    if (next === strength) return;
    setStrength(next);
    if (sourceFile) {
      void runUnblur(sourceFile, next);
    }
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

  async function runUnblur(file: File, nextStrength: UnblurStrength) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const unblurred = await unblurImageFile(file, {
        strength: nextStrength,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(unblurred.blob);
      setResult(unblurred);
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
          : "Could not unblur this image. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownload() {
    if (!sourceFile || !result) return;
    downloadUnblurredImage(result.blob, sourceFile, result.strength);
  }

  return (
    <div className="tool-grid unblur-image">
      <div className="tool-panel">
        <ImageDropzone
          onFile={handleFile}
          onError={setError}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
            </p>
          </div>
        ) : null}

        <div className="unblur-image__options">
          <div className="ui-field">
            <span className="ui-label" id={strengthId}>
              Unblur strength
            </span>
            <div
              className="unblur-image__chips"
              role="radiogroup"
              aria-labelledby={strengthId}
            >
              {UNBLUR_PRESETS.map((preset) => {
                const selected = strength === preset.strength;
                return (
                  <button
                    key={preset.strength}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "unblur-image__chip",
                      selected && "is-active",
                    )}
                    onClick={() => handleStrength(preset.strength)}
                  >
                    <span className="unblur-image__chip-label">
                      {preset.label}
                    </span>
                    <span className="unblur-image__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          {hasResult ? (
            <Button onClick={handleDownload}>Download PNG</Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!hasSource && !hasResult}
          >
            Start over
          </Button>
        </div>

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
                {progressText || "Unblurring image…"}
              </span>
              <span className="tool-loading__subtext">
                Sharpening runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="unblur-image__result">
              <p className="unblur-image__result-meta">
                {result!.width}×{result!.height}
                {" · "}
                {strengthLabel(result!.strength)} unblur
                {" · "}
                {formatFileSize(result!.blob.size)}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original blurry image"
                afterAlt="Unblurred image"
                hint="Drag the slider to compare the original and unblurred image."
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
                Try another file, or pick a different strength.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a blurry image to sharpen it here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "Sharpen soft or blurry photos in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
