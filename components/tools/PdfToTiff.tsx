"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  convertPdfToTiffPages,
  downloadAllPagesZip,
  downloadMultipageTiff,
  revokeConvertedPages,
  type ConvertedTiffPage,
  type PdfScale,
} from "@/lib/pdf-to-tiff";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS: { value: PdfScale; label: string; hint: string }[] = [
  { value: 1, label: "1×", hint: "Standard" },
  { value: 1.5, label: "1.5×", hint: "Recommended" },
  { value: 2, label: "2×", hint: "Print-ready" },
];

export default function PdfToTiff() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const scaleId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const pagesRef = useRef<ConvertedTiffPage[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ConvertedTiffPage[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [scale, setScale] = useState<PdfScale>(1.5);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [zipping, setZipping] = useState(false);

  const hasSource = Boolean(sourceFile);
  const hasPages = pages.length > 0;
  const activePage =
    pages.find((page) => page.pageNumber === selectedPage) ?? pages[0] ?? null;

  const {
    formatOpen,
    setFormatOpen,
    downloading: formatDownloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => activePage?.blob ?? null,
    getFilename: () =>
      sourceFile && activePage
        ? `${fileBaseName(sourceFile)}-page-${activePage.pageNumber}`
        : null,
  });

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
      const converted = await convertPdfToTiffPages(sourceFile, {
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

  function handleDownloadMultipage() {
    if (!sourceFile || !hasPages) return;
    setError("");
    try {
      downloadMultipageTiff(pages, fileBaseName(sourceFile));
    } catch {
      setError("Could not create the multipage TIFF. Try downloading pages one by one.");
    }
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
    <>
      <ImageEditorShell
        className="pdf-to-tiff"
        hasSource={hasSource}
        stageReady={hasPages}
        loading={loading}
        loadingText={progressText || "Converting PDF…"}
        loadingSubtext="Pages are rendered locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasPages && activePage
            ? `Page ${activePage.pageNumber} of ${pages.length} · ${activePage.width}×${activePage.height}px`
            : hasSource
              ? sourceFile?.name
              : "Upload a PDF to start"
        }
        previewHint={
          hasSource && !hasPages ? "Click Convert to TIFF" : undefined
        }
        privacyHint={
          hasPages
            ? pages.length > 1
              ? "Download one page, a multipage TIFF, or a ZIP · processed locally"
              : "Download the TIFF page · processed locally"
            : "PDF to TIFF conversion runs in your browser · files never upload to Focera"
        }
        sidebar={
          <>
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

            <div className="pdf-to-tiff__options">
              <div className="ui-field">
                <span className="ui-label" id={scaleId}>
                  Resolution
                </span>
                <div
                  className="pdf-to-tiff__chips"
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
                          "pdf-to-tiff__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setScale(option.value)}
                      >
                        <span className="pdf-to-tiff__chip-label">{option.label}</span>
                        <span className="pdf-to-tiff__chip-hint">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button onClick={() => void handleConvert()} disabled={!hasSource || loading}>
                {loading ? "Converting…" : "Convert to TIFF"}
              </Button>
              {hasPages ? (
                <>
                  <Button
                    onClick={openDownload}
                    disabled={!activePage || zipping || formatDownloading}
                  >
                    Download
                  </Button>
                  {pages.length > 1 ? (
                    <Button
                      onClick={handleDownloadMultipage}
                      disabled={zipping}
                    >
                      Download multipage TIFF
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    onClick={() => void handleDownloadAll()}
                    disabled={zipping}
                  >
                    {zipping ? "Preparing ZIP…" : "Download all (ZIP)"}
                  </Button>
                </>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={(!hasSource && !hasPages) || loading}
              >
                Start over
              </Button>
            </div>
            {error ? (
              <p className="tool-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        }
      >
        {hasPages && activePage ? (
          <div className="image-editor-shell__result pdf-to-tiff__preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePage.url}
              alt={`Converted page ${activePage.pageNumber}`}
              className="preview-single__image pdf-to-tiff__preview-image"
            />
            <p className="image-editor-shell__result-meta">
              {formatFileSize(activePage.blob.size)} TIFF
            </p>
            {pages.length > 1 ? (
              <div className="pdf-to-tiff__thumbs" role="list" aria-label="Converted pages">
                {pages.map((page) => {
                  const selected = page.pageNumber === activePage.pageNumber;
                  return (
                    <button
                      key={page.pageNumber}
                      type="button"
                      role="listitem"
                      className={cn(
                        "pdf-to-tiff__thumb",
                        selected && "is-active",
                      )}
                      onClick={() => setSelectedPage(page.pageNumber)}
                      aria-pressed={selected}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.url}
                        alt=""
                        className="pdf-to-tiff__thumb-image"
                      />
                      <span className="pdf-to-tiff__thumb-label">
                        Page {page.pageNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={formatDownloading}
        error={downloadError}
      />
    </>
  );
}
