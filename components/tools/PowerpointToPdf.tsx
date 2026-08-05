"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PowerpointDropzone from "@/components/tools/PowerpointDropzone";
import { formatFileSize } from "@/lib/image";
import {
  convertPowerpointToPdf,
  describeOutput,
  downloadPdfFile,
  revokePowerpointToPdfResult,
  type PowerpointPdfPageSize,
  type PowerpointToPdfResult,
} from "@/lib/powerpoint-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const PAGE_OPTIONS: {
  value: PowerpointPdfPageSize;
  label: string;
  hint: string;
}[] = [
  {
    value: "widescreen",
    label: "Widescreen",
    hint: "16:9 presentation",
  },
  {
    value: "a4",
    label: "A4",
    hint: "Landscape paper",
  },
  {
    value: "letter",
    label: "Letter",
    hint: "US landscape",
  },
];

export default function PowerpointToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const pageSizeId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PowerpointToPdfResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<PowerpointPdfPageSize>("widescreen");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PowerpointToPdfResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePowerpointToPdfResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokePowerpointToPdfResult(current);
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
      setError("Upload a PowerPoint (.pptx) file to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PowerPoint…");
    clearResult();

    try {
      const converted = await convertPowerpointToPdf(sourceFile, {
        pageSize,
        signal: controller.signal,
        onProgress: (label) => {
          setProgressText(label);
        },
      });

      if (controller.signal.aborted) {
        revokePowerpointToPdfResult(converted);
        return;
      }

      setResult(converted);
      downloadPdfFile(converted.blob, sourceFile);
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
          : "Could not convert this PowerPoint file. Try a smaller presentation or another browser.";
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
    downloadPdfFile(result.blob, sourceFile);
  }

  const pageSizeLabel =
    pageSize === "widescreen"
      ? "Widescreen"
      : pageSize === "a4"
        ? "A4 landscape"
        : "Letter landscape";

  return (
    <div className="tool-grid powerpoint-to-pdf">
      <div className="tool-panel">
        <PowerpointDropzone
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

        <div className="powerpoint-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={pageSizeId}>
              Page size
            </span>
            <div
              className="powerpoint-to-pdf__chips"
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
                      "powerpoint-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPageSize(option.value)}
                  >
                    <span className="powerpoint-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="powerpoint-to-pdf__chip-hint">
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
                {progressText || "Converting PowerPoint…"}
              </span>
              <span className="tool-loading__subtext">
                Conversion runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="powerpoint-to-pdf__success">
              <p className="powerpoint-to-pdf__success-title">PDF ready</p>
              <p className="powerpoint-to-pdf__success-meta">
                {describeOutput(result)} · {pageSizeLabel}
              </p>
              <ul
                className="powerpoint-to-pdf__stats"
                aria-label="Conversion summary"
              >
                <li>
                  <span className="powerpoint-to-pdf__stat-label">Slides</span>
                  <span className="powerpoint-to-pdf__stat-value">
                    {result.slideCount}
                  </span>
                </li>
                <li>
                  <span className="powerpoint-to-pdf__stat-label">Words</span>
                  <span className="powerpoint-to-pdf__stat-value">
                    {result.wordCount.toLocaleString()}
                  </span>
                </li>
                <li>
                  <span className="powerpoint-to-pdf__stat-label">PDF size</span>
                  <span className="powerpoint-to-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {result.previewText ? (
                <pre className="powerpoint-to-pdf__preview" tabIndex={0}>
                  {result.previewText}
                </pre>
              ) : null}
              {result.warnings.length > 0 ? (
                <p className="tool-placeholder preview-single__hint">
                  Some styling or media could not be preserved exactly. Complex
                  slides may look different from PowerPoint.
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
              Upload a PowerPoint (.pptx) file and convert it to PDF here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PowerPoint to PDF conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
