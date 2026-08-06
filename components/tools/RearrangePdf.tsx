"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  describeRearrangeResult,
  downloadRearrangedPdf,
  isPageOrderChanged,
  loadPdfForRearrange,
  moveRearrangePage,
  rearrangePdfLimitsHint,
  rearrangePdfPages,
  reorderRearrangePages,
  type RearrangePdfPage,
  type RearrangePdfResult,
} from "@/lib/rearrange-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BusyMode = "idle" | "loading" | "exporting";

export default function RearrangePdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const gridId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const originalOrderRef = useRef<RearrangePdfPage[]>([]);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RearrangePdfPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<RearrangePdfResult | null>(null);

  const pageCount = pages.length;
  const isBusy = busy !== "idle";
  const canEdit = pageCount > 1 && !isBusy;
  const orderChanged = isPageOrderChanged(pages);
  const selectedIndex = selectedId
    ? pages.findIndex((page) => page.id === selectedId)
    : -1;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function selectPage(id: string, event?: MouseEvent<HTMLButtonElement>) {
    if (event && (event.metaKey || event.ctrlKey)) {
      setSelectedId((current) => (current === id ? null : id));
      return;
    }
    setSelectedId(id);
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSourceFile(file);
    setPages([]);
    originalOrderRef.current = [];
    setSelectedId(null);
    setDragOverId(null);
    setError("");
    setProgressText("Reading PDF…");
    setBusy("loading");
    setResult(null);
    sourceBytesRef.current = null;

    try {
      const loaded = await loadPdfForRearrange(file, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Loading page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      sourceBytesRef.current = loaded.bytes;
      originalOrderRef.current = loaded.pages;
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
    originalOrderRef.current = [];
    setSourceFile(null);
    setPages([]);
    setSelectedId(null);
    setDragOverId(null);
    setError("");
    setProgressText("");
    setBusy("idle");
    setResult(null);
  }

  function handleRestoreOrder() {
    if (originalOrderRef.current.length === 0) return;
    setPages([...originalOrderRef.current]);
    setSelectedId(null);
    setError("");
    setResult(null);
  }

  function handleMoveSelected(direction: -1 | 1) {
    if (!selectedId) {
      setError("Select a page to move with the arrows.");
      return;
    }
    setError("");
    setResult(null);
    setPages((current) => moveRearrangePage(current, selectedId, direction));
  }

  function onPageDragStart(id: string) {
    dragIdRef.current = id;
    setSelectedId(id);
  }

  function onPageDragOver(event: DragEvent<HTMLElement>, id: string) {
    event.preventDefault();
    if (dragIdRef.current && dragIdRef.current !== id) {
      setDragOverId(id);
    }
  }

  function onPageDrop(id: string) {
    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    setDragOverId(null);
    if (!fromId || fromId === id) return;
    setError("");
    setResult(null);
    setPages((current) => reorderRearrangePages(current, fromId, id));
    setSelectedId(fromId);
  }

  function onPageDragEnd() {
    dragIdRef.current = null;
    setDragOverId(null);
  }

  async function handleDownload() {
    const bytes = sourceBytesRef.current;
    if (!bytes || !sourceFile || pageCount < 1) {
      setError("Upload a PDF to get started.");
      return;
    }

    if (!orderChanged) {
      setError("Move at least one page before downloading.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("exporting");
    setError("");
    setProgressText("Rearranging pages…");
    setResult(null);

    try {
      const rearranged = await rearrangePdfPages(bytes, sourceFile, {
        orderedIndices: pages.map((page) => page.sourceIndex),
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Writing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setResult(rearranged);
      downloadRearrangedPdf(rearranged);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not rearrange pages. Try a smaller file or another browser.";
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
    downloadRearrangedPdf(result);
  }

  if (!sourceFile && busy === "idle") {
    return (
      <div className="tool-grid rearrange-pdf rearrange-pdf--empty">
        <div className="tool-panel">
          <PdfDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
          />
          <p className="tool-hint">{rearrangePdfLimitsHint()} · private & local</p>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="tool-panel tool-panel--preview">
          <div className="tool-stage">
            <div className="rearrange-pdf__empty">
              <p className="tool-placeholder">
                Drop a PDF to drag pages into a new order — free, private, and
                local in your browser
              </p>
              <ul
                className="rearrange-pdf__feature-list"
                aria-label="Rearrange PDF features"
              >
                <li>Drag thumbnails to reorder pages</li>
                <li>Use ↑ / ↓ for precise moves</li>
                <li>Download a new PDF in your chosen order</li>
                <li>Text and layout stay intact — no upload</li>
              </ul>
            </div>
          </div>
          <p className="tool-hint">
            Rearranging runs in your browser · files never upload to Focera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rearrange-pdf">
      <div
        className="rearrange-pdf__toolbar"
        role="toolbar"
        aria-label="PDF page rearrange tools"
      >
        <div className="rearrange-pdf__toolbar-group">
          <Button
            variant="ghost"
            disabled={!canEdit || selectedIndex <= 0}
            onClick={() => handleMoveSelected(-1)}
            aria-label="Move selected page earlier"
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedIndex < 0 || selectedIndex >= pageCount - 1}
            onClick={() => handleMoveSelected(1)}
            aria-label="Move selected page later"
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || !orderChanged}
            onClick={handleRestoreOrder}
          >
            Reset order
          </Button>
        </div>
        <div className="rearrange-pdf__toolbar-group rearrange-pdf__toolbar-group--end">
          <Button variant="ghost" disabled={isBusy} onClick={handleReset}>
            New file
          </Button>
          <Button
            disabled={!canEdit || !orderChanged}
            onClick={() => void handleDownload()}
          >
            {busy === "exporting" ? "Saving…" : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="rearrange-pdf__meta">
        <p className="rearrange-pdf__meta-title" id={gridId}>
          {sourceFile?.name ?? "PDF"}
        </p>
        <p className="rearrange-pdf__meta-stats">
          {pageCount} {pageCount === 1 ? "page" : "pages"}
          {sourceFile ? ` · ${formatFileSize(sourceFile.size)}` : ""}
          {orderChanged
            ? " · order changed"
            : pageCount > 1
              ? " · drag pages to reorder"
              : " · nothing to rearrange"}
        </p>
      </div>

      {busy === "loading" || busy === "exporting" ? (
        <div
          className="tool-loading rearrange-pdf__loading"
          role="status"
          aria-live="polite"
        >
          <p>{progressText || (busy === "loading" ? "Loading…" : "Working…")}</p>
        </div>
      ) : (
        <ul
          className="rearrange-pdf__grid"
          aria-labelledby={gridId}
        >
          {pages.map((page, index) => {
            const selected = selectedId === page.id;
            const moved = page.sourceIndex !== index;
            return (
              <li key={page.id}>
                <button
                  type="button"
                  className={cn(
                    "rearrange-pdf__page",
                    selected && "is-selected",
                    dragOverId === page.id && "is-drop-target",
                  )}
                  draggable={canEdit}
                  disabled={isBusy || pageCount < 2}
                  aria-pressed={selected}
                  aria-label={`Position ${index + 1}, original page ${page.originalPageNumber}${moved ? ", moved" : ""}`}
                  onClick={(event) => selectPage(page.id, event)}
                  onDragStart={() => onPageDragStart(page.id)}
                  onDragOver={(event) => onPageDragOver(event, page.id)}
                  onDrop={() => onPageDrop(page.id)}
                  onDragEnd={onPageDragEnd}
                >
                  <span className="rearrange-pdf__page-badge" aria-hidden="true">
                    {index + 1}
                  </span>
                  {moved ? (
                    <span
                      className="rearrange-pdf__page-mark"
                      aria-hidden="true"
                    >
                      Was {page.originalPageNumber}
                    </span>
                  ) : null}
                  <span className="rearrange-pdf__page-frame">
                    {page.thumbUrl ? (
                      // Thumbnail is a local canvas data URL from PDF.js
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbUrl}
                        alt=""
                        className="rearrange-pdf__page-thumb"
                        draggable={false}
                      />
                    ) : (
                      <span className="rearrange-pdf__page-blank">Page</span>
                    )}
                  </span>
                  <span className="rearrange-pdf__page-label">
                    {moved
                      ? `New ${index + 1} · was ${page.originalPageNumber}`
                      : `Page ${page.originalPageNumber}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {result ? (
        <div className="rearrange-pdf__success" role="status">
          <p className="rearrange-pdf__success-title">PDF rearranged</p>
          <p className="rearrange-pdf__success-meta">
            {describeRearrangeResult(result)}
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
        Tip: drag a page onto another to insert it there, or select one page and
        use ↑ / ↓. Badge numbers show the new order.
      </p>
    </div>
  );
}
