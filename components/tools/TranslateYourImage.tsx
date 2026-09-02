"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import {
  OCR_LANGUAGES,
  TRANSLATE_LANGUAGES,
  describeTranslateYourImageResult,
  downloadTranslatedImageText,
  ocrLanguageToTranslateSource,
  translateYourImage,
  type OcrLanguageId,
  type TranslateLanguageId,
  type TranslateYourImageResult,
} from "@/lib/translate-your-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

export default function TranslateYourImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const ocrLanguageId = useId();
  const targetLangId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguageId>("eng");
  const [targetLang, setTargetLang] =
    useState<Exclude<TranslateLanguageId, "auto">>("es");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TranslateYourImageResult | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = result !== null;
  const sourceTranslateLang = ocrLanguageToTranslateSource(ocrLanguage);

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

  async function handleTranslate() {
    if (!sourceFile) {
      setError("Upload an image to get started.");
      return;
    }

    if (sourceTranslateLang === targetLang) {
      setError("Image language and target language must be different.");
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
      const translated = await translateYourImage(sourceFile, {
        ocrLanguage,
        targetLang,
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      setResult(translated);
      setText(translated.translatedText);
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
          : "Could not translate this image. Try another file or browser.";
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
    downloadTranslatedImageText(text, sourceFile, targetLang);
    setError("");
  }

  return (
    <ImageEditorShell
      className="translate-your-image"
      hasSource={hasSource}
      stageReady={hasResult}
      loading={loading}
      loadingText={progressText || "Translating image…"}
      loadingSubtext="OCR runs locally, then only the text is translated."
      previewTitle="Preview"
      previewMeta={
        hasResult
          ? describeTranslateYourImageResult(result!, text)
          : hasSource
            ? sourceFile?.name
            : "Upload an image to start"
      }
      previewHint={
        hasSource && !hasResult
          ? "Choose languages and click Translate image"
          : undefined
      }
      privacyHint={
        hasResult
          ? "Edit the translation if needed, then copy or download · OCR stayed on your device"
          : "OCR runs in your browser · only extracted text is sent for translation"
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

          <div className="translate-your-image__options">
            <div className="ui-field">
              <span className="ui-label" id={ocrLanguageId}>
                Text in image
              </span>
              <div
                className="translate-your-image__chips"
                role="radiogroup"
                aria-labelledby={ocrLanguageId}
              >
                {OCR_LANGUAGES.map((preset) => {
                  const selected = ocrLanguage === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "translate-your-image__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        setOcrLanguage(preset.id);
                        const nextSource = ocrLanguageToTranslateSource(
                          preset.id,
                        );
                        if (nextSource === targetLang) {
                          setTargetLang(nextSource === "en" ? "es" : "en");
                        }
                      }}
                    >
                      <span className="translate-your-image__chip-label">
                        {preset.label}
                      </span>
                      <span className="translate-your-image__chip-hint">
                        {preset.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={targetLangId}>
                Translate to
              </label>
              <select
                id={targetLangId}
                className="ui-input ui-input--select"
                value={targetLang}
                disabled={loading}
                onChange={(event) =>
                  setTargetLang(
                    event.target.value as Exclude<TranslateLanguageId, "auto">,
                  )
                }
              >
                {TRANSLATE_LANGUAGES.map((language) => (
                  <option
                    key={language.id}
                    value={language.id}
                    disabled={language.id === sourceTranslateLang}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasResult ? (
            <div className="translate-your-image__result">
              <label className="ui-label" htmlFor={outputId}>
                Translated text
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea translate-your-image__textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setCopied(false);
                }}
                rows={12}
                spellCheck
                placeholder="Translation will appear here."
              />
            </div>
          ) : null}
        </>
      }
      sidebarFooter={
        <>
          <div className="tool-actions">
            <Button
              onClick={() => void handleTranslate()}
              disabled={!hasSource || loading}
            >
              {loading ? "Translating…" : "Translate image"}
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
