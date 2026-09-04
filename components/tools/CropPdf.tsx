"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import {
  CROP_MARGIN_MODES,
  CROP_PRESETS,
  CROP_UNITS,
  cropPdfFile,
  describeCropResult,
  downloadCroppedPdf,
  formatPointsSize,
  loadPdfCropInfo,
  unitLabel,
  type CropMarginMode,
  type CropMargins,
  type CropPdfResult,
  type CropPresetId,
  type CropUnit,
  type PdfCropInfo,
} from "@/lib/crop-pdf";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const DEFAULT_MARGINS: CropMargins = {
  top: 0.5,
  right: 0.5,
  bottom: 0.5,
  left: 0.5,
};

function presetForUnit(unit: CropUnit, id: CropPresetId): number {
  const preset = CROP_PRESETS.find((item) => item.id === id) ?? CROP_PRESETS[2];
  return preset.values[unit];
}

export default function CropPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const unitId = useId();
  const modeId = useId();
  const presetId = useId();
  const uniformId = useId();
  const topId = useId();
  const rightId = useId();
  const bottomId = useId();
  const leftId = useId();

  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfCropInfo | null>(null);
  const [unit, setUnit] = useState<CropUnit>("in");
  const [mode, setMode] = useState<CropMarginMode>("uniform");
  const [preset, setPreset] = useState<CropPresetId>("medium");
  const [margins, setMargins] = useState<CropMargins>(DEFAULT_MARGINS);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CropPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);
  const unitSuffix = unitLabel(unit);
  const hasMargin =
    margins.top > 0 ||
    margins.right > 0 ||
    margins.bottom > 0 ||
    margins.left > 0;

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

  async function handleFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setInfo(null);
    setInfoLoading(true);

    try {
      const nextInfo = await loadPdfCropInfo(file, controller.signal);
      if (controller.signal.aborted) return;
      setInfo(nextInfo);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSourceFile(null);
      setInfo(null);
      setError(
        err instanceof Error
          ? err.message
          : "Could not read this PDF. Try another file.",
      );
    } finally {
      if (abortRef.current === controller) {
        setInfoLoading(false);
      }
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setInfo(null);
    setError("");
    setProgressText("");
    setLoading(false);
    setInfoLoading(false);
  }

  function applyUniformValue(value: number) {
    setMargins({
      top: value,
      right: value,
      bottom: value,
      left: value,
    });
  }

  function handleUnitChange(next: CropUnit) {
    setUnit(next);
    clearResult();
    setError("");
    if (preset !== "none" || mode === "uniform") {
      const value = presetForUnit(next, preset === "none" ? "medium" : preset);
      if (preset === "none") setPreset("medium");
      applyUniformValue(value);
    }
  }

  function handlePreset(next: CropPresetId) {
    setPreset(next);
    clearResult();
    setError("");
    applyUniformValue(presetForUnit(unit, next));
    if (mode === "custom") setMode("uniform");
  }

  function handleModeChange(next: CropMarginMode) {
    setMode(next);
    clearResult();
    setError("");
    if (next === "uniform") {
      applyUniformValue(margins.top);
    }
  }

  function handleUniformChange(value: string) {
    const next = Number(value);
    setPreset("none");
    clearResult();
    setError("");
    applyUniformValue(Number.isFinite(next) ? next : 0);
  }

  function handleSideChange(side: keyof CropMargins, value: string) {
    const next = Number(value);
    setPreset("none");
    clearResult();
    setError("");
    setMargins((current) => ({
      ...current,
      [side]: Number.isFinite(next) ? next : 0,
    }));
  }

  async function handleCrop() {
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
    clearResult();

    try {
      const cropped = await cropPdfFile(sourceFile, {
        unit,
        margins,
        signal: controller.signal,
        onProgress: (current, total) => {
          setProgressText(`Cropping page ${current} of ${total}…`);
        },
      });

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(cropped.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(cropped);
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
          : "Could not crop this PDF. Try a smaller file or another browser.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleDownloadAgain() {
    if (!sourceFile || !result) return;
    downloadCroppedPdf(result.blob, sourceFile);
  }

  const busy = loading || infoLoading;

  return (
    <div className="tool-grid crop-pdf">
      <div className="tool-panel">
        <PdfDropzone
          onFile={(file) => void handleFile(file)}
          onError={setError}
          disabled={busy}
        />

        {hasSource ? (
          <div className="upload-meta">
            <p className="upload-meta__name">{sourceFile?.name}</p>
            <p className="upload-meta__size">
              {sourceFile ? formatFileSize(sourceFile.size) : ""}
              {info
                ? ` · ${info.pageCount} ${info.pageCount === 1 ? "page" : "pages"} · ${formatPointsSize(info.pageWidthPt, info.pageHeightPt)}`
                : infoLoading
                  ? " · Reading…"
                  : ""}
            </p>
          </div>
        ) : null}

        <div className="crop-pdf__options">
          <div className="ui-field">
            <span className="ui-label" id={unitId}>
              Units
            </span>
            <div
              className="crop-pdf__chips crop-pdf__chips--units"
              role="radiogroup"
              aria-labelledby={unitId}
            >
              {CROP_UNITS.map((option) => {
                const selected = unit === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "crop-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={busy}
                    onClick={() => handleUnitChange(option.value)}
                  >
                    <span className="crop-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="crop-pdf__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={presetId}>
              Quick trim
            </span>
            <div
              className="crop-pdf__chips crop-pdf__chips--presets"
              role="radiogroup"
              aria-labelledby={presetId}
            >
              {CROP_PRESETS.map((option) => {
                const selected = preset === option.id && mode === "uniform";
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "crop-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={busy}
                    onClick={() => handlePreset(option.id)}
                  >
                    <span className="crop-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="crop-pdf__chip-hint">
                      {option.id === "none"
                        ? option.hint
                        : `${option.values[unit]}${unitSuffix}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={modeId}>
              Margin mode
            </span>
            <div
              className="crop-pdf__chips crop-pdf__chips--mode"
              role="radiogroup"
              aria-labelledby={modeId}
            >
              {CROP_MARGIN_MODES.map((option) => {
                const selected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "crop-pdf__chip",
                      selected && "is-active",
                    )}
                    disabled={busy}
                    onClick={() => handleModeChange(option.value)}
                  >
                    <span className="crop-pdf__chip-label">
                      {option.label}
                    </span>
                    <span className="crop-pdf__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "uniform" ? (
            <div className="ui-field">
              <label className="ui-label" htmlFor={uniformId}>
                Margin ({unitSuffix})
              </label>
              <input
                id={uniformId}
                className="ui-input"
                type="number"
                min={0}
                max={unit === "percent" ? 49 : undefined}
                step={unit === "in" ? 0.05 : unit === "percent" ? 1 : 1}
                value={margins.top}
                disabled={busy || !hasSource}
                onChange={(event) => handleUniformChange(event.target.value)}
              />
              <p className="ui-hint">
                Removes this amount from every side of each page.
              </p>
            </div>
          ) : (
            <div className="crop-pdf__sides">
              {(
                [
                  ["top", topId, "Top"],
                  ["right", rightId, "Right"],
                  ["bottom", bottomId, "Bottom"],
                  ["left", leftId, "Left"],
                ] as const
              ).map(([side, id, label]) => (
                <div className="ui-field" key={side}>
                  <label className="ui-label" htmlFor={id}>
                    {label} ({unitSuffix})
                  </label>
                  <input
                    id={id}
                    className="ui-input"
                    type="number"
                    min={0}
                    max={unit === "percent" ? 49 : undefined}
                    step={unit === "in" ? 0.05 : unit === "percent" ? 1 : 1}
                    value={margins[side]}
                    disabled={busy || !hasSource}
                    onChange={(event) =>
                      handleSideChange(side, event.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleCrop()}
            disabled={!hasSource || busy || !hasMargin}
          >
            {loading ? "Cropping…" : "Crop PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || busy}
          >
            Start over
          </Button>
        </div>

        {hasResult ? (
          <div className="tool-actions">
            <Button onClick={handleDownloadAgain}>Download</Button>
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
          className={`tool-stage${hasResult ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">
                {progressText || "Cropping PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Pages are cropped locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="crop-pdf__success">
              <p className="crop-pdf__success-title">Cropped PDF ready</p>
              <p className="crop-pdf__success-meta">
                {describeCropResult(result)}
              </p>
              <ul className="crop-pdf__stats" aria-label="Crop summary">
                <li>
                  <span className="crop-pdf__stat-label">Pages</span>
                  <span className="crop-pdf__stat-value">
                    {result.pageCount}
                  </span>
                </li>
                <li>
                  <span className="crop-pdf__stat-label">New size</span>
                  <span className="crop-pdf__stat-value">
                    {formatPointsSize(
                      result.croppedSizePt.width,
                      result.croppedSizePt.height,
                    )}
                  </span>
                </li>
                <li>
                  <span className="crop-pdf__stat-label">File</span>
                  <span className="crop-pdf__stat-value">
                    {formatFileSize(result.outputSize)}
                  </span>
                </li>
              </ul>
              {previewUrl ? (
                <iframe
                  title="Cropped PDF preview"
                  src={previewUrl}
                  className="crop-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Adjust margins and
                crop again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF and set margins to crop pages here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "PDF cropping runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
