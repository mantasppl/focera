"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  describePdfTranslatorResult,
  downloadTranslatedPdfDocument,
  downloadTranslatedPdfText,
  SOURCE_LANGUAGES,
  TRANSLATE_LANGUAGES,
  translatePdfFile,
  type PdfTranslatorResult,
  type TranslateLanguageId,
} from "@/lib/pdf-translator";
import { useToolAnalytics } from "@/lib/analytics/client";
import { copyText } from "@/lib/utils";

export default function PdfTranslator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const sourceLangId = useId();
  const targetLangId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState<TranslateLanguageId>("auto");
  const [targetLang, setTargetLang] =
    useState<Exclude<TranslateLanguageId, "auto">>("en");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfTranslatorResult | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasResult = result !== null;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function clearResult() {
    setResult(null);
    setText("");
    setCopied(false);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleTranslate() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
      return;
    }

    if (sourceLang !== "auto" && sourceLang === targetLang) {
      setError("Source and target languages must be different.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PDF…");
    clearResult();

    try {
      const translated = await translatePdfFile(sourceFile, {
        sourceLang,
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
          : "Could not translate this PDF. Try a smaller file or another browser.";
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
    downloadTranslatedPdfText(text, sourceFile, targetLang);
    setError("");
  }

  function handleDownloadPdf() {
    if (!sourceFile || !text.trim()) {
      setError("Nothing to download yet.");
      return;
    }
    downloadTranslatedPdfDocument(text, sourceFile, targetLang);
    setError("");
  }

  return (
    <div className="tool-grid pdf-translator">
      <div className="tool-panel">
        <PdfDropzone
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

        <div className="pdf-translator__options">
          <div className="pdf-translator__lang-row">
            <div className="ui-field">
              <label className="ui-label" htmlFor={sourceLangId}>
                From
              </label>
              <select
                id={sourceLangId}
                className="ui-input ui-input--select"
                value={sourceLang}
                disabled={loading}
                onChange={(event) =>
                  setSourceLang(event.target.value as TranslateLanguageId)
                }
              >
                {SOURCE_LANGUAGES.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={targetLangId}>
                To
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
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleTranslate()}
            disabled={!hasSource || loading}
          >
            {loading ? "Translating…" : "Translate PDF"}
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
            <Button variant="ghost" onClick={handleDownloadPdf}>
              Download PDF
            </Button>
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
                {progressText || "Translating PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Text is extracted in your browser, then translated securely.
              </span>
            </div>
          ) : hasResult ? (
            <div className="pdf-translator__result">
              <p className="pdf-translator__result-meta">
                {describePdfTranslatorResult(result!, text)}
              </p>
              <label className="ui-label" htmlFor={outputId}>
                Translated text
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea pdf-translator__textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setCopied(false);
                }}
                rows={14}
                spellCheck
                placeholder="Translation will appear here."
              />
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and choose languages to translate here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Edit the translation if needed, then copy or download · PDF extraction stays local"
            : "PDF text is extracted in your browser · only extracted text is sent for translation"}
        </p>
      </div>
    </div>
  );
}
