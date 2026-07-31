"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Button from "@/components/Button";
import VideoDropzone from "@/components/tools/VideoDropzone";
import { formatVideoFileSize } from "@/lib/video-caption";
import {
  clampTrimRange,
  describeTrimMeta,
  describeTrimSize,
  downloadTrimmedVideo,
  formatPreciseTime,
  trimVideoFile,
  validateTrimRange,
  type TrimVideoResult,
} from "@/lib/trim-video";

export default function TrimVideo() {
  const startId = useId();
  const endId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const previewClipRef = useRef(false);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrimVideoResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl && duration > 0);
  const hasResult = Boolean(result && resultUrl);
  const clipDuration = Math.max(0, endSec - startSec);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!previewClipRef.current) return;
      if (video.currentTime >= endSec - 0.05) {
        video.pause();
        previewClipRef.current = false;
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [endSec]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl("");
  }

  function applyRange(nextStart: number, nextEnd: number, sourceDuration = duration) {
    const clamped = clampTrimRange(nextStart, nextEnd, sourceDuration);
    setStartSec(clamped.startSec);
    setEndSec(clamped.endSec);
    return clamped;
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setDuration(0);
    setStartSec(0);
    setEndSec(0);
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setDuration(0);
    setStartSec(0);
    setEndSec(0);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  function handleLoadedMetadata() {
    const video = previewRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      setError("Could not read video duration.");
      return;
    }
    const d = video.duration;
    setDuration(d);
    applyRange(0, d, d);
  }

  function handleStartChange(value: number) {
    clearResult();
    applyRange(value, endSec);
  }

  function handleEndChange(value: number) {
    clearResult();
    applyRange(startSec, value);
  }

  function seekPreview(time: number) {
    const video = previewRef.current;
    if (!video) return;
    previewClipRef.current = false;
    video.pause();
    video.currentTime = Math.min(Math.max(0, time), duration || 0);
  }

  function handleSetStartFromPlayhead() {
    const video = previewRef.current;
    if (!video || !duration) return;
    clearResult();
    const next = applyRange(video.currentTime, endSec);
    seekPreview(next.startSec);
  }

  function handleSetEndFromPlayhead() {
    const video = previewRef.current;
    if (!video || !duration) return;
    clearResult();
    applyRange(startSec, video.currentTime);
  }

  function handlePreviewSelection() {
    const video = previewRef.current;
    if (!video || !hasSource) return;
    previewClipRef.current = true;
    video.currentTime = startSec;
    void video.play().catch(() => undefined);
  }

  async function handleTrim() {
    if (!sourceFile) {
      setError("Upload a video to get started.");
      return;
    }

    const rangeError = validateTrimRange(startSec, endSec, duration);
    if (rangeError) {
      setError(rangeError);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();
    previewClipRef.current = false;
    previewRef.current?.pause();

    try {
      const trimmed = await trimVideoFile(sourceFile, {
        startSec,
        endSec,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(trimmed.blob);
      setResult(trimmed);
      setResultUrl(url);
      downloadTrimmedVideo(trimmed.blob, sourceFile, trimmed.extension);
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not trim this video. Try a shorter selection or another browser.";
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
    downloadTrimmedVideo(result.blob, sourceFile, result.extension);
  }

  const startPct = duration > 0 ? (startSec / duration) * 100 : 0;
  const endPct = duration > 0 ? (endSec / duration) * 100 : 100;

  return (
    <div className="tool-grid trim-video">
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
              {sourceFile ? formatVideoFileSize(sourceFile.size) : ""} ·{" "}
              {formatPreciseTime(duration)}
            </p>
          </div>
        ) : null}

        <div className="trim-video__options">
          <div className="trim-video__times">
            <div className="ui-field">
              <label className="ui-label" htmlFor={startId}>
                Start
              </label>
              <input
                id={startId}
                className="ui-input"
                type="number"
                min={0}
                max={Math.max(0, duration - 0.2)}
                step={0.1}
                value={hasSource ? startSec : ""}
                placeholder="0"
                disabled={!hasSource || loading}
                onChange={(e) => handleStartChange(Number(e.target.value))}
                onBlur={() => seekPreview(startSec)}
              />
              <p className="ui-hint">{formatPreciseTime(startSec)}</p>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor={endId}>
                End
              </label>
              <input
                id={endId}
                className="ui-input"
                type="number"
                min={0.2}
                max={duration || 0}
                step={0.1}
                value={hasSource ? endSec : ""}
                placeholder="0"
                disabled={!hasSource || loading}
                onChange={(e) => handleEndChange(Number(e.target.value))}
              />
              <p className="ui-hint">{formatPreciseTime(endSec)}</p>
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label">Selection</span>
            <div
              className="trim-video__timeline"
              style={
                {
                  "--trim-start": `${startPct}%`,
                  "--trim-end": `${endPct}%`,
                } as CSSProperties
              }
            >
              <div className="trim-video__track" aria-hidden="true">
                <div className="trim-video__selection" />
              </div>
              <input
                className="trim-video__range trim-video__range--start"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={startSec}
                disabled={!hasSource || loading}
                aria-label="Trim start time"
                onChange={(e) => handleStartChange(Number(e.target.value))}
                onMouseUp={() => seekPreview(startSec)}
                onTouchEnd={() => seekPreview(startSec)}
                onKeyUp={() => seekPreview(startSec)}
              />
              <input
                className="trim-video__range trim-video__range--end"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={endSec}
                disabled={!hasSource || loading}
                aria-label="Trim end time"
                onChange={(e) => handleEndChange(Number(e.target.value))}
              />
            </div>
            <p className="ui-hint">
              Clip length: {formatPreciseTime(clipDuration)}
              {hasSource
                ? ` · ${formatPreciseTime(startSec)} – ${formatPreciseTime(endSec)}`
                : ""}
            </p>
          </div>

          <div className="trim-video__playhead-actions">
            <Button
              variant="ghost"
              onClick={handleSetStartFromPlayhead}
              disabled={!hasSource || loading}
            >
              Set start here
            </Button>
            <Button
              variant="ghost"
              onClick={handleSetEndFromPlayhead}
              disabled={!hasSource || loading}
            >
              Set end here
            </Button>
            <Button
              variant="ghost"
              onClick={handlePreviewSelection}
              disabled={!hasSource || loading}
            >
              Preview selection
            </Button>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleTrim()}
            disabled={!hasSource || loading}
          >
            {loading ? "Trimming…" : "Trim & download"}
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
                {progressText || "Trimming video…"}
              </span>
              <span className="tool-loading__subtext">
                Trimming runs locally in your browser. Keep this tab open.
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="trim-video__success">
              <p className="trim-video__success-title">Trimmed video ready</p>
              <p className="trim-video__success-meta">
                {describeTrimMeta(
                  result!.width,
                  result!.height,
                  result!.startSec,
                  result!.endSec,
                  result!.durationSec,
                  result!.extension,
                )}{" "}
                · {describeTrimSize(result!.originalSize, result!.trimmedSize)}
              </p>
              <ul className="trim-video__stats" aria-label="Trim summary">
                <li>
                  <span className="trim-video__stat-label">Start</span>
                  <span className="trim-video__stat-value">
                    {formatPreciseTime(result!.startSec)}
                  </span>
                </li>
                <li>
                  <span className="trim-video__stat-label">End</span>
                  <span className="trim-video__stat-value">
                    {formatPreciseTime(result!.endSec)}
                  </span>
                </li>
                <li>
                  <span className="trim-video__stat-label">Length</span>
                  <span className="trim-video__stat-value">
                    {formatPreciseTime(result!.durationSec)}
                  </span>
                </li>
              </ul>
              <video
                className="trim-video__preview"
                src={resultUrl}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          ) : originalUrl ? (
            <div className="preview-single">
              <video
                ref={previewRef}
                className="trim-video__preview"
                src={originalUrl}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
              />
              <p className="tool-placeholder preview-single__hint">
                Drag the handles or enter start and end, then Trim & download.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a video to pick a start and end time here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "Video trimming runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
