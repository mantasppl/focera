"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPdfToPowerpoint,
  describeOutput,
  downloadPowerpointFile,
  revokePdfToPowerpointResult,
  type PdfToPowerpointMode,
  type PdfToPowerpointResult,
} from "@/lib/pdf-to-powerpoint";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const MODE_OPTIONS: {
  value: PdfToPowerpointMode;
  label: string;
  hint: string;
}[] = [
  {
    value: "text",
    label: "Editable text",
    hint: "Best for documents",
  },
  {
    value: "visual",
    label: "Exact pages",
    hint: "Best for scans",
  },
];

export default function PdfToPowerpoint() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const modeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PdfToPowerpointResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfToPowerpointMode>("text");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToPowerpointResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePdfToPowerpointResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePdfToPowerpointResult(current);
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
      const converted = await convertPdfToPowerpoint(sourceFile, {
        mode,
        signal: controller.signal,
        onProgress: (current, total, label) => {
          setProgressText(`${label} ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokePdfToPowerpointResult(converted);
        return;
      }

      setResult(converted);
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
    downloadPowerpointFile(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid pdf-to-powerpoint">
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

        <div className="pdf-to-powerpoint__options">
          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Conversion mode
            </span>
            <div
              className="pdf-to-powerpoint__chips"
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
                      "pdf-to-powerpoint__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setMode(option.value)}
                  >
                    <span className="pdf-to-powerpoint__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-powerpoint__chip-hint">
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
            {loading ? "Converting…" : "Convert to PowerPoint"}
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
                {progressText || "Converting PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="pdf-to-powerpoint__success">
              <p className="pdf-to-powerpoint__success-title">
                PowerPoint presentation ready
              </p>
              <p className="pdf-to-powerpoint__success-meta">
                {describeOutput(result)} ·{" "}
                {result.mode === "text" ? "editable text" : "exact pages"}
              </p>
              <ul
                className="pdf-to-powerpoint__stats"
                aria-label="Conversion summary"
              >
                <li>
                  <span className="pdf-to-powerpoint__stat-label">Slides</span>
                  <span className="pdf-to-powerpoint__stat-value">
                    {result.slideCount}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-powerpoint__stat-label">
                    {result.mode === "text" ? "Words" : "Mode"}
                  </span>
                  <span className="pdf-to-powerpoint__stat-value">
                    {result.mode === "text"
                      ? result.wordCount.toLocaleString()
                      : "Visual"}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-powerpoint__stat-label">PPTX size</span>
                  <span className="pdf-to-powerpoint__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewText ? (
                <pre className="pdf-to-powerpoint__preview" tabIndex={0}>
                  {result.previewText}
                </pre>
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Switch mode and
                convert again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and convert it to a PowerPoint (.pptx) file here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "PDF to PowerPoint conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
