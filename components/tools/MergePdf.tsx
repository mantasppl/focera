"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import MergePdfDropzone from "@/components/tools/MergePdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  downloadMergedPdf,
  MAX_MERGE_FILES,
  mergePdfFiles,
} from "@/lib/merge-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type PdfEntry = {
  id: string;
  file: File;
};

function createEntries(files: File[]): PdfEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function MergePdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [mergedReady, setMergedReady] = useState(false);
  const [mergedSize, setMergedSize] = useState(0);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const canMerge = fileCount >= 2 && !loading;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function handleAddFiles(incoming: File[]) {
    setMergedReady(false);
    setMergedSize(0);
    setMergedBlob(null);
    setError("");
    setProgressText("");
    setEntries((current) => [...current, ...createEntries(incoming)]);
  }

  function handleRemove(id: string) {
    setMergedReady(false);
    setMergedSize(0);
    setMergedBlob(null);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleMove(id: string, direction: -1 | 1) {
    setMergedReady(false);
    setMergedSize(0);
    setMergedBlob(null);
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
    setEntries([]);
    setError("");
    setProgressText("");
    setLoading(false);
    setMergedReady(false);
    setMergedSize(0);
    setMergedBlob(null);
  }

  async function handleMerge() {
    if (fileCount < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setMergedReady(false);
    setMergedSize(0);
    setMergedBlob(null);
    setProgressText("Preparing merge…");

    try {
      const blob = await mergePdfFiles(files, {
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Merging file ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      setMergedBlob(blob);
      setMergedSize(blob.size);
      setMergedReady(true);
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
          : "Could not merge these PDFs. Try fewer or smaller files.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownload() {
    if (!mergedBlob) return;
    downloadMergedPdf(mergedBlob, "merged.pdf");
  }

  return (
    <div className="tool-grid merge-pdf">
      <div className="tool-panel">
        <MergePdfDropzone
          existingFiles={files}
          onFiles={handleAddFiles}
          onError={setError}
          disabled={loading || fileCount >= MAX_MERGE_FILES}
        />

        {fileCount > 0 ? (
          <div className="merge-pdf__list-wrap">
            <div className="merge-pdf__list-header">
              <p className="merge-pdf__list-title" id={listId}>
                Merge order ({fileCount})
              </p>
              <p className="merge-pdf__list-meta">
                {formatFileSize(totalBytes)} total
              </p>
            </div>
            <ol
              className="merge-pdf__list"
              aria-labelledby={listId}
            >
              {entries.map((entry, index) => (
                <li key={entry.id} className="merge-pdf__item">
                  <span className="merge-pdf__index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="merge-pdf__file">
                    <p className="merge-pdf__name">{entry.file.name}</p>
                    <p className="merge-pdf__size">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <div className="merge-pdf__item-actions">
                    <button
                      type="button"
                      className="merge-pdf__icon-btn"
                      aria-label={`Move ${entry.file.name} up`}
                      disabled={loading || index === 0}
                      onClick={() => handleMove(entry.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="merge-pdf__icon-btn"
                      aria-label={`Move ${entry.file.name} down`}
                      disabled={loading || index === fileCount - 1}
                      onClick={() => handleMove(entry.id, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "merge-pdf__icon-btn",
                        "merge-pdf__icon-btn--danger",
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

        <div className="tool-actions">
          <Button onClick={() => void handleMerge()} disabled={!canMerge}>
            {loading ? "Merging…" : "Merge PDFs"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={fileCount === 0 || loading}
          >
            Start over
          </Button>
        </div>

        {mergedReady ? (
          <div className="tool-actions">
            <Button onClick={handleDownload}>Download</Button>
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
          className={`tool-stage${mergedReady ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Merging PDFs…"}
              </span>
              <span className="tool-loading__subtext">
                Pages are combined locally in your browser.
              </span>
            </div>
          ) : mergedReady ? (
            <div className="merge-pdf__success">
              <p className="merge-pdf__success-title">Merged PDF ready</p>
              <p className="merge-pdf__success-meta">
                Combined {fileCount} files · {formatFileSize(mergedSize)}
              </p>
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Reorder or add files
                to merge again.
              </p>
            </div>
          ) : (
            <div className="merge-pdf__empty">
              <p className="tool-placeholder">
                {fileCount === 0
                  ? "Add two or more PDFs to combine them into one file"
                  : fileCount === 1
                    ? "Add at least one more PDF to enable merge"
                    : `${fileCount} PDFs queued · click Merge PDFs to combine them`}
              </p>
              {fileCount > 0 ? (
                <ul className="merge-pdf__summary" aria-label="Queued files">
                  {entries.map((entry, index) => (
                    <li key={entry.id}>
                      {index + 1}. {entry.file.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <p className="tool-hint">
          {mergedReady
            ? "Download when you are ready · processed locally"
            : "PDF merge runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
