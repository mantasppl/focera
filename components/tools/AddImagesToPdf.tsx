"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import PdfDropzone from "@/components/tools/PdfDropzone";
import PngToPdfDropzone from "@/components/tools/PngToPdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  IMAGE_PDF_PLACEMENTS,
  MAX_PNG_FILES,
  addImagesToPdf,
  describeAddImagesResult,
  downloadPdfWithImages,
  getPdfPageCount,
  pageSizeLabel,
  type AddImagesToPdfResult,
  type ImagePdfMargin,
  type ImagePdfPageSize,
  type ImagePdfPlacement,
} from "@/lib/add-images-to-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

const PAGE_OPTIONS: {
  value: ImagePdfPageSize;
  label: string;
  hint: string;
}[] = [
  { value: "fit", label: "Fit", hint: "Page matches image" },
  { value: "a4", label: "A4", hint: "Standard international" },
  { value: "letter", label: "Letter", hint: "US letter size" },
];

const MARGIN_OPTIONS: {
  value: ImagePdfMargin;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "None", hint: "Edge to edge" },
  { value: "small", label: "Small", hint: "Light padding" },
  { value: "medium", label: "Medium", hint: "Print-friendly" },
];

function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function AddImagesToPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const placementId = useId();
  const afterPageId = useId();
  const pageSizeId = useId();
  const marginId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [placement, setPlacement] = useState<ImagePdfPlacement>("end");
  const [afterPage, setAfterPage] = useState(1);
  const [pageSize, setPageSize] = useState<ImagePdfPageSize>("fit");
  const [margin, setMargin] = useState<ImagePdfMargin>("small");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AddImagesToPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const canApply = Boolean(pdfFile && fileCount > 0);
  const hasResult = Boolean(result);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const showMargin = pageSize !== "fit";
  const showAfterPage = placement === "after";

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

  async function handlePdfFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setPdfFile(file);
    setPdfPageCount(null);

    try {
      const count = await getPdfPageCount(file);
      setPdfPageCount(count);
      setAfterPage((current) => Math.min(Math.max(1, current), count));
    } catch (err) {
      setPdfFile(null);
      setPdfPageCount(null);
      setError(
        err instanceof Error ? err.message : "Could not read this PDF.",
      );
    }
  }

  function handleAddFiles(incoming: File[]) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setEntries((current) => [...current, ...createEntries(incoming)]);
  }

  function handleRemove(id: string) {
    clearResult();
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleMove(id: string, direction: -1 | 1) {
    clearResult();
    setEntries((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setPdfFile(null);
    setPdfPageCount(null);
    setEntries([]);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleApply() {
    if (!pdfFile || fileCount === 0) {
      setError("Upload a PDF and at least one image to get started.");
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
      const updated = await addImagesToPdf(pdfFile, files, {
        placement,
        afterPage,
        pageSize,
        margin,
        signal: controller.signal,
        onProgress: (current, total) => {
          if (current === 0) {
            setProgressText("Preparing files…");
            return;
          }
          if (current >= total) {
            setProgressText("Saving PDF…");
            return;
          }
          setProgressText(`Adding image ${current} of ${total - 1}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(updated.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(updated);
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
          : "Could not add images to this PDF. Try another file or browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownload() {
    if (!pdfFile || !result) return;
    downloadPdfWithImages(result.blob, pdfFile);
  }

  return (
    <ImageEditorShell
      className="add-images-to-pdf"
      hasSource={canApply}
      stageReady={hasResult}
      loading={loading}
      loadingText={progressText || "Adding images…"}
      loadingSubtext="Your PDF and images stay on this device."
      previewTitle="Preview"
      previewMeta={
        hasResult && result
          ? `${describeAddImagesResult(result)} · ${pageSizeLabel(result.pageSize)}`
          : canApply
            ? `${pdfFile!.name} · ${fileCount} image${fileCount === 1 ? "" : "s"}`
            : "Upload a PDF and images to start"
      }
      previewHint={canApply && !hasResult ? "Click Add images" : undefined}
      privacyHint={
        hasResult
          ? "Processed locally on your device"
          : "Images become new PDF pages · files never upload to Focera"
      }
      sidebar={
        <>
        <div className="ui-field">
          <span className="ui-label">PDF document</span>
          <PdfDropzone
            onFile={(file) => void handlePdfFile(file)}
            onError={setError}
            disabled={loading}
          />
        </div>

        {pdfFile ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{pdfFile.name}</p>
            <p className="upload-meta__size">
              {formatFileSize(pdfFile.size)}
              {pdfPageCount != null
                ? ` · ${pdfPageCount} page${pdfPageCount === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
        ) : null}

        <div className="ui-field">
          <span className="ui-label">Images to add</span>
          <PngToPdfDropzone
            existingFiles={files}
            onFiles={handleAddFiles}
            onError={setError}
            disabled={loading || fileCount >= MAX_PNG_FILES}
          />
        </div>

        {fileCount > 0 ? (
          <div className="add-images-to-pdf__list-wrap">
            <div className="add-images-to-pdf__list-header">
              <p className="add-images-to-pdf__list-title" id={listId}>
                Image order ({fileCount})
              </p>
              <p className="add-images-to-pdf__list-meta">
                {formatFileSize(totalBytes)} total
              </p>
            </div>
            <ol className="add-images-to-pdf__list" aria-labelledby={listId}>
              {entries.map((entry, index) => (
                <li key={entry.id} className="add-images-to-pdf__item">
                  <span className="add-images-to-pdf__index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="add-images-to-pdf__file">
                    <p className="add-images-to-pdf__name">{entry.file.name}</p>
                    <p className="add-images-to-pdf__size">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <div className="add-images-to-pdf__item-actions">
                    <button
                      type="button"
                      className="add-images-to-pdf__icon-btn"
                      aria-label={`Move ${entry.file.name} up`}
                      disabled={loading || index === 0}
                      onClick={() => handleMove(entry.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="add-images-to-pdf__icon-btn"
                      aria-label={`Move ${entry.file.name} down`}
                      disabled={loading || index === fileCount - 1}
                      onClick={() => handleMove(entry.id, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "add-images-to-pdf__icon-btn",
                        "add-images-to-pdf__icon-btn--danger",
                      )}
                      aria-label={`Remove ${entry.file.name}`}
                      disabled={loading}
                      onClick={() => handleRemove(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="add-images-to-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={placementId}>
              Insert where
            </span>
            <div
              className="add-images-to-pdf__chips"
              role="radiogroup"
              aria-labelledby={placementId}
            >
              {IMAGE_PDF_PLACEMENTS.map((option) => {
                const selected = placement === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "add-images-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setPlacement(option.value);
                      clearResult();
                    }}
                  >
                    <span className="add-images-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-images-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showAfterPage ? (
            <div className="ui-field">
              <label className="ui-label" htmlFor={afterPageId}>
                Insert after page
              </label>
              <input
                id={afterPageId}
                className="ui-input"
                type="number"
                min={1}
                max={pdfPageCount ?? undefined}
                step={1}
                value={afterPage}
                disabled={loading || pdfPageCount == null}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  setAfterPage(Math.max(1, Math.floor(next)));
                  clearResult();
                }}
              />
              {pdfPageCount != null ? (
                <p className="tool-hint">
                  PDF has {pdfPageCount} page{pdfPageCount === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="ui-field">
            <span className="ui-label" id={pageSizeId}>
              Image page size
            </span>
            <div
              className="add-images-to-pdf__chips"
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
                      "add-images-to-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => {
                      setPageSize(option.value);
                      clearResult();
                    }}
                  >
                    <span className="add-images-to-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="add-images-to-pdf__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showMargin ? (
            <div className="ui-field">
              <span className="ui-label" id={marginId}>
                Margin
              </span>
              <div
                className="add-images-to-pdf__chips"
                role="radiogroup"
                aria-labelledby={marginId}
              >
                {MARGIN_OPTIONS.map((option) => {
                  const selected = margin === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        "add-images-to-pdf__chip",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        setMargin(option.value);
                        clearResult();
                      }}
                    >
                      <span className="add-images-to-pdf__chip-label">
                        {option.label}
                      </span>
                      <span className="add-images-to-pdf__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        </>
      }
      sidebarFooter={
        <>
          <div className="tool-actions">
            <Button
              onClick={() => void handleApply()}
              disabled={!canApply || loading}
            >
              {loading ? "Adding…" : "Add images"}
            </Button>
            {hasResult ? (
              <Button onClick={handleDownload} disabled={loading}>
                Download PDF
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={(!pdfFile && fileCount === 0 && !hasResult) || loading}
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
      {hasResult && result ? (
        <div className="image-editor-shell__result add-images-to-pdf__success">
          <p className="image-editor-shell__result-meta add-images-to-pdf__success-meta">
            {describeAddImagesResult(result)} · {pageSizeLabel(result.pageSize)}
          </p>
          {previewUrl ? (
            <iframe
              title="PDF with images preview"
              src={previewUrl}
              className="add-images-to-pdf__preview"
            />
          ) : null}
        </div>
      ) : null}
    </ImageEditorShell>
  );
}
