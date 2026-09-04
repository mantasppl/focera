"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import VideoDropzone from "@/components/tools/VideoDropzone";
import { formatVideoFileSize } from "@/lib/video-caption";
import {
  COMPRESS_VIDEO_PRESETS,
  compressVideoFile,
  describeVideoMeta,
  describeVideoSavings,
  downloadCompressedVideo,
  type CompressVideoLevel,
  type CompressVideoResult,
} from "@/lib/video-compressor";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function CompressVideo() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const levelId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [level, setLevel] = useState<CompressVideoLevel>("balanced");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompressVideoResult | null>(null);
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
      const compressed = await compressVideoFile(sourceFile, {
        level,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(compressed.blob);
      setResult(compressed);
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
          : "Could not compress this video. Try a smaller file or another browser.";
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
    downloadCompressedVideo(result.blob, sourceFile, result.extension);
  }

  return (
    <div className="tool-grid compress-video">
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

        <div className="compress-video__options">
          <div className="ui-field">
            <span className="ui-label" id={levelId}>
              Compression level
            </span>
            <div
              className="compress-video__chips compress-video__chips--levels"
              role="radiogroup"
              aria-labelledby={levelId}
            >
              {COMPRESS_VIDEO_PRESETS.map((preset) => {
                const selected = level === preset.level;
                return (
                  <button
                    key={preset.level}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "compress-video__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLevel(preset.level)}
                  >
                    <span className="compress-video__chip-label">
                      {preset.label}
                    </span>
                    <span className="compress-video__chip-hint">
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
            onClick={() => void handleCompress()}
            disabled={!hasSource || loading}
          >
            {loading ? "Compressing…" : "Compress video"}
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
                {progressText || "Compressing video…"}
              </span>
              <span className="tool-loading__subtext">
                Compression runs locally in your browser. Keep this tab open.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="compress-video__success">
              <p className="compress-video__success-title">
                Compressed video ready
              </p>
              <p className="compress-video__success-meta">
                {describeVideoMeta(
                  result!.width,
                  result!.height,
                  result!.originalWidth,
                  result!.originalHeight,
                  result!.durationSec,
                  result!.extension,
                )}{" "}
                ·{" "}
                {describeVideoSavings(
                  result!.originalSize,
                  result!.compressedSize,
                  result!.savingsPercent,
                )}
              </p>
              <ul
                className="compress-video__stats"
                aria-label="Size comparison"
              >
                <li>
                  <span className="compress-video__stat-label">Original</span>
                  <span className="compress-video__stat-value">
                    {formatVideoFileSize(result!.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="compress-video__stat-label">
                    Compressed
                  </span>
                  <span className="compress-video__stat-value">
                    {formatVideoFileSize(result!.compressedSize)}
                  </span>
                </li>
                <li>
                  <span className="compress-video__stat-label">Saved</span>
                  <span
                    className={cn(
                      "compress-video__stat-value",
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
              <video
                className="compress-video__preview"
                src={resultUrl}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              <video
                className="compress-video__preview"
                src={originalUrl}
                controls
                playsInline
                preload="metadata"
              />
              <p className="tool-placeholder preview-single__hint">
                Choose a level and click Compress video.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a video to shrink its file size here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "Video compression runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
