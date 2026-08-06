"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  countRotatedPages,
  describeRotateResult,
  downloadRotatedPdf,
  hasRotations,
  loadPdfForRotate,
  resetPageRotations,
  rotatePage,
  rotatePdfLimitsHint,
  rotatePdfPages,
  type RotatePdfPage,
  type RotatePdfResult,
} from "@/lib/rotate-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BusyMode = "idle" | "loading" | "exporting";

export default function RotatePdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const gridId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const lastClickedRef = useRef<number | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RotatePdfPage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<RotatePdfResult | null>(null);

  const pageCount = pages.length;
  const selectedCount = selectedIds.size;
  const rotatedCount = countRotatedPages(pages);
  const isBusy = busy !== "idle";
  const canEdit = pageCount > 0 && !isBusy;
  const changed = hasRotations(pages);

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

  function targetIds(): string[] {
    if (selectedIds.size > 0) return [...selectedIds];
    return [];
  }

  function handleRotate(direction: 90 | -90 | 180) {
    const ids = targetIds();
    if (ids.length === 0) {
      setError("Select one or more pages to rotate (or Select all).");
      return;
    }

    const idSet = new Set(ids);
    setError("");
    setResult(null);
    setPages((current) =>
      current.map((page) =>
        idSet.has(page.id) ? rotatePage(page, direction) : page,
      ),
    );
  }

  function handleResetRotations() {
    if (!changed) return;
    setError("");
    setResult(null);
    setPages((current) => resetPageRotations(current));
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSourceFile(file);
    setPages([]);
    clearSelection();
    setError("");
    setProgressText("Reading PDF…");
    setBusy("loading");
    setResult(null);
    sourceBytesRef.current = null;

    try {
      const loaded = await loadPdfForRotate(file, {
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
    setError("");
    setProgressText("");
    setBusy("idle");
    setResult(null);
  }

  async function handleDownload() {
    const bytes = sourceBytesRef.current;
    if (!bytes || !sourceFile || pageCount < 1) {
      setError("Upload a PDF to get started.");
      return;
    }

    if (!changed) {
      setError("Rotate at least one page before downloading.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("exporting");
    setError("");
    setProgressText("Rotating pages…");
    setResult(null);

    try {
      const rotated = await rotatePdfPages(bytes, sourceFile, {
        rotations: pages.map((page) => page.rotation),
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Writing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setResult(rotated);
      downloadRotatedPdf(rotated);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not rotate pages. Try a smaller file or another browser.";
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
    downloadRotatedPdf(result);
  }

  if (!sourceFile && busy === "idle") {
    return (
      <div className="tool-grid rotate-pdf rotate-pdf--empty">
        <div className="tool-panel">
          <PdfDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
          />
          <p className="tool-hint">{rotatePdfLimitsHint()} · private & local</p>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="tool-panel tool-panel--preview">
          <div className="tool-stage">
            <div className="rotate-pdf__empty">
              <p className="tool-placeholder">
                Drop a PDF to rotate pages left or right — free, private, and
                local in your browser
              </p>
              <ul
                className="rotate-pdf__feature-list"
                aria-label="Rotate PDF features"
              >
                <li>Select pages, then rotate 90° left or right</li>
                <li>Flip 180° or reset rotations anytime</li>
                <li>Download a new PDF with corrected orientation</li>
                <li>Text and layout stay intact — no upload</li>
              </ul>
            </div>
          </div>
          <p className="tool-hint">
            Rotation runs in your browser · files never upload to Focera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rotate-pdf">
      <div
        className="rotate-pdf__toolbar"
        role="toolbar"
        aria-label="PDF page rotate tools"
      >
        <div className="rotate-pdf__toolbar-group">
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount === pageCount}
            onClick={selectAll}
          >
            Select all
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount === 0}
            onClick={clearSelection}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount === 0}
            onClick={() => handleRotate(-90)}
            aria-label="Rotate selected pages left"
          >
            ↺ Left
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount === 0}
            onClick={() => handleRotate(90)}
            aria-label="Rotate selected pages right"
          >
            ↻ Right
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount === 0}
            onClick={() => handleRotate(180)}
          >
            180°
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || !changed}
            onClick={handleResetRotations}
          >
            Reset
          </Button>
        </div>
        <div className="rotate-pdf__toolbar-group rotate-pdf__toolbar-group--end">
          <Button variant="ghost" disabled={isBusy} onClick={handleReset}>
            New file
          </Button>
          <Button
            disabled={!canEdit || !changed}
            onClick={() => void handleDownload()}
          >
            {busy === "exporting" ? "Saving…" : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="rotate-pdf__meta">
        <p className="rotate-pdf__meta-title" id={gridId}>
          {sourceFile?.name ?? "PDF"}
        </p>
        <p className="rotate-pdf__meta-stats">
          {pageCount} {pageCount === 1 ? "page" : "pages"}
          {sourceFile ? ` · ${formatFileSize(sourceFile.size)}` : ""}
          {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
          {rotatedCount > 0
            ? ` · ${rotatedCount} rotated`
            : " · select pages, then rotate"}
        </p>
      </div>

      {busy === "loading" || busy === "exporting" ? (
        <div
          className="tool-loading rotate-pdf__loading"
          role="status"
          aria-live="polite"
        >
          <p>{progressText || (busy === "loading" ? "Loading…" : "Working…")}</p>
        </div>
      ) : (
        <ul
          className="rotate-pdf__grid"
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
                    "rotate-pdf__page",
                    selected && "is-selected",
                    page.rotation !== 0 && "is-rotated",
                  )}
                  disabled={!canEdit}
                  aria-pressed={selected}
                  aria-label={
                    page.rotation
                      ? `Page ${page.pageNumber}, rotated ${page.rotation} degrees`
                      : `Page ${page.pageNumber}`
                  }
                  onClick={(event) => toggleSelect(page.id, event)}
                >
                  <span className="rotate-pdf__page-badge" aria-hidden="true">
                    {page.pageNumber}
                  </span>
                  {page.rotation !== 0 ? (
                    <span
                      className="rotate-pdf__page-mark"
                      aria-hidden="true"
                    >
                      {page.rotation}°
                    </span>
                  ) : null}
                  <span className="rotate-pdf__page-frame">
                    {page.thumbUrl ? (
                      // Thumbnail is a local canvas data URL from PDF.js
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbUrl}
                        alt=""
                        className="rotate-pdf__page-thumb"
                        style={{
                          transform: page.rotation
                            ? `rotate(${page.rotation}deg)`
                            : undefined,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <span className="rotate-pdf__page-blank">Page</span>
                    )}
                  </span>
                  <span className="rotate-pdf__page-label">
                    {page.rotation
                      ? `Rotated ${page.rotation}°`
                      : `Page ${page.pageNumber}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {result ? (
        <div className="rotate-pdf__success" role="status">
          <p className="rotate-pdf__success-title">PDF rotated</p>
          <p className="rotate-pdf__success-meta">
            {describeRotateResult(result)}
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
        Tip: click to select pages, hold Shift for a range, then use ↺ / ↻ or
        180°. Reset clears all rotations.
      </p>
    </div>
  );
}
