"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import BeforeAfterPreview from "@/components/tools/BeforeAfterPreview";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import { fileBaseName, formatFileSize } from "@/lib/image";
import {
  CHILDHOOD_PRESETS,
  generateChildhoodPhoto,
  type ChildhoodGenerateResult,
  type ChildhoodPresetId,
} from "@/lib/childhood-photo";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export default function ChildhoodPhoto() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const presetId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [preset, setPreset] = useState<ChildhoodPresetId>("90s_family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChildhoodGenerateResult | null>(null);
  const [resultUrl, setResultUrl] = useState("");

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = Boolean(result && resultUrl);

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => result?.blob ?? null,
    getFilename: () =>
      sourceFile
        ? `${fileBaseName(sourceFile)}-90s-${result?.preset ?? preset}`
        : null,
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResult(null);
    setResultUrl("");
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setLoading(false);
  }

  async function handleGenerate() {
    if (!sourceFile) {
      setError("Upload a photo to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    clearResult();

    try {
      const generated = await generateChildhoodPhoto(
        sourceFile,
        preset,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const url = URL.createObjectURL(generated.blob);
      setResult(generated);
      setResultUrl(url);
      trackSuccess();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate a childhood photo. Try again.",
      );
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <ImageEditorShell
        className="childhood-photo"
        hasSource={hasSource}
        stageReady={hasResult}
        loading={loading}
        loadingText="Turning your photo into a 90s memory…"
        loadingSubtext="AI face-preserving generation usually takes 20–60 seconds."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `90s memory · ${formatFileSize(result!.blob.size)}`
            : hasSource
              ? sourceFile!.name
              : "Upload a clear face photo to start"
        }
        previewHint={
          hasSource && !hasResult
            ? "Pick a nostalgia preset and click Generate 90s photo"
            : undefined
        }
        privacyHint={
          hasResult
            ? "Generated with AI · download when you are happy with the look"
            : "Your photo is sent securely for AI processing, then discarded from temp storage"
        }
        sidebar={
          <>
            {!hasSource ? (
              <ImageDropzone
                onFile={handleFile}
                onError={setError}
                disabled={loading}
              />
            ) : (
              <ImageSourceBar
                file={sourceFile!}
                disabled={loading}
                onReplace={handleFile}
              />
            )}

            <div className="childhood-photo__options">
              <div className="ui-field">
                <span className="ui-label" id={presetId}>
                  Childhood vibe
                </span>
                <div
                  className="childhood-photo__chips"
                  role="radiogroup"
                  aria-labelledby={presetId}
                >
                  {CHILDHOOD_PRESETS.map((item) => {
                    const selected = preset === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "childhood-photo__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setPreset(item.id)}
                      >
                        <span className="childhood-photo__chip-label">
                          {item.label}
                        </span>
                        <span className="childhood-photo__chip-hint">
                          {item.hint}
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
                onClick={() => void handleGenerate()}
                disabled={!hasSource || loading}
              >
                {loading ? "Generating…" : "Generate 90s photo"}
              </Button>
              {hasResult ? (
                <Button onClick={openDownload} disabled={loading}>
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
        {hasResult && originalUrl && resultUrl ? (
          <div className="image-editor-shell__result childhood-photo__result">
            <p className="image-editor-shell__result-meta childhood-photo__result-meta">
              Before &amp; after · {formatFileSize(result!.blob.size)}
            </p>
            <BeforeAfterPreview
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
              beforeAlt="Original photo"
              afterAlt="90s childhood memory photo"
              hint="Drag the slider to compare your photo with the 90s childhood look."
            />
          </div>
        ) : hasSource && originalUrl ? (
          <div className="image-editor-shell__preview-content preview-single">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Uploaded preview"
              className="preview-single__image"
            />
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
