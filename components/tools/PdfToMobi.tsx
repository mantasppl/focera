"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPdfToMobi,
  describeOutput,
  downloadMobiFile,
  revokePdfToMobiResult,
  type PdfToMobiMode,
  type PdfToMobiResult,
} from "@/lib/pdf-to-mobi";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const MODE_OPTIONS: {
  value: PdfToMobiMode;
  label: string;
  hint: string;
}[] = [
  {
    value: "text",
    label: "Reflowable text",
    hint: "Best for Kindle",
  },
  {
    value: "visual",
    label: "Exact pages",
    hint: "Best for scans",
  },
];

export default function PdfToMobi() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const modeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PdfToMobiResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfToMobiMode>("text");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToMobiResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePdfToMobiResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePdfToMobiResult(current);
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
      const converted = await convertPdfToMobi(sourceFile, {
        mode,
        signal: controller.signal,
        onProgress: (current, total, label) => {
          setProgressText(`${label} ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokePdfToMobiResult(converted);
        return;
      }

      setResult(converted);
      downloadMobiFile(converted.blob, sourceFile);
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
    downloadMobiFile(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid pdf-to-mobi">
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

        <div className="pdf-to-mobi__options">
          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Conversion mode
            </span>
            <div
              className="pdf-to-mobi__chips"
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
                      "pdf-to-mobi__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setMode(option.value)}
                  >
                    <span className="pdf-to-mobi__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-mobi__chip-hint">
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
            {loading ? "Converting…" : "Convert to MOBI"}
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
            <div className="pdf-to-mobi__success">
              <p className="pdf-to-mobi__success-title">MOBI ebook ready</p>
              <p className="pdf-to-mobi__success-meta">
                {describeOutput(result)} ·{" "}
                {result.mode === "text" ? "reflowable text" : "exact pages"}
              </p>
              <ul className="pdf-to-mobi__stats" aria-label="Conversion summary">
                <li>
                  <span className="pdf-to-mobi__stat-label">Pages</span>
                  <span className="pdf-to-mobi__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-mobi__stat-label">
                    {result.mode === "text" ? "Words" : "Mode"}
                  </span>
                  <span className="pdf-to-mobi__stat-value">
                    {result.mode === "text"
                      ? result.wordCount.toLocaleString()
                      : "Visual"}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-mobi__stat-label">MOBI size</span>
                  <span className="pdf-to-mobi__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewText ? (
                <pre className="pdf-to-mobi__preview" tabIndex={0}>
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
              Upload a PDF and convert it to a MOBI ebook here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PDF to MOBI conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
