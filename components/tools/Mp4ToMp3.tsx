"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import VideoDropzone from "@/components/tools/VideoDropzone";
import { formatVideoFileSize } from "@/lib/video-caption";
import {
  convertMp4ToMp3,
  describeMp3Meta,
  downloadMp3,
  MP3_QUALITY_PRESETS,
  type Mp3Bitrate,
  type Mp4ToMp3Result,
} from "@/lib/mp4-to-mp3";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export type VideoToMp3Copy = {
  convertLabel?: string;
  convertingLabel?: string;
  successTitle?: string;
  emptyPlaceholder?: string;
  previewHint?: string;
  hintIdle?: string;
  hintReady?: string;
  loadingSubtext?: string;
};

const DEFAULT_COPY: Required<VideoToMp3Copy> = {
  convertLabel: "Convert to MP3",
  convertingLabel: "Converting…",
  successTitle: "MP3 ready",
  emptyPlaceholder: "Upload a video to extract and download MP3 audio here",
  previewHint: "Choose a quality and click Convert to MP3.",
  hintIdle: "MP4 to MP3 runs in your browser · files never upload to Focera",
  hintReady: "Download again anytime · processed locally",
  loadingSubtext: "Conversion runs locally in your browser. Keep this tab open.",
};

type Mp4ToMp3Props = {
  copy?: VideoToMp3Copy;
};

export default function Mp4ToMp3({ copy }: Mp4ToMp3Props) {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const labels = { ...DEFAULT_COPY, ...copy };
  const qualityId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [bitrate, setBitrate] = useState<Mp3Bitrate>(192);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Mp4ToMp3Result | null>(null);
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
      const converted = await convertMp4ToMp3(sourceFile, {
        bitrate,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(converted.blob);
      setResult(converted);
      setResultUrl(url);
      downloadMp3(converted.blob, sourceFile);
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
          : "Could not convert this video. Try a smaller file or another browser.";
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
    downloadMp3(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid mp4-to-mp3">
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

        <div className="mp4-to-mp3__options">
          <div className="ui-field">
            <span className="ui-label" id={qualityId}>
              MP3 quality
            </span>
            <div
              className="mp4-to-mp3__chips"
              role="radiogroup"
              aria-labelledby={qualityId}
            >
              {MP3_QUALITY_PRESETS.map((preset) => {
                const selected = bitrate === preset.bitrate;
                return (
                  <button
                    key={preset.bitrate}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "mp4-to-mp3__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setBitrate(preset.bitrate)}
                  >
                    <span className="mp4-to-mp3__chip-label">
                      {preset.label}
                    </span>
                    <span className="mp4-to-mp3__chip-hint">
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
            {loading ? labels.convertingLabel : labels.convertLabel}
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
                {progressText || labels.convertingLabel}
              </span>
              <span className="tool-loading__subtext">
                {labels.loadingSubtext}
              </span>
            </div>
          ) : hasResult && resultUrl ? (
            <div className="mp4-to-mp3__success">
              <p className="mp4-to-mp3__success-title">{labels.successTitle}</p>
              <p className="mp4-to-mp3__success-meta">
                {describeMp3Meta(result!)}
              </p>
              <ul className="mp4-to-mp3__stats" aria-label="Size comparison">
                <li>
                  <span className="mp4-to-mp3__stat-label">Video</span>
                  <span className="mp4-to-mp3__stat-value">
                    {formatVideoFileSize(result!.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="mp4-to-mp3__stat-label">MP3</span>
                  <span className="mp4-to-mp3__stat-value">
                    {formatVideoFileSize(result!.outputSize)}
                  </span>
                </li>
                <li>
                  <span className="mp4-to-mp3__stat-label">Bitrate</span>
                  <span className="mp4-to-mp3__stat-value">
                    {result!.bitrate} kbps
                  </span>
                </li>
              </ul>
              <audio
                className="mp4-to-mp3__player"
                src={resultUrl}
                controls
                preload="metadata"
              />
            </div>
          ) : hasSource && originalUrl ? (
            <div className="preview-single">
              <video
                className="mp4-to-mp3__preview"
                src={originalUrl}
                controls
                playsInline
                preload="metadata"
              />
              <p className="tool-placeholder preview-single__hint">
                {labels.previewHint}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">{labels.emptyPlaceholder}</p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult ? labels.hintReady : labels.hintIdle}
        </p>
      </div>
    </div>
  );
}
