"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  describeSplitResult,
  downloadSplitResult,
  loadPdfInfo,
  SPLIT_MODE_PRESETS,
  splitPdfFile,
  type SplitMode,
  type SplitPdfResult,
  validateSplitOptions,
} from "@/lib/split-pdf";
import { cn } from "@/lib/utils";

function formatPartTitle(label: string): string {
  const single = /^page-(\d+)$/.exec(label);
  if (single) return `Page ${single[1]}`;
  const range = /^pages-(\d+)-(\d+)$/.exec(label);
  if (range) return `Pages ${range[1]}–${range[2]}`;
  return label;
}

export default function SplitPdf() {
  const modeId = useId();
  const rangesId = useId();
  const fixedId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [mode, setMode] = useState<SplitMode>("every");
  const [rangesText, setRangesText] = useState("");
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SplitPdfResult | null>(null);

  const hasSource = Boolean(sourceFile) && pageCount > 0;
  const hasResult = Boolean(result);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSourceFile(file);
    setPageCount(0);
    setResult(null);
    setError("");
    setProgressText("");
    setInspecting(true);
    setRangesText("");
    setPagesPerFile(1);

    try {
      const info = await loadPdfInfo(file, controller.signal);
      if (controller.signal.aborted) return;
      setPageCount(info.pageCount);
      setRangesText(info.pageCount > 1 ? `1-${info.pageCount}` : "1");
      setPagesPerFile(1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not read this PDF. Try another file.";
      setSourceFile(null);
      setPageCount(0);
      setError(message);
    } finally {
      if (abortRef.current === controller) {
        setInspecting(false);
      }
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setSourceFile(null);
    setPageCount(0);
    setResult(null);
    setError("");
    setProgressText("");
    setLoading(false);
    setInspecting(false);
    setRangesText("");
    setPagesPerFile(1);
  }

  async function handleSplit() {
    if (!sourceFile || pageCount < 1) {
      setError("Upload a PDF to get started.");
      return;
    }

    const optionsError = validateSplitOptions(pageCount, {
      mode,
      rangesText,
      pagesPerFile,
    });
    if (optionsError) {
      setError(optionsError);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading PDF…");
    setResult(null);

    try {
      const split = await splitPdfFile(sourceFile, {
        mode,
        rangesText,
        pagesPerFile,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Building file ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setResult(split);
      downloadSplitResult(split);
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Could not split this PDF. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!result) return;
    downloadSplitResult(result);
  }

  const busy = loading || inspecting;

  return (
    <div className="tool-grid split-pdf">
      <div className="tool-panel">
        <PdfDropzone
          onFile={(file) => void handleFile(file)}
          onError={setError}
          disabled={busy}
        />

        {sourceFile ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile.name}</p>
            <p className="upload-meta__size">
              {formatFileSize(sourceFile.size)}
              {pageCount > 0
                ? ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`
                : inspecting
                  ? " · reading…"
                  : ""}
            </p>
          </div>
        ) : null}

        <div className="split-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Split mode
            </span>
            <div
              className="split-pdf__chips"
              role="radiogroup"
              aria-labelledby={modeId}
            >
              {SPLIT_MODE_PRESETS.map((preset) => {
                const selected = mode === preset.mode;
                return (
                  <button
                    key={preset.mode}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "split-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={busy}
                    onClick={() => {
                      setMode(preset.mode);
                      setResult(null);
                      setError("");
                    }}
                  >
                    <span className="split-pdf__chip-label">
                      {preset.label}
                    </span>
                    <span className="split-pdf__chip-hint">{preset.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "ranges" ? (
            <div className="ui-field">
              <label className="ui-label" htmlFor={rangesId}>
                Page ranges
              </label>
              <input
                id={rangesId}
                className="ui-input"
                type="text"
                value={rangesText}
                disabled={busy || !hasSource}
                placeholder="1-3, 5, 8-10"
                onChange={(event) => {
                  setRangesText(event.target.value);
                  setResult(null);
                  setError("");
                }}
              />
              <p className="ui-hint">
                Separate ranges with commas. Each range becomes its own PDF.
              </p>
            </div>
          ) : null}

          {mode === "fixed" ? (
            <div className="ui-field">
              <label className="ui-label" htmlFor={fixedId}>
                Pages per file
              </label>
              <input
                id={fixedId}
                className="ui-input"
                type="number"
                min={1}
                max={Math.max(pageCount, 1)}
                step={1}
                value={pagesPerFile}
                disabled={busy || !hasSource}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setPagesPerFile(Number.isFinite(next) ? next : 1);
                  setResult(null);
                  setError("");
                }}
              />
              <p className="ui-hint">
                Split the PDF into equal chunks of this many pages.
              </p>
            </div>
          ) : null}
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleSplit()}
            disabled={!hasSource || busy}
          >
            {loading ? "Splitting…" : "Split PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult && !sourceFile) || busy}
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${busy ? " is-loading" : ""}`}
        >
          {busy ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {inspecting
                  ? "Reading PDF…"
                  : progressText || "Splitting PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Pages are split locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="split-pdf__success">
              <p className="split-pdf__success-title">Split PDF ready</p>
              <p className="split-pdf__success-meta">
                {result.pageCount}{" "}
                {result.pageCount === 1 ? "page" : "pages"} source ·{" "}
                {describeSplitResult(result)}
              </p>
              <ul className="split-pdf__parts" aria-label="Output files">
                {result.parts.map((part) => (
                  <li key={part.label}>
                    <span className="split-pdf__part-label">
                      {formatPartTitle(part.label)}
                    </span>
                    <span className="split-pdf__part-meta">
                      {part.pageIndices.length}{" "}
                      {part.pageIndices.length === 1 ? "page" : "pages"} ·{" "}
                      {formatFileSize(part.size)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change the mode and
                split again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and split it into separate files here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PDF splitting runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
