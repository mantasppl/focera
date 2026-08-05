"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  describePdfTextResult,
  downloadExtractedPdfText,
  extractTextFromPdf,
  type PdfToTextLayout,
  type PdfToTextResult,
} from "@/lib/pdf-to-text";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

const LAYOUT_OPTIONS: {
  value: PdfToTextLayout;
  label: string;
  hint: string;
}[] = [
  {
    value: "continuous",
    label: "Continuous",
    hint: "Flowing paragraphs",
  },
  {
    value: "pages",
    label: "Page markers",
    hint: "Keep page breaks",
  },
];

export default function PdfToText() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const layoutId = useId();
  const outputId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<PdfToTextLayout>("continuous");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToTextResult | null>(null);
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

  async function handleExtract() {
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
      const extracted = await extractTextFromPdf(sourceFile, {
        layout,
        signal: controller.signal,
        onProgress: (current, total, label) => {
          setProgressText(`${label} ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setResult(extracted);
      setText(extracted.text);
      setProgressText("");
      trackSuccess();

      if (!extracted.text) {
        setError(
          "No extractable text found. This PDF may be scanned — try PDF to JPG, then Image to Text for OCR.",
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
          : "Could not extract text from this PDF. Try a smaller file or another browser.";
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
    downloadExtractedPdfText(text, sourceFile);
    setError("");
  }

  return (
    <div className="tool-grid pdf-to-text">
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

        <div className="pdf-to-text__options">
          <div className="ui-field">
            <span className="ui-label" id={layoutId}>
              Output layout
            </span>
            <div
              className="pdf-to-text__chips"
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
                      "pdf-to-text__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLayout(option.value)}
                  >
                    <span className="pdf-to-text__chip-label">
                      {option.label}
                    </span>
                    <span className="pdf-to-text__chip-hint">
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
            onClick={() => void handleExtract()}
            disabled={!hasSource || loading}
          >
            {loading ? "Extracting…" : "Extract text"}
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
            <Button variant="ghost" onClick={handleDownload}>
              Download .txt
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
                {progressText || "Extracting text…"}
              </span>
              <span className="tool-loading__subtext">
                Extraction runs locally in your browser.
              </span>
            </div>
          ) : hasResult ? (
            <div className="pdf-to-text__result">
              <p className="pdf-to-text__result-meta">
                {describePdfTextResult(result!, text)}
              </p>
              <label className="ui-label" htmlFor={outputId}>
                Extracted text
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea pdf-to-text__textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setCopied(false);
                }}
                rows={14}
                spellCheck
                placeholder="No extractable text was found in this PDF."
              />
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF to extract text here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Edit the text if needed, then copy or download · processed locally"
            : "PDF text extraction runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
