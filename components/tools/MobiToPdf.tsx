"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import MobiDropzone from "@/components/tools/MobiDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertMobiToPdf,
  describeMobiOutput,
  downloadMobiPdfFile,
  revokeMobiToPdfResult,
  type MobiPdfPageSize,
  type MobiToPdfResult,
} from "@/lib/mobi-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const PAGE_OPTIONS: {
  value: MobiPdfPageSize;
  label: string;
  hint: string;
}[] = [
  {
    value: "a4",
    label: "A4",
    hint: "Standard international",
  },
  {
    value: "letter",
    label: "Letter",
    hint: "US letter size",
  },
];

export default function MobiToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const pageSizeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<MobiToPdfResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<MobiPdfPageSize>("a4");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<MobiToPdfResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeMobiToPdfResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokeMobiToPdfResult(current);
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
      setError("Upload a MOBI file to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading ebook…");
    clearResult();

    try {
      const converted = await convertMobiToPdf(sourceFile, {
        pageSize,
        signal: controller.signal,
        onProgress: (label) => {
          setProgressText(label);
        },
      });

      if (controller.signal.aborted) {
        revokeMobiToPdfResult(converted);
        return;
      }

      setResult(converted);
      downloadMobiPdfFile(converted.blob, sourceFile);
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
          : "Could not convert this ebook. Try a smaller book or another browser.";
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
    downloadMobiPdfFile(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid epub-to-pdf">
      <div className="tool-panel">
        <MobiDropzone
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

        <div className="epub-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={pageSizeId}>
              Page size
            </span>
            <div
              className="epub-to-pdf__chips"
              role="radiogroup"
              aria-labelledby={pageSizeId}
            >
              {PAGE_OPTIONS.map((option) => {
                const selected = pageSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "epub-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPageSize(option.value)}
                  >
                    <span className="epub-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="epub-to-pdf__chip-hint">
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
            {loading ? "Converting…" : "Convert to PDF"}
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
                {progressText || "Converting MOBI…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="epub-to-pdf__success">
              <p className="epub-to-pdf__success-title">PDF ready</p>
              <p className="epub-to-pdf__success-meta">
                {result.title ? `${result.title} · ` : ""}
                {describeMobiOutput(result)} ·{" "}
                {result.pageSize === "a4" ? "A4" : "Letter"}
              </p>
              <ul className="epub-to-pdf__stats" aria-label="Conversion summary">
                <li>
                  <span className="epub-to-pdf__stat-label">Chapters</span>
                  <span className="epub-to-pdf__stat-value">
                    {result.chapterCount}
                  </span>
                </li>
                <li>
                  <span className="epub-to-pdf__stat-label">Pages</span>
                  <span className="epub-to-pdf__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="epub-to-pdf__stat-label">PDF size</span>
                  <span className="epub-to-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewText ? (
                <pre className="epub-to-pdf__preview" tabIndex={0}>
                  {result.previewText}
                </pre>
              ) : null}
              {result.warnings.length > 0 ? (
                <p className="tool-placeholder preview-single__hint">
                  Some chapters or styles could not be preserved exactly.
                  Complex or fixed-layout Kindles may look different in the PDF.
                </p>
              ) : (
                <p className="tool-placeholder preview-single__hint">
                  Your download should start automatically. Change page size and
                  convert again anytime.
                </p>
              )}
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a MOBI file and convert it to PDF here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "MOBI to PDF conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
