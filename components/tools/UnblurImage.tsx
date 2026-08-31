"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import EnhancingPreview from "@/components/tools/EnhancingPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { useMobilePreviewReveal } from "@/components/tools/useMobilePreviewReveal";
import { formatFileSize } from "@/lib/image";
import {
  UNBLUR_PRESETS,
  downloadUnblurredImage,
  strengthLabel,
  unblurImageFile,
  type UnblurImageResult,
  type UnblurStrength,
} from "@/lib/unblur-image";
import {
  UNBLUR_FIRST_RUN_HINT,
  hasPreparedUnblurModel,
} from "@/lib/unblur-ai";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

function unblurHudProgress(text: string): number {
  const value = text.toLowerCase();
  if (value.includes("export")) return 90;
  if (value.includes("blend")) return 84;
  if (value.includes("enhancing")) {
    const parts = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (parts) {
      const current = Number(parts[1]);
      const total = Number(parts[2]);
      if (total > 0) return Math.min(82, 40 + Math.round((current / total) * 40));
    }
    return 48;
  }
  if (value.includes("preparing ai") || value.includes("loading ai")) return 34;
  if (value.includes("download")) {
    const percent = Number(text.replace(/[^\d]/g, ""));
    if (Number.isFinite(percent) && percent > 0) {
      return Math.min(32, 8 + Math.round(percent * 0.24));
    }
    return 12;
  }
  if (value.includes("sharpen") || value.includes("unavailable")) return 42;
  if (value.includes("refin")) return 72;
  if (value.includes("prepar")) return 18;
  if (value.includes("load")) return 8;
  return 6;
}

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
  const showPreviewFirst = loading || hasResult || hasSource;
  const previewRef = useMobilePreviewReveal(loading);

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
    <div className={cn("tool-grid unblur-image", showPreviewFirst && "is-preview-first")}>
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

      <div className="tool-panel tool-panel--preview" ref={previewRef}>
        <div
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading && originalUrl ? (
            <EnhancingPreview
              key={`${originalUrl}-${strength}`}
              src={originalUrl}
              alt="Uploaded photo being unblurred"
              label="Unblurring photo"
              reportedProgress={unblurHudProgress(progressText)}
            />
          ) : loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Unblurring image…"}
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="unblur-image__result">
              <p className="unblur-image__result-meta">
                {result!.width}×{result!.height}
                {" · "}
                {strengthLabel(result!.strength)}
                {result!.engine === "ai" ? " AI unblur" : " unblur"}
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
          {loading
            ? progressText || "Unblurring your photo…"
            : hasResult
              ? result?.engine === "sharpen"
                ? "AI model unavailable — used a local sharpen pass · processed locally"
                : "Download when you are ready · AI ran locally in your browser"
              : hasPreparedUnblurModel()
                ? "AI unblur in your browser · files never upload to Focera"
                : UNBLUR_FIRST_RUN_HINT}
        </p>
      </div>
    </div>
  );
}
