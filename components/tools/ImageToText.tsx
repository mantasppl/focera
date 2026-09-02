"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import {
  OCR_LANGUAGES,
  describeOcrResult,
  downloadExtractedText,
  extractTextFromImage,
  type ImageToTextResult,
  type OcrLanguageId,
} from "@/lib/image-to-text";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

export default function ImageToText() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const languageId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [language, setLanguage] = useState<OcrLanguageId>("eng");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImageToTextResult | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = result !== null;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  function clearResult() {
    setResult(null);
    setText("");
    setCopied(false);
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

  async function handleExtract() {
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
      const extracted = await extractTextFromImage(sourceFile, {
        language,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      setResult(extracted);
      setText(extracted.text);
      setProgressText("");
      trackSuccess();

      if (!extracted.text) {
        setError(
          "No readable text found. Try a clearer photo, higher contrast, or another language.",
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
          : "Could not extract text from this image. Try another file or browser.";
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

  function handleDownload() {
    if (!sourceFile || !text.trim()) {
      setError("Nothing to download yet.");
      return;
    }
    downloadExtractedText(text, sourceFile);
    setError("");
  }

  return (
    <ImageEditorShell
      className="image-to-text"
      hasSource={hasSource}
      stageReady={hasResult}
      loading={loading}
      loadingText={progressText || "Extracting text…"}
      loadingSubtext="OCR runs locally in your browser."
      previewTitle="Preview"
      previewMeta={
        hasResult
          ? describeOcrResult(result!, text)
          : hasSource
            ? sourceFile?.name
            : "Upload an image to start"
      }
      previewHint={
        hasSource && !hasResult ? "Choose a language and click Extract text" : undefined
      }
      privacyHint={
        hasResult
          ? "Edit the text if needed, then copy or download · processed locally"
          : "Image to text OCR in your browser · files never upload to Focera"
      }
      sidebar={
        <>
          {!hasSource ? (
            <ImageDropzone
              onFile={handleFile}
              onError={setError}
              disabled={loading}
            />
          ) : (
            <ImageSourceBar
              file={sourceFile!}
              disabled={loading}
              onReplace={handleFile}
            />
          )}

          <div className="image-to-text__options">
            <div className="ui-field">
              <span className="ui-label" id={languageId}>
                Text language
              </span>
              <div
                className="image-to-text__chips"
                role="radiogroup"
                aria-labelledby={languageId}
              >
                {OCR_LANGUAGES.map((preset) => {
                  const selected = language === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "image-to-text__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => setLanguage(preset.id)}
                    >
                      <span className="image-to-text__chip-label">
                        {preset.label}
                      </span>
                      <span className="image-to-text__chip-hint">
                        {preset.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {hasResult ? (
            <div className="image-to-text__result">
              <label className="ui-label" htmlFor={outputId}>
                Extracted text
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea image-to-text__textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setCopied(false);
                }}
                rows={12}
                spellCheck
                placeholder="No text was detected in this image."
              />
            </div>
          ) : null}
        </>
      }
      sidebarFooter={
        <>
          <div className="tool-actions">
            <Button
              onClick={() => void handleExtract()}
              disabled={!hasSource || loading}
            >
              {loading ? "Extracting…" : "Extract text"}
            </Button>
            {hasResult && text.trim() ? (
              <>
                <Button onClick={() => void handleCopy()}>
                  {copied ? "Copied" : "Copy text"}
                </Button>
                <Button variant="ghost" onClick={handleDownload}>
                  Download .txt
                </Button>
              </>
            ) : null}
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={(!hasSource && !hasResult) || loading}
            >
              Start over
            </Button>
          </div>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </>
      }
    >
      {hasSource && originalUrl ? (
        <div className="image-editor-shell__preview-content preview-single">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Uploaded preview"
            className="preview-single__image"
          />
        </div>
      ) : null}
    </ImageEditorShell>
  );
}
