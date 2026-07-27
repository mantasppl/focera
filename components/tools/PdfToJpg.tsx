"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertPdfToJpgPages,
  downloadAllPagesZip,
  downloadPageJpeg,
  revokeConvertedPages,
  type ConvertedPage,
  type PdfQuality,
  type PdfScale,
} from "@/lib/pdf-to-jpg";
import { cn } from "@/lib/utils";

const QUALITY_OPTIONS: { value: PdfQuality; label: string; hint: string }[] = [
  { value: 0.7, label: "Smaller", hint: "Faster downloads" },
  { value: 0.85, label: "Balanced", hint: "Good default" },
  { value: 0.95, label: "High", hint: "Sharper detail" },
];

const SCALE_OPTIONS: { value: PdfScale; label: string; hint: string }[] = [
  { value: 1, label: "1×", hint: "Standard" },
  { value: 1.5, label: "1.5×", hint: "Recommended" },
  { value: 2, label: "2×", hint: "Print-ready" },
];

export default function PdfToJpg() {
  const qualityId = useId();
  const scaleId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const pagesRef = useRef<ConvertedPage[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [quality, setQuality] = useState<PdfQuality>(0.85);
  const [scale, setScale] = useState<PdfScale>(1.5);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasPages = pages.length > 0;
  const activePage =
    pages.find((page) => page.pageNumber === selectedPage) ?? pages[0] ?? null;

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeConvertedPages(pagesRef.current);
    };
  }, []);

  function clearPages() {
    setPages((current) => {
      revokeConvertedPages(current);
      return [];
    });
    setSelectedPage(1);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearPages();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearPages();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
    setZipping(false);
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
    clearPages();

    try {
      const converted = await convertPdfToJpgPages(sourceFile, {
        quality,
        scale,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Converting page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) {
        revokeConvertedPages(converted);
        return;
      }

      setPages(converted);
      setSelectedPage(converted[0]?.pageNumber ?? 1);
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

  function handleDownloadPage() {
    if (!sourceFile || !activePage) return;
    downloadPageJpeg(activePage, fileBaseName(sourceFile));
  }

  async function handleDownloadAll() {
    if (!sourceFile || !hasPages) return;
    setZipping(true);
    setError("");
    try {
      await downloadAllPagesZip(pages, fileBaseName(sourceFile));
    } catch {
      setError("Could not create the ZIP download. Try downloading pages one by one.");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="tool-grid pdf-to-jpg">
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

        <div className="pdf-to-jpg__options">
          <div className="ui-field">
            <span className="ui-label" id={qualityId}>
              JPEG quality
            </span>
            <div
              className="pdf-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={qualityId}
            >
              {QUALITY_OPTIONS.map((option) => {
                const selected = quality === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setQuality(option.value)}
                  >
                    <span className="pdf-to-jpg__chip-label">{option.label}</span>
                    <span className="pdf-to-jpg__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={scaleId}>
              Resolution
            </span>
            <div
              className="pdf-to-jpg__chips"
              role="radiogroup"
              aria-labelledby={scaleId}
            >
              {SCALE_OPTIONS.map((option) => {
                const selected = scale === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "pdf-to-jpg__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setScale(option.value)}
                  >
                    <span className="pdf-to-jpg__chip-label">{option.label}</span>
                    <span className="pdf-to-jpg__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button onClick={() => void handleConvert()} disabled={!hasSource || loading}>
            {loading ? "Converting…" : "Convert to JPG"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasPages) || loading}
          >
            Start over
          </Button>
        </div>

        {hasPages ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadPage} disabled={!activePage || zipping}>
              Download page
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleDownloadAll()}
              disabled={zipping}
            >
              {zipping ? "Preparing ZIP…" : "Download all (ZIP)"}
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
          className={`tool-stage${hasPages ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Converting PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Pages are rendered locally in your browser.
              </span>
            </div>
          ) : activePage ? (
            <div className="preview-single">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePage.url}
                alt={`Converted page ${activePage.pageNumber}`}
                className="preview-single__image pdf-to-jpg__preview-image"
              />
              <p className="tool-placeholder preview-single__hint">
                Page {activePage.pageNumber} of {pages.length} ·{" "}
                {activePage.width}×{activePage.height}px ·{" "}
                {formatFileSize(activePage.blob.size)}
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and convert it to preview JPG pages here
            </p>
          )}
        </div>

        {hasPages ? (
          <div className="pdf-to-jpg__thumbs" role="list" aria-label="Converted pages">
            {pages.map((page) => {
              const selected = page.pageNumber === activePage?.pageNumber;
              return (
                <button
                  key={page.pageNumber}
                  type="button"
                  role="listitem"
                  className={cn(
                    "pdf-to-jpg__thumb",
                    selected && "is-active",
                  )}
                  onClick={() => setSelectedPage(page.pageNumber)}
                  aria-pressed={selected}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.url}
                    alt=""
                    className="pdf-to-jpg__thumb-image"
                  />
                  <span className="pdf-to-jpg__thumb-label">
                    Page {page.pageNumber}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="tool-hint">
          {hasPages
            ? "Download one page or a ZIP of every JPG · processed locally"
            : "PDF to JPG conversion runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
