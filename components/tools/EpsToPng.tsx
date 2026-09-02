"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import EpsToPngDropzone from "@/components/tools/EpsToPngDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  backgroundLabel,
  convertEpsToPng,
  describeEpsPngOutput,
  dpiLabel,
  revokeEpsToPngResult,
  type EpsPngBackground,
  type EpsPngDpi,
  type EpsToPngResult,
} from "@/lib/eps-to-png";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const DPI_OPTIONS: {
  value: EpsPngDpi;
  label: string;
  hint: string;
}[] = [
  { value: 72, label: "Screen", hint: "72 DPI" },
  { value: 150, label: "Draft", hint: "150 DPI" },
  { value: 300, label: "Print", hint: "300 DPI" },
];

const BACKGROUND_OPTIONS: {
  value: EpsPngBackground;
  label: string;
  hint: string;
}[] = [
  { value: "transparent", label: "Transparent", hint: "Keep alpha" },
  { value: "white", label: "White", hint: "Opaque PNG" },
];

export default function EpsToPng() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const dpiId = useId();
  const backgroundId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<EpsToPngResult | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<EpsPngDpi>(150);
  const [background, setBackground] = useState<EpsPngBackground>("transparent");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<EpsToPngResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  const {
    formatOpen,
    setFormatOpen,
    downloading: formatDownloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () =>
      sourceFile ? `${fileBaseName(sourceFile)}-eps-to-png` : null,
  });

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeEpsToPngResult(resultRef.current);
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      revokeEpsToPngResult(current);
      return null;
    });
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleConvert() {
    if (!sourceFile) {
      setError("Upload an EPS (.eps) file to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const converted = await convertEpsToPng(sourceFile, {
        dpi,
        background,
        signal: controller.signal,
        onProgress: (label) => {
          setProgressText(label);
        },
      });

      if (controller.signal.aborted) {
        revokeEpsToPngResult(converted);
        return;
      }

      setResult(converted);
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
          : "Could not convert this EPS file. Try another file or a smaller export.";
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
        className="word-to-pdf"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText={progressText || "Converting EPS…"}
        loadingSubtext="First run downloads the converter engine (~15 MB), then conversion stays in your browser."
        previewTitle="Preview"
        previewMeta={
          hasResult && result
            ? `${describeEpsPngOutput(result)} · ${dpiLabel(result.dpi)} · ${backgroundLabel(result.background)}`
            : hasSource
              ? sourceFile?.name
              : "Upload an EPS file to start"
        }
        previewHint={
          hasSource && !hasResult ? "Click Convert to PNG" : undefined
        }
        privacyHint={
          hasResult
            ? "Processed locally on your device"
            : "EPS to PNG runs in your browser · files never upload to Focera"
        }
        sidebar={
          <>
            <EpsToPngDropzone
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

            <div className="word-to-pdf__options">
              <div className="ui-field">
                <span className="ui-label" id={dpiId}>
                  Resolution
                </span>
                <div
                  className="word-to-pdf__chips"
                  role="radiogroup"
                  aria-labelledby={dpiId}
                >
                  {DPI_OPTIONS.map((option) => {
                    const selected = dpi === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "word-to-pdf__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => {
                          setDpi(option.value);
                          clearResult();
                        }}
                      >
                        <span className="word-to-pdf__chip-label">
                          {option.label}
                        </span>
                        <span className="word-to-pdf__chip-hint">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="ui-field">
                <span className="ui-label" id={backgroundId}>
                  Background
                </span>
                <div
                  className="word-to-pdf__chips"
                  role="radiogroup"
                  aria-labelledby={backgroundId}
                >
                  {BACKGROUND_OPTIONS.map((option) => {
                    const selected = background === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "word-to-pdf__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => {
                          setBackground(option.value);
                          clearResult();
                        }}
                      >
                        <span className="word-to-pdf__chip-label">
                          {option.label}
                        </span>
                        <span className="word-to-pdf__chip-hint">
                          {option.hint}
                        </span>
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
              <Button
                onClick={() => void handleConvert()}
                disabled={!hasSource || loading}
              >
                {loading ? "Converting…" : "Convert to PNG"}
              </Button>
              {hasResult ? (
                <Button
                  onClick={openDownload}
                  disabled={loading || formatDownloading}
                >
                  Download
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={(!hasSource && !hasResult) || loading}
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
          <div className="image-editor-shell__result png-to-pdf__success">
            <p className="image-editor-shell__result-meta png-to-pdf__success-meta">
              {describeEpsPngOutput(result)} · {dpiLabel(result.dpi)} ·{" "}
              {backgroundLabel(result.background)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={`Converted ${sourceFile?.name ?? "EPS"}`}
              className="pdf-to-jpg__preview-image"
            />
            <ul className="png-to-pdf__stats" aria-label="Conversion summary">
              <li>
                <span className="png-to-pdf__stat-label">Pixels</span>
                <span className="png-to-pdf__stat-value">
                  {result.width}×{result.height}
                </span>
              </li>
              <li>
                <span className="png-to-pdf__stat-label">Original</span>
                <span className="png-to-pdf__stat-value">
                  {formatFileSize(result.originalSize)}
                </span>
              </li>
              <li>
                <span className="png-to-pdf__stat-label">PNG size</span>
                <span className="png-to-pdf__stat-value">
                  {formatFileSize(result.outputSize)}
                </span>
              </li>
            </ul>
          </div>
        ) : hasSource ? (
          <p className="tool-placeholder">
            Upload an EPS file and convert it to PNG here
          </p>
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
