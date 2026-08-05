"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  deletePdfLimitsHint,
  deletePdfPages,
  describeDeleteResult,
  downloadDeletedPdf,
  loadPdfForDelete,
  parseDeletePageRanges,
  validateDeleteSelection,
  type DeletePdfPage,
  type DeletePdfPagesResult,
} from "@/lib/delete-pdf-pages";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BusyMode = "idle" | "loading" | "exporting";

export default function DeletePdfPages() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const gridId = useId();
  const rangesId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const lastClickedRef = useRef<number | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<DeletePdfPage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rangesText, setRangesText] = useState("");
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<DeletePdfPagesResult | null>(null);

  const pageCount = pages.length;
  const selectedCount = selectedIds.size;
  const isBusy = busy !== "idle";
  const canSelect = pageCount > 0 && !isBusy;
  const keptCount = pageCount - selectedCount;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function clearSelection() {
    setSelectedIds(new Set());
    lastClickedRef.current = null;
  }

  function selectAll() {
    setSelectedIds(new Set(pages.map((page) => page.id)));
  }

  function invertSelection() {
    setSelectedIds((current) => {
      const next = new Set<string>();
      for (const page of pages) {
        if (!current.has(page.id)) next.add(page.id);
      }
      return next;
    });
  }

  function toggleSelect(id: string, event: MouseEvent<HTMLButtonElement>) {
    const index = pages.findIndex((page) => page.id === id);
    if (index < 0) return;

    setSelectedIds((current) => {
      const next = new Set(current);

      if (event.shiftKey && lastClickedRef.current !== null) {
        const from = Math.min(lastClickedRef.current, index);
        const to = Math.max(lastClickedRef.current, index);
        for (let i = from; i <= to; i += 1) {
          next.add(pages[i].id);
        }
        return next;
      }

      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    lastClickedRef.current = index;
  }

  function applyRanges() {
    if (pageCount < 1) {
      setError("Upload a PDF to get started.");
      return;
    }

    const parsed = parseDeletePageRanges(rangesText, pageCount);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }

    const ids = new Set(
      pages
        .filter((page) => parsed.includes(page.sourceIndex))
        .map((page) => page.id),
    );
    setSelectedIds(ids);
    setError("");
    setResult(null);
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSourceFile(file);
    setPages([]);
    clearSelection();
    setRangesText("");
    setError("");
    setProgressText("Reading PDF…");
    setBusy("loading");
    setResult(null);
    sourceBytesRef.current = null;

    try {
      const loaded = await loadPdfForDelete(file, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Loading page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      sourceBytesRef.current = loaded.bytes;
      setPages(loaded.pages);
      setProgressText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not open this PDF. Try another file.";
      setError(message);
      setSourceFile(null);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setBusy("idle");
      }
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    sourceBytesRef.current = null;
    setSourceFile(null);
    setPages([]);
    clearSelection();
    setRangesText("");
    setError("");
    setProgressText("");
    setBusy("idle");
    setResult(null);
  }

  async function handleDeleteAndDownload() {
    const bytes = sourceBytesRef.current;
    if (!bytes || !sourceFile || pageCount < 1) {
      setError("Upload a PDF to get started.");
      return;
    }

    const deleteIndices = pages
      .filter((page) => selectedIds.has(page.id))
      .map((page) => page.sourceIndex);

    const validationError = validateDeleteSelection(pageCount, deleteIndices);
    if (validationError) {
      setError(validationError);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("exporting");
    setError("");
    setProgressText("Removing pages…");
    setResult(null);

    try {
      const deleted = await deletePdfPages(bytes, sourceFile, {
        deleteIndices,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Writing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setResult(deleted);
      downloadDeletedPdf(deleted);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not delete pages. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setBusy("idle");
      }
    }
  }

  function handleDownloadAgain() {
    if (!result) return;
    downloadDeletedPdf(result);
  }

  if (!sourceFile && busy === "idle") {
    return (
      <div className="tool-grid delete-pdf-pages delete-pdf-pages--empty">
        <div className="tool-panel">
          <PdfDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
          />
          <p className="tool-hint">{deletePdfLimitsHint()} · private & local</p>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="tool-panel tool-panel--preview">
          <div className="tool-stage">
            <div className="delete-pdf-pages__empty">
              <p className="tool-placeholder">
                Drop a PDF to select pages and remove them — free, private, and
                local in your browser
              </p>
              <ul
                className="delete-pdf-pages__feature-list"
                aria-label="Delete PDF pages features"
              >
                <li>Click pages to mark them for deletion</li>
                <li>Use ranges like 2, 4-6 for quick selection</li>
                <li>Download a new PDF with the remaining pages</li>
                <li>Text and layout stay intact — no upload</li>
              </ul>
            </div>
          </div>
          <p className="tool-hint">
            Deletion runs in your browser · files never upload to Focera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-pdf-pages">
      <div
        className="delete-pdf-pages__toolbar"
        role="toolbar"
        aria-label="PDF page deletion tools"
      >
        <div className="delete-pdf-pages__toolbar-group">
          <Button
            variant="ghost"
            disabled={!canSelect || selectedCount === pageCount}
            onClick={selectAll}
          >
            Select all
          </Button>
          <Button
            variant="ghost"
            disabled={!canSelect || selectedCount === 0}
            onClick={clearSelection}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            disabled={!canSelect}
            onClick={invertSelection}
          >
            Invert
          </Button>
        </div>
        <div className="delete-pdf-pages__toolbar-group delete-pdf-pages__toolbar-group--end">
          <Button variant="ghost" disabled={isBusy} onClick={handleReset}>
            New file
          </Button>
          <Button
            disabled={!canSelect || selectedCount === 0 || keptCount < 1}
            onClick={() => void handleDeleteAndDownload()}
          >
            {busy === "exporting" ? "Deleting…" : "Delete & download"}
          </Button>
        </div>
      </div>

      <div className="delete-pdf-pages__meta">
        <p className="delete-pdf-pages__meta-title" id={gridId}>
          {sourceFile?.name ?? "PDF"}
        </p>
        <p className="delete-pdf-pages__meta-stats">
          {pageCount} {pageCount === 1 ? "page" : "pages"}
          {sourceFile ? ` · ${formatFileSize(sourceFile.size)}` : ""}
          {selectedCount > 0
            ? ` · ${selectedCount} to delete · ${keptCount} will remain`
            : " · click pages to delete"}
        </p>
      </div>

      <div className="delete-pdf-pages__ranges">
        <label className="ui-label" htmlFor={rangesId}>
          Or select by page numbers
        </label>
        <div className="delete-pdf-pages__ranges-row">
          <input
            id={rangesId}
            className="ui-input"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2, 4-6"
            value={rangesText}
            disabled={!canSelect}
            onChange={(event) => setRangesText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyRanges();
              }
            }}
          />
          <Button
            variant="ghost"
            disabled={!canSelect || !rangesText.trim()}
            onClick={applyRanges}
          >
            Apply
          </Button>
        </div>
      </div>

      {busy === "loading" || busy === "exporting" ? (
        <div
          className="tool-loading delete-pdf-pages__loading"
          role="status"
          aria-live="polite"
        >
          <p>{progressText || (busy === "loading" ? "Loading…" : "Working…")}</p>
        </div>
      ) : (
        <ul
          className="delete-pdf-pages__grid"
          aria-labelledby={gridId}
          aria-multiselectable="true"
        >
          {pages.map((page) => {
            const selected = selectedIds.has(page.id);
            return (
              <li key={page.id}>
                <button
                  type="button"
                  className={cn(
                    "delete-pdf-pages__page",
                    selected && "is-selected",
                  )}
                  disabled={!canSelect}
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? `Page ${page.pageNumber}, marked for deletion`
                      : `Page ${page.pageNumber}`
                  }
                  onClick={(event) => toggleSelect(page.id, event)}
                >
                  <span className="delete-pdf-pages__page-badge" aria-hidden="true">
                    {page.pageNumber}
                  </span>
                  {selected ? (
                    <span
                      className="delete-pdf-pages__page-mark"
                      aria-hidden="true"
                    >
                      Delete
                    </span>
                  ) : null}
                  <span className="delete-pdf-pages__page-frame">
                    {page.thumbUrl ? (
                      // Thumbnail is a local canvas data URL from PDF.js
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbUrl}
                        alt=""
                        className="delete-pdf-pages__page-thumb"
                        draggable={false}
                      />
                    ) : (
                      <span className="delete-pdf-pages__page-blank">Page</span>
                    )}
                  </span>
                  <span className="delete-pdf-pages__page-label">
                    {selected ? "Will be deleted" : `Page ${page.pageNumber}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {result ? (
        <div className="delete-pdf-pages__success" role="status">
          <p className="delete-pdf-pages__success-title">Pages deleted</p>
          <p className="delete-pdf-pages__success-meta">
            {describeDeleteResult(result)}
          </p>
          <Button variant="ghost" onClick={handleDownloadAgain}>
            Download again
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        Tip: click to toggle pages, or hold Shift to select a range. Keep at
        least one page.
      </p>
    </div>
  );
}
