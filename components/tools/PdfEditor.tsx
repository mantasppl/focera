"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  buildEditedPdf,
  createBlankEditorPage,
  downloadEditedPdf,
  duplicateEditorPage,
  editorLimitsHint,
  loadPdfForEditor,
  MAX_EDITOR_PAGES,
  moveEditorPage,
  reorderEditorPages,
  rotateEditorPage,
  type EditorPage,
} from "@/lib/pdf-editor";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type BusyMode = "idle" | "loading" | "exporting";

export default function PdfEditor() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const gridId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<BusyMode>("idle");
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const pageCount = pages.length;
  const selectedCount = selectedIds.size;
  const isBusy = busy !== "idle";
  const canEdit = pageCount > 0 && !isBusy;
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function markDirty() {
    setDirty(true);
    setDownloaded(false);
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function selectOnly(id: string) {
    setSelectedIds(new Set([id]));
  }

  function toggleSelect(id: string, additive: boolean) {
    setSelectedIds((current) => {
      if (!additive) {
        return new Set([id]);
      }
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(pages.map((page) => page.id)));
  }

  function targetIds(): string[] {
    if (selectedCount > 0) return [...selectedIds];
    return [];
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
    setDirty(false);
    setDownloaded(false);
    sourceBytesRef.current = null;

    try {
      const result = await loadPdfForEditor(file, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Loading page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      sourceBytesRef.current = result.bytes;
      setPages(result.pages);
      setSelectedIds(new Set([result.pages[0]?.id].filter(Boolean) as string[]));
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
    setDirty(false);
    setDownloaded(false);
    setDragOverId(null);
  }

  function applyToTargets(
    ids: string[],
    mapper: (page: EditorPage) => EditorPage,
  ) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setPages((current) =>
      current.map((page) => (idSet.has(page.id) ? mapper(page) : page)),
    );
    markDirty();
  }

  function handleRotate(direction: 90 | -90) {
    const ids = targetIds();
    if (ids.length === 0) {
      setError("Select one or more pages to rotate.");
      return;
    }
    setError("");
    applyToTargets(ids, (page) => rotateEditorPage(page, direction));
  }

  function handleDelete() {
    const ids = targetIds();
    if (ids.length === 0) {
      setError("Select one or more pages to delete.");
      return;
    }
    if (ids.length >= pageCount) {
      setError("Keep at least one page in the document.");
      return;
    }
    setError("");
    const idSet = new Set(ids);
    setPages((current) => current.filter((page) => !idSet.has(page.id)));
    clearSelection();
    markDirty();
  }

  function handleDuplicate() {
    const ids = targetIds();
    if (ids.length === 0) {
      setError("Select one or more pages to duplicate.");
      return;
    }
    if (pageCount + ids.length > MAX_EDITOR_PAGES) {
      setError(`You can edit up to ${MAX_EDITOR_PAGES} pages.`);
      return;
    }
    setError("");
    const createdIds: string[] = [];
    const next: EditorPage[] = [];
    for (const page of pages) {
      next.push(page);
      if (ids.includes(page.id)) {
        const copy = duplicateEditorPage(page);
        next.push(copy);
        createdIds.push(copy.id);
      }
    }
    setPages(next);
    setSelectedIds(new Set(createdIds));
    markDirty();
  }

  function handleInsertBlank() {
    if (pageCount >= MAX_EDITOR_PAGES) {
      setError(`You can edit up to ${MAX_EDITOR_PAGES} pages.`);
      return;
    }
    setError("");
    const anchor =
      pages.find((page) => selectedIds.has(page.id)) ?? pages[pages.length - 1];
    const blank = createBlankEditorPage(
      anchor?.width ?? 612,
      anchor?.height ?? 792,
    );
    setPages((current) => {
      if (!anchor) return [...current, blank];
      const index = current.findIndex((page) => page.id === anchor.id);
      const next = [...current];
      next.splice(index + 1, 0, blank);
      return next;
    });
    selectOnly(blank.id);
    markDirty();
  }

  function handleMoveSelected(direction: -1 | 1) {
    const ids = targetIds();
    if (ids.length !== 1) {
      setError("Select a single page to reorder with the arrows.");
      return;
    }
    setError("");
    setPages((current) => moveEditorPage(current, ids[0], direction));
    markDirty();
  }

  async function handleDownload(mode: "all" | "selected") {
    const bytes = sourceBytesRef.current;
    if (!bytes || pageCount === 0) {
      setError("Upload a PDF to get started.");
      return;
    }

    const exportPages =
      mode === "selected"
        ? pages.filter((page) => selectedIds.has(page.id))
        : pages;

    if (exportPages.length === 0) {
      setError("Select at least one page to extract.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy("exporting");
    setError("");
    setProgressText(
      mode === "selected" ? "Extracting pages…" : "Building PDF…",
    );
    setDownloaded(false);

    try {
      const blob = await buildEditedPdf(bytes, exportPages, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Writing page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const base = sourceFile ? fileBaseName(sourceFile) : "document";
      const name =
        mode === "selected" ? `${base}-extract.pdf` : `${base}-edited.pdf`;
      downloadEditedPdf(blob, name);
      setDownloaded(true);
      setDirty(false);
      setProgressText("");
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      trackFailure();
      const message =
        err instanceof Error
          ? err.message
          : "Could not build the PDF. Try again.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setBusy("idle");
      }
    }
  }

  function onPageDragStart(id: string) {
    dragIdRef.current = id;
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
    setPages((current) => reorderEditorPages(current, fromId, id));
    selectOnly(fromId);
    markDirty();
  }

  function onPageDragEnd() {
    dragIdRef.current = null;
    setDragOverId(null);
  }

  if (!sourceFile && busy === "idle") {
    return (
      <div className="tool-grid pdf-editor pdf-editor--empty">
        <div className="tool-panel">
          <PdfDropzone
            onFile={(file) => void handleFile(file)}
            onError={setError}
          />
          <p className="tool-hint">{editorLimitsHint()} · private & local</p>
          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="tool-panel tool-panel--preview">
          <div className="tool-stage">
            <div className="pdf-editor__empty">
              <p className="tool-placeholder">
                Drop a PDF to reorder, rotate, delete, and extract pages —
                free, like a premium editor
              </p>
              <ul className="pdf-editor__feature-list" aria-label="Editor features">
                <li>Reorder pages with drag & drop</li>
                <li>Rotate, duplicate, or delete pages</li>
                <li>Insert blank pages</li>
                <li>Extract a selection or download the full edit</li>
              </ul>
            </div>
          </div>
          <p className="tool-hint">
            Editing runs in your browser · files never upload to Focera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-editor">
      <div className="pdf-editor__toolbar" role="toolbar" aria-label="PDF editor tools">
        <div className="pdf-editor__toolbar-group">
          <Button
            variant="ghost"
            disabled={!canEdit || !hasSelection}
            onClick={() => handleRotate(-90)}
          >
            Rotate left
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || !hasSelection}
            onClick={() => handleRotate(90)}
          >
            Rotate right
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || !hasSelection}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || !hasSelection || selectedCount >= pageCount}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit}
            onClick={handleInsertBlank}
          >
            Blank page
          </Button>
        </div>
        <div className="pdf-editor__toolbar-group">
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount !== 1}
            onClick={() => handleMoveSelected(-1)}
            aria-label="Move selected page earlier"
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || selectedCount !== 1}
            onClick={() => handleMoveSelected(1)}
            aria-label="Move selected page later"
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            disabled={!canEdit || pageCount === 0}
            onClick={selectAll}
          >
            Select all
          </Button>
        </div>
        <div className="pdf-editor__toolbar-group pdf-editor__toolbar-group--end">
          <Button
            variant="ghost"
            disabled={!canEdit || !hasSelection}
            onClick={() => void handleDownload("selected")}
          >
            Extract selected
          </Button>
          <Button
            disabled={!canEdit}
            onClick={() => void handleDownload("all")}
          >
            {busy === "exporting" ? "Saving…" : "Download PDF"}
          </Button>
          <Button variant="ghost" disabled={isBusy} onClick={handleReset}>
            Start over
          </Button>
        </div>
      </div>

      <div className="pdf-editor__meta">
        <p className="pdf-editor__meta-title" id={gridId}>
          {sourceFile?.name ?? "PDF"}
        </p>
        <p className="pdf-editor__meta-stats">
          {pageCount} page{pageCount === 1 ? "" : "s"}
          {sourceFile ? ` · ${formatFileSize(sourceFile.size)}` : ""}
          {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
          {dirty ? " · unsaved edits" : downloaded ? " · downloaded" : ""}
        </p>
      </div>

      {busy === "loading" || busy === "exporting" ? (
        <div className="tool-loading pdf-editor__loading" role="status" aria-live="polite">
          <span className="tool-loading__spinner" aria-hidden="true" />
          <span className="tool-loading__text">
            {progressText || (busy === "loading" ? "Loading PDF…" : "Saving PDF…")}
          </span>
          <span className="tool-loading__subtext">
            Pages are processed locally in your browser.
          </span>
        </div>
      ) : (
        <ul
          className="pdf-editor__grid"
          aria-labelledby={gridId}
        >
          {pages.map((page, index) => {
            const selected = selectedIds.has(page.id);
            return (
              <li key={page.id}>
                <button
                  type="button"
                  className={cn(
                    "pdf-editor__page",
                    selected && "is-selected",
                    dragOverId === page.id && "is-drop-target",
                  )}
                  draggable={canEdit}
                  aria-pressed={selected}
                  aria-label={`Page ${index + 1}${page.sourceIndex === null ? ", blank" : ""}${page.rotation ? `, rotated ${page.rotation} degrees` : ""}`}
                  disabled={isBusy}
                  onClick={(event) => {
                    toggleSelect(page.id, event.metaKey || event.ctrlKey || event.shiftKey);
                  }}
                  onDragStart={() => onPageDragStart(page.id)}
                  onDragOver={(event) => onPageDragOver(event, page.id)}
                  onDrop={() => onPageDrop(page.id)}
                  onDragEnd={onPageDragEnd}
                >
                  <span className="pdf-editor__page-badge" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="pdf-editor__page-frame">
                    {page.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbUrl}
                        alt=""
                        className="pdf-editor__page-thumb"
                        style={{
                          transform: page.rotation
                            ? `rotate(${page.rotation}deg)`
                            : undefined,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <span className="pdf-editor__page-blank">Blank</span>
                    )}
                  </span>
                  <span className="pdf-editor__page-label">
                    {page.sourceIndex === null
                      ? "Blank"
                      : page.rotation
                        ? `Rotated ${page.rotation}°`
                        : `Page ${index + 1}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        Click to select · Ctrl/Cmd-click for multi-select · drag to reorder ·{" "}
        {downloaded
          ? "Download again anytime after more edits"
          : "Everything stays on your device"}
      </p>
    </div>
  );
}
