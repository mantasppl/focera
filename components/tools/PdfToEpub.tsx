"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPdfToEpub,
  describeOutput,
  downloadEpubFile,
  revokePdfToEpubResult,
  type PdfToEpubMode,
  type PdfToEpubResult,
} from "@/lib/pdf-to-epub";
import { cn } from "@/lib/utils";

const MODE_OPTIONS: {
  value: PdfToEpubMode;
  label: string;
  hint: string;
}[] = [
  {
    value: "text",
    label: "Reflowable text",
    hint: "Best for e-readers",
  },
  {
    value: "visual",
    label: "Exact pages",
    hint: "Best for scans",
  },
];

export default function PdfToEpub() {
  const modeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PdfToEpubResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfToEpubMode>("text");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToEpubResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePdfToEpubResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePdfToEpubResult(current);
      return null;
    });
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

  async function handleConvert() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
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
      const converted = await convertPdfToEpub(sourceFile, {
        mode,
        signal: controller.signal,
        onProgress: (current, total, label) => {
          setProgressText(`${label} ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokePdfToEpubResult(converted);
        return;
      }

      setResult(converted);
      downloadEpubFile(converted.blob, sourceFile);
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not convert this PDF. Try a smaller file or another browser.";
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
    downloadEpubFile(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid pdf-to-epub">
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

        <div className="pdf-to-epub__options">
          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Conversion mode
            </span>
            <div
              className="pdf-to-epub__chips"
              role="radiogroup"
              aria-labelledby={modeId}
            >
              {MODE_OPTIONS.map((option) => {
                const selected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-to-epub__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setMode(option.value)}
                  >
                    <span className="pdf-to-epub__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-epub__chip-hint">
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
            onClick={() => void handleConvert()}
            disabled={!hasSource || loading}
          >
            {loading ? "Converting…" : "Convert to EPUB"}
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
                {progressText || "Converting PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="pdf-to-epub__success">
              <p className="pdf-to-epub__success-title">EPUB ebook ready</p>
              <p className="pdf-to-epub__success-meta">
                {describeOutput(result)} ·{" "}
                {result.mode === "text" ? "reflowable text" : "exact pages"}
              </p>
              <ul className="pdf-to-epub__stats" aria-label="Conversion summary">
                <li>
                  <span className="pdf-to-epub__stat-label">Pages</span>
                  <span className="pdf-to-epub__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-epub__stat-label">
                    {result.mode === "text" ? "Words" : "Mode"}
                  </span>
                  <span className="pdf-to-epub__stat-value">
                    {result.mode === "text"
                      ? result.wordCount.toLocaleString()
                      : "Visual"}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-epub__stat-label">EPUB size</span>
                  <span className="pdf-to-epub__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewText ? (
                <pre className="pdf-to-epub__preview" tabIndex={0}>
                  {result.previewText}
                </pre>
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Switch mode and
                convert again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and convert it to an EPUB ebook here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PDF to EPUB conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
