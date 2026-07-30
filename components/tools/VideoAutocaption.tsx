"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import VideoDropzone from "@/components/tools/VideoDropzone";
import { formatFileSize } from "@/lib/image";
import { cn } from "@/lib/utils";
import {
  CAPTION_FONTS,
  CAPTION_POSITIONS,
  CAPTION_SIZES,
  MAX_VIDEO_DURATION_SEC,
  burnCaptionsToVideo,
  captionsToSrt,
  captionsToVtt,
  cueAtTime,
  downloadBlob,
  downloadTextFile,
  drawCaptionOnCanvas,
  formatVideoDuration,
  getCaptionFont,
  getCaptionPosition,
  getCaptionSize,
  videoFileBaseName,
  type CaptionCue,
  type CaptionFontId,
  type CaptionPositionId,
  type CaptionSizeId,
} from "@/lib/video-caption";
import {
  TRANSCRIBE_LANGUAGES,
  transcribeVideoFile,
  type TranscribeLanguageId,
} from "@/lib/video-transcribe";

export default function VideoAutocaption() {
  const languageFieldId = useId();
  const fontFieldId = useId();
  const sizeFieldId = useId();
  const positionFieldId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const styleRef = useRef({
    font: "sans" as CaptionFontId,
    size: "md" as CaptionSizeId,
    position: "bottom-center" as CaptionPositionId,
    cues: [] as CaptionCue[],
  });

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [language, setLanguage] = useState<TranscribeLanguageId>("auto");
  const [font, setFont] = useState<CaptionFontId>("sans");
  const [size, setSize] = useState<CaptionSizeId>("md");
  const [position, setPosition] = useState<CaptionPositionId>("bottom-center");
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const hasSource = Boolean(sourceFile && sourceUrl);
  const busy = transcribing || exporting;
  const activeCue = cueAtTime(cues, currentTime);
  const fontMeta = getCaptionFont(font);
  const sizeMeta = getCaptionSize(size);
  const positionMeta = getCaptionPosition(position);

  useEffect(() => {
    styleRef.current = { font, size, position, cues };
  }, [font, size, position, cues]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    if (!video || !canvas || !hasSource) return;

    let raf = 0;
    let lastActiveId = "";

    const drawLoop = () => {
      const width = video.clientWidth;
      const height = video.clientHeight;
      if (width > 0 && height > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextW = Math.round(width * dpr);
        const nextH = Math.round(height * dpr);
        if (canvas.width !== nextW || canvas.height !== nextH) {
          canvas.width = nextW;
          canvas.height = nextH;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          const {
            cues: liveCues,
            font: liveFont,
            size: liveSize,
            position: livePos,
          } = styleRef.current;
          const cue = cueAtTime(liveCues, video.currentTime);
          if (cue) {
            drawCaptionOnCanvas(ctx, width, height, {
              fontId: liveFont,
              sizeId: liveSize,
              positionId: livePos,
              text: cue.text,
            });
            if (cue.id !== lastActiveId) {
              lastActiveId = cue.id;
              setCurrentTime(video.currentTime);
            }
          } else if (lastActiveId) {
            lastActiveId = "";
            setCurrentTime(video.currentTime);
          }
        }
      }
      raf = requestAnimationFrame(drawLoop);
    };

    raf = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(raf);
  }, [hasSource]);

  function clearSession() {
    abortRef.current?.abort();
    setCues([]);
    setDuration(0);
    setCurrentTime(0);
    setError("");
    setProgressText("");
    setTranscribing(false);
    setExporting(false);
  }

  async function runTranscription(file: File, lang: TranscribeLanguageId) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setTranscribing(true);
    setError("");
    setCues([]);
    setProgressText("Starting transcription…");

    try {
      const result = await transcribeVideoFile(file, {
        language: lang,
        signal: controller.signal,
        onProgress: ({ message, progress }) => {
          setProgressText(`${message} ${Math.round(progress * 100)}%`);
        },
      });

      if (controller.signal.aborted) return;

      setDuration(result.duration);
      setCues(result.cues);
      setProgressText(
        `Transcribed ${result.cues.length} caption${result.cues.length === 1 ? "" : "s"}. Edit any line if needed.`,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setCues([]);
      setError(
        err instanceof Error
          ? err.message
          : "Transcription failed. Try a clearer clip or English mode.",
      );
      setProgressText("");
    } finally {
      setTranscribing(false);
    }
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearSession();
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    void runTranscription(file, language);
  }

  function handleReset() {
    abortRef.current?.abort();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearSession();
    setSourceFile(null);
    setSourceUrl("");
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    const nextDuration = video.duration;
    if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
      setError("Could not read this video’s duration.");
      return;
    }
    if (nextDuration > MAX_VIDEO_DURATION_SEC) {
      setError(
        `Video must be ${formatVideoDuration(MAX_VIDEO_DURATION_SEC)} or shorter.`,
      );
      return;
    }
    setDuration((prev) => prev || nextDuration);
  }

  function handleRetranscribe() {
    if (!sourceFile || busy) return;
    void runTranscription(sourceFile, language);
  }

  function updateCueText(id: string, text: string) {
    setCues((prev) =>
      prev.map((cue) => (cue.id === id ? { ...cue, text } : cue)),
    );
  }

  function seekToCue(cue: CaptionCue) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, cue.start + 0.01);
    setCurrentTime(video.currentTime);
  }

  async function handleExportVideo() {
    if (!sourceUrl || !cues.length) {
      setError("Wait for transcription before exporting.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setExporting(true);
    setError("");
    setProgressText("Preparing export…");

    try {
      const blob = await burnCaptionsToVideo({
        sourceUrl,
        cues,
        fontId: font,
        sizeId: size,
        positionId: position,
        signal: controller.signal,
        onProgress: ({ message, progress }) => {
          setProgressText(`${message} ${Math.round(progress * 100)}%`);
        },
      });

      if (controller.signal.aborted) return;

      const base = sourceFile ? videoFileBaseName(sourceFile) : "video";
      downloadBlob(blob, `${base}-captioned.webm`);
      setProgressText("Download started.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "Export failed. Try a shorter clip or another browser.",
      );
      setProgressText("");
    } finally {
      setExporting(false);
    }
  }

  function handleDownloadSrt() {
    if (!cues.length) {
      setError("Wait for transcription before downloading SRT.");
      return;
    }
    const base = sourceFile ? videoFileBaseName(sourceFile) : "captions";
    downloadTextFile(
      captionsToSrt(cues),
      `${base}.srt`,
      "application/x-subrip;charset=utf-8",
    );
    setError("");
  }

  function handleDownloadVtt() {
    if (!cues.length) {
      setError("Wait for transcription before downloading VTT.");
      return;
    }
    const base = sourceFile ? videoFileBaseName(sourceFile) : "captions";
    downloadTextFile(
      captionsToVtt(cues),
      `${base}.vtt`,
      "text/vtt;charset=utf-8",
    );
    setError("");
  }

  return (
    <div className="video-caption">
      {!hasSource ? (
        <div className="video-caption__upload">
          <div className="ui-field video-caption__language-field">
            <label className="ui-label" htmlFor={languageFieldId}>
              Speech language
            </label>
            <select
              id={languageFieldId}
              className="ui-input ui-input--select"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as TranscribeLanguageId)
              }
            >
              {TRANSCRIBE_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="tool-hint">
              Speech is transcribed automatically from the video audio. English
              mode is faster; Auto detect works for many languages. Only the
              audio track is sent for transcription — not the full video file.
            </p>
          </div>
          <VideoDropzone
            onFile={handleFile}
            onError={setError}
            disabled={busy}
          />
        </div>
      ) : (
        <div className="video-caption__layout">
          <div className="tool-panel video-caption__preview-panel">
            <div className="video-caption__stage">
              <video
                ref={videoRef}
                className="video-caption__video"
                src={sourceUrl}
                controls
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
              />
              <canvas
                ref={overlayCanvasRef}
                className="video-caption__overlay"
                aria-hidden="true"
              />
              {transcribing ? (
                <div className="video-caption__busy" role="status">
                  <span className="tool-loading__spinner" aria-hidden="true" />
                  <span>Transcribing speech…</span>
                </div>
              ) : null}
            </div>

            <div className="video-caption__meta">
              <p className="tool-hint">
                {sourceFile?.name} ·{" "}
                {sourceFile ? formatFileSize(sourceFile.size) : ""}
                {duration ? ` · ${formatVideoDuration(duration)}` : ""}
              </p>
              {activeCue ? (
                <p className="video-caption__now" aria-live="polite">
                  Now: {activeCue.text}
                </p>
              ) : (
                <p className="video-caption__now video-caption__now--muted">
                  {transcribing
                    ? "Detecting speech…"
                    : "No caption at this time"}
                </p>
              )}
            </div>
          </div>

          <div className="tool-panel video-caption__controls">
            <div className="ui-field">
              <label className="ui-label" htmlFor={`${languageFieldId}-again`}>
                Speech language
              </label>
              <select
                id={`${languageFieldId}-again`}
                className="ui-input ui-input--select"
                value={language}
                disabled={busy}
                onChange={(event) =>
                  setLanguage(event.target.value as TranscribeLanguageId)
                }
              >
                {TRANSCRIBE_LANGUAGES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tool-actions video-caption__actions">
              <Button onClick={handleRetranscribe} disabled={busy}>
                {transcribing ? "Transcribing…" : "Re-transcribe"}
              </Button>
              <Button variant="ghost" onClick={handleReset} disabled={busy}>
                Start over
              </Button>
            </div>

            <div className="video-caption__style-grid">
              <div className="ui-field">
                <label className="ui-label" htmlFor={fontFieldId}>
                  Font style
                </label>
                <select
                  id={fontFieldId}
                  className="ui-input ui-input--select"
                  value={font}
                  disabled={busy}
                  onChange={(event) =>
                    setFont(event.target.value as CaptionFontId)
                  }
                >
                  {CAPTION_FONTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ui-field">
                <label className="ui-label" htmlFor={sizeFieldId}>
                  Font size
                </label>
                <select
                  id={sizeFieldId}
                  className="ui-input ui-input--select"
                  value={size}
                  disabled={busy}
                  onChange={(event) =>
                    setSize(event.target.value as CaptionSizeId)
                  }
                >
                  {CAPTION_SIZES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ui-field video-caption__position-field">
                <span className="ui-label" id={positionFieldId}>
                  Location
                </span>
                <div
                  className="video-caption__position-grid"
                  role="radiogroup"
                  aria-labelledby={positionFieldId}
                >
                  {CAPTION_POSITIONS.map((item) => {
                    const selected = position === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={item.label}
                        title={item.label}
                        className={cn(
                          "video-caption__position-btn",
                          selected && "is-active",
                        )}
                        disabled={busy}
                        onClick={() => setPosition(item.id)}
                      >
                        <span className="video-caption__position-dot" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="tool-hint">
              Preview uses {fontMeta.label}, {sizeMeta.label},{" "}
              {positionMeta.label}. Captions appear at the moment they were
              spoken — edit any line below.
            </p>

            <div className="video-caption__cues" aria-label="Caption cues">
              <p className="video-caption__cues-title">
                {transcribing
                  ? "Transcribing…"
                  : cues.length
                    ? `${cues.length} timed caption${cues.length === 1 ? "" : "s"}`
                    : "No captions yet"}
              </p>
              {cues.length > 0 ? (
                <ul className="video-caption__cue-list">
                  {cues.map((cue, index) => (
                    <li
                      key={cue.id}
                      className={cn(
                        "video-caption__cue video-caption__cue--editable",
                        activeCue?.id === cue.id && "is-active",
                      )}
                    >
                      <div className="video-caption__cue-head">
                        <button
                          type="button"
                          className="video-caption__cue-time"
                          onClick={() => seekToCue(cue)}
                          disabled={busy}
                        >
                          {formatVideoDuration(cue.start)}–
                          {formatVideoDuration(cue.end)}
                        </button>
                        <span className="video-caption__cue-index">
                          #{index + 1}
                        </span>
                      </div>
                      <textarea
                        className="ui-input ui-input--textarea video-caption__cue-input"
                        rows={2}
                        value={cue.text}
                        disabled={busy}
                        aria-label={`Caption ${index + 1} text`}
                        onChange={(event) =>
                          updateCueText(cue.id, event.target.value)
                        }
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="tool-actions video-caption__actions">
              <Button
                onClick={handleExportVideo}
                disabled={busy || !cues.length}
              >
                {exporting ? "Exporting…" : "Download video"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleDownloadSrt}
                disabled={busy || !cues.length}
              >
                Download SRT
              </Button>
              <Button
                variant="ghost"
                onClick={handleDownloadVtt}
                disabled={busy || !cues.length}
              >
                Download VTT
              </Button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}
      {progressText ? (
        <p className="tool-hint" aria-live="polite">
          {progressText}
        </p>
      ) : null}
    </div>
  );
}
