"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPdfToCsv,
  describeOutput,
  downloadCsvFile,
  revokePdfToCsvResult,
  type PdfToCsvLayout,
  type PdfToCsvOutput,
  type PdfToCsvResult,
} from "@/lib/pdf-to-csv";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const LAYOUT_OPTIONS: {
  value: PdfToCsvLayout;
  label: string;
  hint: string;
}[] = [
  {
    value: "tables",
    label: "Detect tables",
    hint: "Split columns by gaps",
  },
  {
    value: "lines",
    label: "One column",
    hint: "Each line = one row",
  },
];

const OUTPUT_OPTIONS: {
  value: PdfToCsvOutput;
  label: string;
  hint: string;
}[] = [
  {
    value: "combined",
    label: "One CSV",
    hint: "All pages together",
  },
  {
    value: "per-page",
    label: "CSV per page",
    hint: "ZIP of separate files",
  },
];

export default function PdfToCsv() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const layoutId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PdfToCsvResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<PdfToCsvLayout>("tables");
  const [output, setOutput] = useState<PdfToCsvOutput>("combined");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToCsvResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePdfToCsvResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePdfToCsvResult(current);
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
      const converted = await convertPdfToCsv(sourceFile, {
        layout,
        output,
        signal: controller.signal,
        onProgress: (current, total, label) => {
          setProgressText(`${label} ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokePdfToCsvResult(converted);
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
    downloadCsvFile(result.blob, sourceFile, result.extension);
  }

  return (
    <div className="tool-grid pdf-to-csv">
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

        <div className="pdf-to-csv__options">
          <div className="ui-field">
            <span className="ui-label" id={layoutId}>
              Layout
            </span>
            <div
              className="pdf-to-csv__chips"
              role="radiogroup"
              aria-labelledby={layoutId}
            >
              {LAYOUT_OPTIONS.map((option) => {
                const selected = layout === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-to-csv__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLayout(option.value)}
                  >
                    <span className="pdf-to-csv__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-csv__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={outputId}>
              Output
            </span>
            <div
              className="pdf-to-csv__chips"
              role="radiogroup"
              aria-labelledby={outputId}
            >
              {OUTPUT_OPTIONS.map((option) => {
                const selected = output === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-to-csv__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setOutput(option.value)}
                  >
                    <span className="pdf-to-csv__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-csv__chip-hint">
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
            {loading ? "Converting…" : "Convert to CSV"}
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
            <div className="pdf-to-csv__success">
              <p className="pdf-to-csv__success-title">
                {result.extension === "zip" ? "CSV ZIP ready" : "CSV file ready"}
              </p>
              <p className="pdf-to-csv__success-meta">
                {describeOutput(result)} ·{" "}
                {result.layout === "tables" ? "table detection" : "one column"}
              </p>
              <ul className="pdf-to-csv__stats" aria-label="Conversion summary">
                <li>
                  <span className="pdf-to-csv__stat-label">Pages</span>
                  <span className="pdf-to-csv__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-csv__stat-label">Rows</span>
                  <span className="pdf-to-csv__stat-value">
                    {result.rowCount.toLocaleString()}
                  </span>
                </li>
                <li>
                  <span className="pdf-to-csv__stat-label">
                    {result.extension === "zip" ? "ZIP size" : "CSV size"}
                  </span>
                  <span className="pdf-to-csv__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewRows.length ? (
                <div className="pdf-to-csv__preview-wrap">
                  <table className="pdf-to-csv__preview">
                    <tbody>
                      {result.previewRows.map((row, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`cell-${rowIndex}-${cellIndex}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Adjust layout and
                convert again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and extract tables to CSV here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "PDF to CSV conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
