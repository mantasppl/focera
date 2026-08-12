"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import GifToMp4Dropzone from "@/components/tools/GifToMp4Dropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertGifToMp4,
  describeGifVideoMeta,
  describeGifVideoSize,
  downloadGifVideo,
  GIF_TO_MP4_QUALITY_PRESETS,
  GIF_TO_MP4_SIZE_PRESETS,
  type GifToMp4Quality,
  type GifToMp4Result,
  type GifToMp4Size,
} from "@/lib/gif-to-mp4";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function GifToMp4() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sizeId = useId();
  const qualityId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [size, setSize] = useState<GifToMp4Size>("medium");
  const [quality, setQuality] = useState<GifToMp4Quality>("medium");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<GifToMp4Result | null>(null);
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
      setError("Upload a GIF to get started.");
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
      const converted = await convertGifToMp4(sourceFile, {
        size,
        quality,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(converted.blob);
      setResult(converted);
      setResultUrl(url);
      downloadGifVideo(converted.blob, sourceFile, converted.extension);
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
          : "Could not convert this GIF. Try another file or browser.";
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
    downloadGifVideo(result.blob, sourceFile, result.extension);
  }

  return (
    <div className="tool-grid gif-to-mp4">
      <div className="tool-panel">
        <GifToMp4Dropzone
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

        <div className="gif-to-mp4__options">
          <div className="ui-field">
            <span className="ui-label" id={sizeId}>
              Output size
            </span>
            <div
              className="gif-to-mp4__chips"
              role="radiogroup"
              aria-labelledby={sizeId}
            >
              {GIF_TO_MP4_SIZE_PRESETS.map((preset) => {
                const selected = size === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "gif-to-mp4__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setSize(preset.id)}
                  >
                    <span className="gif-to-mp4__chip-label">
                      {preset.label}
                    </span>
                    <span className="gif-to-mp4__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={qualityId}>
              Video quality
            </span>
            <div
              className="gif-to-mp4__chips"
              role="radiogroup"
              aria-labelledby={qualityId}
            >
              {GIF_TO_MP4_QUALITY_PRESETS.map((preset) => {
                const selected = quality === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "gif-to-mp4__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setQuality(preset.id)}
                  >
                    <span className="gif-to-mp4__chip-label">
                      {preset.label}
                    </span>
                    <span className="gif-to-mp4__chip-hint">
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
            {loading ? "Converting…" : "Convert to video"}
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
                {progressText || "Converting GIF to video…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser. Keep this tab open.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="gif-to-mp4__success">
              <p className="gif-to-mp4__success-title">
                {result!.extension === "mp4" ? "MP4 ready" : "Video ready"}
              </p>
              <p className="gif-to-mp4__success-meta">
                {describeGifVideoMeta(
                  result!.width,
                  result!.height,
                  result!.originalWidth,
                  result!.originalHeight,
                  result!.durationSec,
                  result!.frameCount,
                  result!.extension,
                )}{" "}
                · {describeGifVideoSize(result!.originalSize, result!.videoSize)}
              </p>
              <ul className="gif-to-mp4__stats" aria-label="File sizes">
                <li>
                  <span className="gif-to-mp4__stat-label">GIF</span>
                  <span className="gif-to-mp4__stat-value">
                    {formatFileSize(result!.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="gif-to-mp4__stat-label">
                    {result!.extension.toUpperCase()}
                  </span>
                  <span className="gif-to-mp4__stat-value">
                    {formatFileSize(result!.videoSize)}
                  </span>
                </li>
                <li>
                  <span className="gif-to-mp4__stat-label">Frames</span>
                  <span className="gif-to-mp4__stat-value">
                    {result!.frameCount}
                  </span>
                </li>
              </ul>
              <video
                className="gif-to-mp4__preview"
                src={resultUrl}
                controls
                playsInline
                loop
                autoPlay
                muted
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="gif-to-mp4__preview"
                src={originalUrl}
                alt="Uploaded GIF preview"
              />
              <p className="tool-placeholder preview-single__hint">
                Choose options and click Convert to video.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload an animated GIF to convert it to video here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "GIFs up to 60 seconds · conversion runs in your browser · files never upload"}
        </p>
      </div>
    </div>
  );
}
