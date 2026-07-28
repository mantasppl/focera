"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import { formatFileSize } from "@/lib/image";
import {
  COMPRESS_IMAGE_PRESETS,
  OUTPUT_FORMAT_OPTIONS,
  compressImageFile,
  describeSavings,
  downloadCompressedImage,
  type CompressImageResult,
  type CompressLevel,
  type OutputFormat,
} from "@/lib/image-compressor";
import { cn } from "@/lib/utils";

export default function ImageCompressor() {
  const levelId = useId();
  const formatId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [format, setFormat] = useState<OutputFormat>("auto");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompressImageResult | null>(null);
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

  async function handleCompress() {
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
      const compressed = await compressImageFile(sourceFile, {
        level,
        format,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(compressed.blob);
      setResult(compressed);
      setResultUrl(url);
      downloadCompressedImage(
        compressed.blob,
        sourceFile,
        compressed.extension,
      );
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not compress this image. Try a smaller file or another browser.";
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
    downloadCompressedImage(result.blob, sourceFile, result.extension);
  }

  return (
    <div className="tool-grid image-compressor">
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

        <div className="image-compressor__options">
          <div className="ui-field">
            <span className="ui-label" id={levelId}>
              Compression level
            </span>
            <div
              className="image-compressor__chips image-compressor__chips--levels"
              role="radiogroup"
              aria-labelledby={levelId}
            >
              {COMPRESS_IMAGE_PRESETS.map((preset) => {
                const selected = level === preset.level;
                return (
                  <button
                    key={preset.level}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "image-compressor__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLevel(preset.level)}
                  >
                    <span className="image-compressor__chip-label">
                      {preset.label}
                    </span>
                    <span className="image-compressor__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={formatId}>
              Output format
            </span>
            <div
              className="image-compressor__chips"
              role="radiogroup"
              aria-labelledby={formatId}
            >
              {OUTPUT_FORMAT_OPTIONS.map((option) => {
                const selected = format === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "image-compressor__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setFormat(option.value)}
                  >
                    <span className="image-compressor__chip-label">
                      {option.label}
                    </span>
                    <span className="image-compressor__chip-hint">
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
            onClick={() => void handleCompress()}
            disabled={!hasSource || loading}
          >
            {loading ? "Compressing…" : "Compress image"}
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
                {progressText || "Compressing image…"}
              </span>
              <span className="tool-loading__subtext">
                Compression runs locally in your browser.
              </span>
            </div>
          ) : hasResult && originalUrl && resultUrl ? (
            <div className="image-compressor__success">
              <p className="image-compressor__success-title">
                Compressed image ready
              </p>
              <p className="image-compressor__success-meta">
                {result!.width}×{result!.height}
                {result!.width !== result!.originalWidth ||
                result!.height !== result!.originalHeight
                  ? ` (from ${result!.originalWidth}×${result!.originalHeight})`
                  : ""}{" "}
                · {result!.extension.toUpperCase()} ·{" "}
                {describeSavings(
                  result!.originalSize,
                  result!.compressedSize,
                  result!.savingsPercent,
                )}
              </p>
              <ul
                className="image-compressor__stats"
                aria-label="Size comparison"
              >
                <li>
                  <span className="image-compressor__stat-label">Original</span>
                  <span className="image-compressor__stat-value">
                    {formatFileSize(result!.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="image-compressor__stat-label">
                    Compressed
                  </span>
                  <span className="image-compressor__stat-value">
                    {formatFileSize(result!.compressedSize)}
                  </span>
                </li>
                <li>
                  <span className="image-compressor__stat-label">Saved</span>
                  <span
                    className={cn(
                      "image-compressor__stat-value",
                      result!.savingsPercent > 0 && "is-positive",
                      result!.savingsPercent < 0 && "is-muted",
                    )}
                  >
                    {result!.savingsPercent > 0
                      ? `${result!.savingsPercent}%`
                      : "—"}
                  </span>
                </li>
              </ul>
              <BeforeAfterPreview
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                beforeAlt="Original image"
                afterAlt="Compressed image"
                hint="Drag the slider to compare the original and compressed image."
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
                Choose a level and click Compress image.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an image to shrink its file size here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Image compression runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
