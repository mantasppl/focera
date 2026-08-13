"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import WebpToGifDropzone from "@/components/tools/WebpToGifDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertWebpToGif,
  describeWebpGifOutput,
  downloadWebpGif,
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
      downloadWebpGif(converted, sourceFile);
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

  function handleDownloadAgain() {
    if (!sourceFile || !result) return;
    downloadWebpGif(result, sourceFile);
  }

  return (
    <div className="tool-grid video-to-gif">
      <div className="tool-panel">
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

        <div className="tool-actions">
          <Button
            onClick={() => void handleConvert()}
            disabled={!hasSource || loading}
          >
            {loading ? "Converting…" : "Convert to GIF"}
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
                {progressText || "Converting WebP…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="video-to-gif__success">
              <p className="video-to-gif__success-title">GIF ready</p>
              <p className="video-to-gif__success-meta">
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
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Convert again anytime.
              </p>
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
          ) : (
            <p className="tool-placeholder">
              Upload a WebP image to convert it to GIF
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Animated or still WebP · conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
