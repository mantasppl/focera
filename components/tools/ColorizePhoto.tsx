"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  COLORIZE_PRESETS,
  colorizePhotoFile,
  describeColorizeResult,
  downloadColorizedImage,
  type ColorizePhotoResult,
  type ColorizeStrength,
} from "@/lib/colorize-photo";
import { cn } from "@/lib/utils";

export default function ColorizePhoto() {
  const strengthId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [strength, setStrength] = useState<ColorizeStrength>("natural");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ColorizePhotoResult | null>(null);
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

  async function handleColorize() {
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
      const colorized = await colorizePhotoFile(sourceFile, {
        strength,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(colorized.blob);
      setResult(colorized);
      setResultUrl(url);
      downloadColorizedImage(colorized.blob, sourceFile);
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not colorize this photo. Try a smaller file or another browser.";
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
    downloadColorizedImage(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid colorize-photo">
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

        <div className="colorize-photo__options">
          <div className="ui-field">
            <span className="ui-label" id={strengthId}>
              Color strength
            </span>
            <div
              className="colorize-photo__chips"
              role="radiogroup"
              aria-labelledby={strengthId}
            >
              {COLORIZE_PRESETS.map((preset) => {
                const selected = strength === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "colorize-photo__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setStrength(preset.id)}
                  >
                    <span className="colorize-photo__chip-label">
                      {preset.label}
                    </span>
                    <span className="colorize-photo__chip-hint">
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
            onClick={() => void handleColorize()}
            disabled={!hasSource || loading}
          >
            {loading ? "Colorizing…" : "Colorize photo"}
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
                {progressText || "Colorizing photo…"}
              </span>
              <span className="tool-loading__subtext">
                AI colorization runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="colorize-photo__result">
              <p className="colorize-photo__result-meta">
                {describeColorizeResult(
                  result!.width,
                  result!.height,
                  result!.strength,
                )}
                {" · "}
                {formatFileSize(result!.blob.size)}
              </p>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original photo"
                afterAlt="Colorized photo"
                hint="Drag the slider to compare the original and colorized photo."
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
                Choose a strength and click Colorize photo.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a black &amp; white photo to add color here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "AI colorization in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
