"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import AudioDropzone from "@/components/tools/AudioDropzone";
import {
  AUDIO_OUTPUT_MODES,
  TRANSCRIBE_LANGUAGES,
  countWords,
  describeTranscriptResult,
  downloadTranscriptSrt,
  downloadTranscriptTxt,
  formatAudioDuration,
  formatTranscriptOutput,
  transcribeAudioFile,
  type AudioOutputMode,
  type AudioToTextResult,
  type TranscribeLanguageId,
} from "@/lib/audio-to-text";
import { useToolAnalytics } from "@/lib/analytics/client";
import { formatFileSize } from "@/lib/image";
import { cn, copyText } from "@/lib/utils";

export default function AudioToText() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const languageId = useId();
  const modeId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState<TranscribeLanguageId>("auto");
  const [mode, setMode] = useState<AudioOutputMode>("plain");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AudioToTextResult | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasResult = result !== null;
  const wordCount = countWords(text);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearResult() {
    setResult(null);
    setText("");
    setCopied(false);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleReset() {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    clearResult();
    setSourceFile(null);
    setPreviewUrl("");
    setError("");
    setProgressText("");
    setLoading(false);
    setMode("plain");
    setLanguage("auto");
  }

  function handleModeChange(nextMode: AudioOutputMode) {
    setMode(nextMode);
    if (!result) return;
    setText(formatTranscriptOutput(result, nextMode));
    setCopied(false);
  }

  async function handleTranscribe() {
    if (!sourceFile) {
      setError("Upload an audio file to get started.");
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
      const transcribed = await transcribeAudioFile(sourceFile, {
        language,
        signal: controller.signal,
        onProgress: (progress) => setProgressText(progress.message),
      });

      if (controller.signal.aborted) return;

      setResult(transcribed);
      setText(formatTranscriptOutput(transcribed, mode));
      setProgressText("");
      trackSuccess();

      if (!transcribed.text.trim()) {
        setError(
          "No speech detected. Try a clearer recording, or switch language to English.",
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not transcribe this audio. Try another file or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  async function handleCopy() {
    if (!text.trim()) {
      setError("Nothing to copy yet.");
      return;
    }
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownloadTxt() {
    if (!sourceFile || !text.trim()) {
      setError("Nothing to download yet.");
      return;
    }
    downloadTranscriptTxt(text, sourceFile, mode);
    setError("");
  }

  function handleDownloadSrt() {
    if (!sourceFile || !result?.segments.length) {
      setError("No timed segments available for SRT export.");
      return;
    }
    downloadTranscriptSrt(result.segments, sourceFile);
    setError("");
  }

  return (
    <div className="tool-grid audio-to-text">
      <div className="tool-panel">
        <AudioDropzone
          onFile={handleFile}
          onError={setError}
          disabled={loading}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
              {result ? ` · ${formatAudioDuration(result.duration)}` : ""}
            </p>
          </div>
        ) : null}

        <div className="audio-to-text__options">
          <div className="ui-field">
            <span className="ui-label" id={languageId}>
              Speech language
            </span>
            <div
              className="audio-to-text__chips"
              role="radiogroup"
              aria-labelledby={languageId}
            >
              {TRANSCRIBE_LANGUAGES.map((preset) => {
                const selected = language === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "audio-to-text__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLanguage(preset.id)}
                  >
                    <span className="audio-to-text__chip-label">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Output format
            </span>
            <div
              className="audio-to-text__chips"
              role="radiogroup"
              aria-labelledby={modeId}
            >
              {AUDIO_OUTPUT_MODES.map((option) => {
                const selected = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "audio-to-text__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => handleModeChange(option.id)}
                  >
                    <span className="audio-to-text__chip-label">
                      {option.label}
                    </span>
                    <span className="audio-to-text__chip-hint">
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
            onClick={() => void handleTranscribe()}
            disabled={!hasSource || loading}
          >
            {loading ? "Transcribing…" : "Transcribe"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || loading}
          >
            Start over
          </Button>
        </div>

        {hasResult && text.trim() ? (
          <div className="tool-actions">
            <Button onClick={() => void handleCopy()}>
              {copied ? "Copied" : "Copy text"}
            </Button>
            <Button variant="ghost" onClick={handleDownloadTxt}>
              Download .txt
            </Button>
            {result?.segments.length ? (
              <Button variant="ghost" onClick={handleDownloadSrt}>
                Download .srt
              </Button>
            ) : null}
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
          className={cn(
            "tool-stage audio-to-text__stage",
            hasResult && "is-ready",
            loading && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Transcribing audio…"}
              </span>
              <span className="tool-loading__subtext">
                Speech recognition runs on Focera’s transcription API.
              </span>
            </div>
          ) : hasResult ? (
            <div className="audio-to-text__result">
              <p className="audio-to-text__result-meta">
                {describeTranscriptResult(result!, text)}
              </p>
              <label className="ui-label" htmlFor={outputId}>
                Transcript
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea audio-to-text__textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setCopied(false);
                }}
                rows={14}
                spellCheck
                placeholder="No speech was detected in this audio."
              />
            </div>
          ) : hasSource && previewUrl ? (
            <div className="audio-to-text__preview">
              <audio
                className="audio-to-text__player"
                src={previewUrl}
                controls
                preload="metadata"
              />
              <p className="tool-placeholder preview-single__hint">
                Choose a language and click Transcribe.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload audio to see the transcript here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? `${wordCount.toLocaleString()} words · edit, copy, or download TXT/SRT`
            : "Audio to text · speech transcription · free, no account"}
        </p>
      </div>
    </div>
  );
}
