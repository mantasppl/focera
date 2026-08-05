"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  COMPRESS_PRESETS,
  compressPdfFile,
  describeSavings,
  downloadCompressedPdf,
  type CompressLevel,
  type CompressPdfResult,
} from "@/lib/compress-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function CompressPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const levelId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("balanced");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setPreviewUrl(null);
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

  async function handleCompress() {
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
      const compressed = await compressPdfFile(sourceFile, {
        level,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Compressing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(compressed.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(compressed);
      downloadCompressedPdf(compressed.blob, sourceFile);
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
          : "Could not compress this PDF. Try a smaller file or another browser.";
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
    downloadCompressedPdf(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid compress-pdf">
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

        <div className="compress-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={levelId}>
              Compression level
            </span>
            <div
              className="compress-pdf__chips"
              role="radiogroup"
              aria-labelledby={levelId}
            >
              {COMPRESS_PRESETS.map((preset) => {
                const selected = level === preset.level;
                return (
                  <button
                    key={preset.level}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "compress-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLevel(preset.level)}
                  >
                    <span className="compress-pdf__chip-label">
                      {preset.label}
                    </span>
                    <span className="compress-pdf__chip-hint">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleCompress()}
            disabled={!hasSource || loading}
          >
            {loading ? "Compressing…" : "Compress PDF"}
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
                {progressText || "Compressing PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Pages are compressed locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="compress-pdf__success">
              <p className="compress-pdf__success-title">Compressed PDF ready</p>
              <p className="compress-pdf__success-meta">
                {result.pageCount}{" "}
                {result.pageCount === 1 ? "page" : "pages"} ·{" "}
                {describeSavings(
                  result.originalSize,
                  result.compressedSize,
                  result.savingsPercent,
                )}
              </p>
              <ul className="compress-pdf__stats" aria-label="Size comparison">
                <li>
                  <span className="compress-pdf__stat-label">Original</span>
                  <span className="compress-pdf__stat-value">
                    {formatFileSize(result.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="compress-pdf__stat-label">Compressed</span>
                  <span className="compress-pdf__stat-value">
                    {formatFileSize(result.compressedSize)}
                  </span>
                </li>
                <li>
                  <span className="compress-pdf__stat-label">Saved</span>
                  <span
                    className={cn(
                      "compress-pdf__stat-value",
                      result.savingsPercent > 0 && "is-positive",
                      result.savingsPercent < 0 && "is-muted",
                    )}
                  >
                    {result.savingsPercent > 0
                      ? `${result.savingsPercent}%`
                      : "—"}
                  </span>
                </li>
              </ul>
              {previewUrl ? (
                <iframe
                  title="Compressed PDF preview"
                  src={previewUrl}
                  className="compress-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Your download should start automatically. Change the level and
                compress again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and compress it to shrink the file size here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download again anytime · processed locally"
            : "PDF compression runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
