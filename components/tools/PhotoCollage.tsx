"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PhotoCollageDropzone from "@/components/tools/PhotoCollageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  createPhotoCollage,
  describeCollageOutput,
  getCollageTemplate,
  MAX_COLLAGE_FILES,
  MIN_COLLAGE_FILES,
  ratioLabel,
  revokePhotoCollageResult,
  templatesForCount,
  type CollageBackground,
  type CollageFit,
  type CollageGap,
  type CollageRatio,
  type CollageTemplate,
  type PhotoCollageResult,
} from "@/lib/photo-collage";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  file: File;
};

const RATIO_OPTIONS: {
  value: CollageRatio;
  label: string;
  hint: string;
}[] = [
  { value: "square", label: "Square", hint: "1:1 feed" },
  { value: "landscape", label: "Landscape", hint: "16:9 wide" },
  { value: "portrait", label: "Portrait", hint: "3:4 tall" },
  { value: "story", label: "Story", hint: "9:16 vertical" },
];

const GAP_OPTIONS: {
  value: CollageGap;
  label: string;
  hint: string;
}[] = [
  { value: "none", label: "None", hint: "Edge to edge" },
  { value: "small", label: "Small", hint: "Light spacing" },
  { value: "medium", label: "Medium", hint: "Clear dividers" },
];

const BACKGROUND_OPTIONS: {
  value: CollageBackground;
  label: string;
  hint: string;
}[] = [
  { value: "white", label: "White", hint: "Bright canvas" },
  { value: "black", label: "Black", hint: "Dark canvas" },
  { value: "transparent", label: "Clear", hint: "PNG alpha" },
];

const FIT_OPTIONS: {
  value: CollageFit;
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

function TemplateThumb({ template }: { template: CollageTemplate }) {
  return (
    <span className="photo-collage__template-thumb" aria-hidden="true">
      {template.cells.map((cell, index) => (
        <span
          key={`${template.id}-${index}`}
          className="photo-collage__template-cell"
          style={{
            left: `${cell.x * 100}%`,
            top: `${cell.y * 100}%`,
            width: `${cell.w * 100}%`,
            height: `${cell.h * 100}%`,
          }}
        />
      ))}
    </span>
  );
}

export default function PhotoCollage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const listId = useId();
  const templateIdAttr = useId();
  const ratioId = useId();
  const gapId = useId();
  const backgroundId = useId();
  const fitId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<PhotoCollageResult | null>(null);

  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [ratio, setRatio] = useState<CollageRatio>("square");
  const [gap, setGap] = useState<CollageGap>("small");
  const [background, setBackground] = useState<CollageBackground>("white");
  const [fit, setFit] = useState<CollageFit>("cover");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PhotoCollageResult | null>(null);

  const files = entries.map((entry) => entry.file);
  const fileCount = entries.length;
  const canCreate = fileCount >= MIN_COLLAGE_FILES && !loading;
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
        : `${fileBaseName(files[0])}-collage`;
    },
  });

  const availableTemplates = templatesForCount(fileCount);

  const activeTemplateId =
    availableTemplates.find((template) => template.id === templateId)?.id ??
    availableTemplates[0]?.id ??
    "";

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokePhotoCollageResult(resultRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      availableTemplates.length > 0 &&
      !availableTemplates.some((template) => template.id === templateId)
    ) {
      setTemplateId(availableTemplates[0].id);
    }
  }, [availableTemplates, templateId]);

  function clearResult() {
    setResult((current) => {
      revokePhotoCollageResult(current);
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

  async function handleCreate() {
    if (fileCount < MIN_COLLAGE_FILES) {
      setError(`Add at least ${MIN_COLLAGE_FILES} photos to build a collage.`);
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
      const collage = await createPhotoCollage(files, {
        templateId: activeTemplateId,
        ratio,
        gap,
        background,
        fit,
        signal: controller.signal,
        onProgress: (message) => {
          setProgressText(message);
        },
      });

      if (controller.signal.aborted) {
        revokePhotoCollageResult(collage);
        return;
      }

      setResult(collage);
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
          : "Could not build this collage. Try fewer or smaller files.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  const resultTemplateLabel = result
    ? getCollageTemplate(result.templateId, result.imageCount).label
    : "";

  return (
    <>
      <ImageEditorShell
        className="photo-collage"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Creating collage…"}
        loadingSubtext="Collage is built locally in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult && result
            ? describeCollageOutput(result)
            : hasSource
              ? `${fileCount} photo${fileCount === 1 ? "" : "s"} selected`
              : "Add photos to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Pick a template and click Create collage"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "Build collages in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <PhotoCollageDropzone
              existingFiles={files}
              onFiles={handleAddFiles}
              onError={setError}
              disabled={loading || fileCount >= MAX_COLLAGE_FILES}
            />

            {fileCount > 0 ? (
              <div className="photo-collage__list-wrap">
                <div className="photo-collage__list-header">
                  <p className="photo-collage__list-title" id={listId}>
                    Photo order ({fileCount})
                  </p>
                  <p className="photo-collage__list-meta">
                    {formatFileSize(totalBytes)} total
                  </p>
                </div>
                <ol className="photo-collage__list" aria-labelledby={listId}>
                  {entries.map((entry, index) => (
                    <li key={entry.id} className="photo-collage__item">
                      <span className="photo-collage__index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="photo-collage__file">
                        <p className="photo-collage__name">{entry.file.name}</p>
                        <p className="photo-collage__size">
                          {formatFileSize(entry.file.size)}
                        </p>
                      </div>
                      <div className="photo-collage__item-actions">
                        <button
                          type="button"
                          className="photo-collage__icon-btn"
                          aria-label={`Move ${entry.file.name} up`}
                          disabled={loading || index === 0}
                          onClick={() => handleMove(entry.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="photo-collage__icon-btn"
                          aria-label={`Move ${entry.file.name} down`}
                          disabled={loading || index === fileCount - 1}
                          onClick={() => handleMove(entry.id, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "photo-collage__icon-btn",
                            "photo-collage__icon-btn--danger",
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

            <div className="photo-collage__options">
              {availableTemplates.length > 0 ? (
                <div className="ui-field">
                  <span className="ui-label" id={templateIdAttr}>
                    Collage template
                  </span>
                  <div
                    className="photo-collage__templates"
                    role="radiogroup"
                    aria-labelledby={templateIdAttr}
                  >
                    {availableTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        role="radio"
                        aria-checked={activeTemplateId === template.id}
                        className={cn(
                          "photo-collage__template",
                          activeTemplateId === template.id && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => {
                          clearResult();
                          setTemplateId(template.id);
                        }}
                      >
                        <TemplateThumb template={template} />
                        <span className="photo-collage__chip-label">
                          {template.label}
                        </span>
                        <span className="photo-collage__chip-hint">
                          {template.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="ui-hint">
                  Add {MIN_COLLAGE_FILES}–{MAX_COLLAGE_FILES} photos to unlock
                  collage templates.
                </p>
              )}

              <div className="ui-field">
                <span className="ui-label" id={ratioId}>
                  Canvas ratio
                </span>
                <div
                  className="photo-collage__chips"
                  role="radiogroup"
                  aria-labelledby={ratioId}
                >
                  {RATIO_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={ratio === option.value}
                      className={cn(
                        "photo-collage__chip",
                        ratio === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setRatio(option.value);
                      }}
                    >
                      <span className="photo-collage__chip-label">
                        {option.label}
                      </span>
                      <span className="photo-collage__chip-hint">
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
                  className="photo-collage__chips"
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
                        "photo-collage__chip",
                        fit === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setFit(option.value);
                      }}
                    >
                      <span className="photo-collage__chip-label">
                        {option.label}
                      </span>
                      <span className="photo-collage__chip-hint">
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
                  className="photo-collage__chips"
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
                        "photo-collage__chip",
                        gap === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setGap(option.value);
                      }}
                    >
                      <span className="photo-collage__chip-label">
                        {option.label}
                      </span>
                      <span className="photo-collage__chip-hint">
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
                  className="photo-collage__chips"
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
                        "photo-collage__chip",
                        background === option.value && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => {
                        clearResult();
                        setBackground(option.value);
                      }}
                    >
                      <span className="photo-collage__chip-label">
                        {option.label}
                      </span>
                      <span className="photo-collage__chip-hint">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="ui-hint">
                  Templates unlock for {MIN_COLLAGE_FILES}–{MAX_COLLAGE_FILES}{" "}
                  photos.
                </p>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button onClick={() => void handleCreate()} disabled={!canCreate}>
                {loading ? "Creating…" : "Create collage"}
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
          <div className="image-editor-shell__result photo-collage__success">
            <p className="image-editor-shell__result-meta photo-collage__success-meta">
              {describeCollageOutput(result)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={`${resultTemplateLabel} collage of ${result.imageCount} photos, ${ratioLabel(result.ratio)}`}
              className="photo-collage__preview"
            />
          </div>
        ) : hasSource ? (
          <div className="photo-collage__empty">
            <p className="photo-collage__success-title">Your collage preview</p>
            <p className="photo-collage__success-meta">
              Upload {MIN_COLLAGE_FILES}–{MAX_COLLAGE_FILES} photos, pick a
              template and ratio, then create your collage.
            </p>
            <ul className="photo-collage__summary">
              <li>Template layouts with mixed cell sizes</li>
              <li>Square, landscape, portrait, and story ratios</li>
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
