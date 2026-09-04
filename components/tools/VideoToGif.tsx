"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import VideoDropzone from "@/components/tools/VideoDropzone";
import { formatVideoFileSize } from "@/lib/video-caption";
import {
  convertVideoToGif,
  describeGifMeta,
  describeGifSize,
  downloadGif,
  VIDEO_TO_GIF_FPS_PRESETS,
  VIDEO_TO_GIF_QUALITY_PRESETS,
  VIDEO_TO_GIF_SIZE_PRESETS,
  type VideoToGifFps,
  type VideoToGifQuality,
  type VideoToGifResult,
  type VideoToGifSize,
} from "@/lib/video-to-gif";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function VideoToGif() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sizeId = useId();
  const fpsId = useId();
  const qualityId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [size, setSize] = useState<VideoToGifSize>("medium");
  const [fps, setFps] = useState<VideoToGifFps>(10);
  const [quality, setQuality] = useState<VideoToGifQuality>("medium");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<VideoToGifResult | null>(null);
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
      setError("Upload a video to get started.");
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
      const converted = await convertVideoToGif(sourceFile, {
        size,
        fps,
        quality,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(converted.blob);
      setResult(converted);
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
          : "Could not convert this video. Try a shorter clip or another browser.";
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
    downloadGif(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid video-to-gif">
      <div className="tool-panel">
        <VideoDropzone
          onFile={handleFile}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatVideoFileSize(sourceFile.size) : ""}
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
              {VIDEO_TO_GIF_SIZE_PRESETS.map((preset) => {
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
                    onClick={() => setSize(preset.id)}
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
            <span className="ui-label" id={fpsId}>
              Frame rate
            </span>
            <div
              className="video-to-gif__chips"
              role="radiogroup"
              aria-labelledby={fpsId}
            >
              {VIDEO_TO_GIF_FPS_PRESETS.map((preset) => {
                const selected = fps === preset.id;
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
                    onClick={() => setFps(preset.id)}
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
              {VIDEO_TO_GIF_QUALITY_PRESETS.map((preset) => {
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
                    onClick={() => setQuality(preset.id)}
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
            <Button onClick={handleDownloadAgain}>Download</Button>
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
                {progressText || "Converting to GIF…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser. Keep this tab open.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="video-to-gif__success">
              <p className="video-to-gif__success-title">GIF ready</p>
              <p className="video-to-gif__success-meta">
                {describeGifMeta(
                  result!.width,
                  result!.height,
                  result!.originalWidth,
                  result!.originalHeight,
                  result!.durationSec,
                  result!.fps,
                  result!.frameCount,
                )}{" "}
                · {describeGifSize(result!.originalSize, result!.gifSize)}
              </p>
              <ul className="video-to-gif__stats" aria-label="File sizes">
                <li>
                  <span className="video-to-gif__stat-label">Video</span>
                  <span className="video-to-gif__stat-value">
                    {formatVideoFileSize(result!.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="video-to-gif__stat-label">GIF</span>
                  <span className="video-to-gif__stat-value">
                    {formatVideoFileSize(result!.gifSize)}
                  </span>
                </li>
                <li>
                  <span className="video-to-gif__stat-label">Frames</span>
                  <span className="video-to-gif__stat-value">
                    {result!.frameCount}
                  </span>
                </li>
              </ul>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="video-to-gif__preview"
                src={resultUrl}
                alt="Converted GIF preview"
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              <video
                className="video-to-gif__preview"
                src={originalUrl}
                controls
                playsInline
                preload="metadata"
              />
              <p className="tool-placeholder preview-single__hint">
                Choose options and click Convert to GIF.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a short video to turn it into a GIF here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "Clips up to 30 seconds · conversion runs in your browser · files never upload"}
        </p>
      </div>
    </div>
  );
}
