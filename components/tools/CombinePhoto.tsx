"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import CombinePhotoDropzone from "@/components/tools/CombinePhotoDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  combinePhotos,
  describeCombineOutput,
  layoutLabel,
  MAX_COMBINE_FILES,
  MIN_COMBINE_FILES,
  revokeCombinePhotoResult,
  type CombineBackground,
  type CombineFit,
  type CombineGap,
  type CombineLayout,
  type CombinePhotoResult,
} from "@/lib/combine-photo";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

const LAYOUT_OPTIONS: {
  value: CombineLayout;
  label: string;
  hint: string;
}[] = [
  { value: "horizontal", label: "Side by side", hint: "One row" },
  { value: "vertical", label: "Stacked", hint: "One column" },
  { value: "grid", label: "Grid", hint: "Auto collage" },
];

const GAP_OPTIONS: {
  value: CombineGap;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "None", hint: "Edge to edge" },
  { value: "small", label: "Small", hint: "Light spacing" },
  { value: "medium", label: "Medium", hint: "Clear dividers" },
];

const BACKGROUND_OPTIONS: {
  value: CombineBackground;
  label: string;
  hint: string;
}[] = [
  { value: "white", label: "White", hint: "Bright canvas" },
  { value: "black", label: "Black", hint: "Dark canvas" },
  { value: "transparent", label: "Clear", hint: "PNG alpha" },
];

const FIT_OPTIONS: {
  value: CombineFit;
  label: string;
  hint: string;
}[] = [
  { value: "cover", label: "Fill", hint: "Crop to cell" },
  { value: "contain", label: "Fit", hint: "Show full photo" },
];

function createEntries(files: File[]): ImageEntry[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
  }));
}

export default function CombinePhoto() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const layoutId = useId();
  const gapId = useId();
  const backgroundId = useId();
  const fitId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<CombinePhotoResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [layout, setLayout] = useState<CombineLayout>("horizontal");
  const [gap, setGap] = useState<CombineGap>("small");
  const [background, setBackground] = useState<CombineBackground>("white");
  const [fit, setFit] = useState<CombineFit>("cover");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CombinePhotoResult | null>(null);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const canCombine = fileCount >= MIN_COMBINE_FILES && !loading;
  const hasResult = Boolean(result);
  const hasSource = fileCount > 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () => {
      if (!result || fileCount === 0) return null;
      return files.length === 1
        ? fileBaseName(files[0])
        : `${fileBaseName(files[0])}-combined`;
    },
  });

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeCombinePhotoResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokeCombinePhotoResult(current);
      return null;
    });
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
    setEntries([]);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleCombine() {
    if (fileCount < MIN_COMBINE_FILES) {
      setError(`Add at least ${MIN_COMBINE_FILES} photos to combine.`);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing photos…");
    clearResult();

    try {
      const combined = await combinePhotos(files, {
        layout,
        gap,
        background,
        fit,
        signal: controller.signal,
        onProgress: (message) => {
          setProgressText(message);
        },
      });

      if (controller.signal.aborted) {
        revokeCombinePhotoResult(combined);
        return;
      }

      setResult(combined);
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
          : "Could not combine these photos. Try fewer or smaller files.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <ImageEditorShell
        className="combine-photo"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Combining photos…"}
        loadingSubtext="Collage is built locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult && result
            ? describeCombineOutput(result)
            : hasSource
              ? `${fileCount} photo${fileCount === 1 ? "" : "s"} selected`
              : "Add photos to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Pick a layout and click Combine photos"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Combine photos in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <CombinePhotoDropzone
              existingFiles={files}
              onFiles={handleAddFiles}
              onError={setError}
              disabled={loading || fileCount >= MAX_COMBINE_FILES}
            />

            {fileCount > 0 ? (
              <div className="combine-photo__list-wrap">
                <div className="combine-photo__list-header">
                  <p className="combine-photo__list-title" id={listId}>
                    Photo order ({fileCount})
                  </p>
                  <p className="combine-photo__list-meta">
                    {formatFileSize(totalBytes)} total
                  </p>
                </div>
                <ol className="combine-photo__list" aria-labelledby={listId}>
                  {entries.map((entry, index) => (
                    <li key={entry.id} className="combine-photo__item">
                      <span className="combine-photo__index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="combine-photo__file">
                        <p className="combine-photo__name">{entry.file.name}</p>
                        <p className="combine-photo__size">
                          {formatFileSize(entry.file.size)}
                        </p>
                      </div>
                      <div className="combine-photo__item-actions">
                        <button
                          type="button"
                          className="combine-photo__icon-btn"
                          aria-label={`Move ${entry.file.name} up`}
                          disabled={loading || index === 0}
                          onClick={() => handleMove(entry.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="combine-photo__icon-btn"
                          aria-label={`Move ${entry.file.name} down`}
                          disabled={loading || index === fileCount - 1}
                          onClick={() => handleMove(entry.id, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "combine-photo__icon-btn",
                            "combine-photo__icon-btn--danger",
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

            <div className="combine-photo__options">
              <div className="ui-field">
                <span className="ui-label" id={layoutId}>
                  Layout
                </span>
                <div
                  className="combine-photo__chips"
                  role="radiogroup"
                  aria-labelledby={layoutId}
                >
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={layout === option.value}
                      className={cn(
                        "combine-photo__chip",
                        layout === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setLayout(option.value);
                      }}
                    >
                      <span className="combine-photo__chip-label">
                        {option.label}
                      </span>
                      <span className="combine-photo__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={fitId}>
                  Photo fit
                </span>
                <div
                  className="combine-photo__chips"
                  role="radiogroup"
                  aria-labelledby={fitId}
                >
                  {FIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={fit === option.value}
                      className={cn(
                        "combine-photo__chip",
                        fit === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setFit(option.value);
                      }}
                    >
                      <span className="combine-photo__chip-label">
                        {option.label}
                      </span>
                      <span className="combine-photo__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={gapId}>
                  Gap
                </span>
                <div
                  className="combine-photo__chips"
                  role="radiogroup"
                  aria-labelledby={gapId}
                >
                  {GAP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={gap === option.value}
                      className={cn(
                        "combine-photo__chip",
                        gap === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setGap(option.value);
                      }}
                    >
                      <span className="combine-photo__chip-label">
                        {option.label}
                      </span>
                      <span className="combine-photo__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={backgroundId}>
                  Background
                </span>
                <div
                  className="combine-photo__chips"
                  role="radiogroup"
                  aria-labelledby={backgroundId}
                >
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={background === option.value}
                      className={cn(
                        "combine-photo__chip",
                        background === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setBackground(option.value);
                      }}
                    >
                      <span className="combine-photo__chip-label">
                        {option.label}
                      </span>
                      <span className="combine-photo__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="ui-hint">
                  Add {MIN_COMBINE_FILES}–{MAX_COMBINE_FILES} photos, then
                  combine into one image.
                </p>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button onClick={() => void handleCombine()} disabled={!canCombine}>
                {loading ? "Combining…" : "Combine photos"}
              </Button>
              {hasResult ? (
                <Button onClick={openDownload} disabled={loading}>
                  Download
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={fileCount === 0 || loading}
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
          <div className="image-editor-shell__result combine-photo__success">
            <p className="image-editor-shell__result-meta combine-photo__success-meta">
              {describeCombineOutput(result)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={`Combined ${layoutLabel(result.layout)} collage of ${result.imageCount} photos`}
              className="combine-photo__preview"
            />
          </div>
        ) : hasSource ? (
          <div className="combine-photo__empty">
            <p className="combine-photo__success-title">Your collage preview</p>
            <p className="combine-photo__success-meta">
              Upload at least {MIN_COMBINE_FILES} photos, pick a layout, and
              combine them into one image.
            </p>
            <ul className="combine-photo__summary">
              <li>Side by side, stacked, or grid layouts</li>
              <li>Reorder photos before combining</li>
              <li>Private — nothing leaves your device</li>
            </ul>
          </div>
        ) : null}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={downloading}
        error={downloadError}
      />
    </>
  );
}
