"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import ImageDropzone from "@/components/tools/ImageDropzone";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageSourceBar from "@/components/tools/ImageSourceBar";
import {
  describeMetadata,
  downloadMetadataJson,
  gpsMapUrl,
  metadataToJson,
  readImageMetadata,
  type ImageMetadataResult,
} from "@/lib/view-image-metadata";
import { useToolAnalytics } from "@/lib/analytics/client";
import { copyText } from "@/lib/utils";

export default function ViewMetadataForYourImage() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImageMetadataResult | null>(null);
  const [copied, setCopied] = useState(false);

  const hasSource = Boolean(sourceFile && originalUrl);
  const hasResult = result !== null;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  function clearResult() {
    setResult(null);
    setCopied(false);
  }

  async function readFile(file: File) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Preparing…");
    clearResult();

    try {
      const metadata = await readImageMetadata(file, {
        signal: controller.signal,
        onProgress: setProgressText,
      });

      if (controller.signal.aborted) return;

      setResult(metadata);
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
          : "Could not read metadata from this image. Try another file.";
      setError(message);
      setProgressText("");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setError("");
    setProgressText("");
    setSourceFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    void readFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    clearResult();
    setSourceFile(null);
    setOriginalUrl("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleCopy() {
    if (!result) {
      setError("Nothing to copy yet.");
      return;
    }
    const ok = await copyText(metadataToJson(result));
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try downloading the JSON instead.");
  }

  function handleDownload() {
    if (!sourceFile || !result) {
      setError("Nothing to download yet.");
      return;
    }
    downloadMetadataJson(result, sourceFile);
    setError("");
  }

  return (
    <ImageEditorShell
      className="view-image-metadata"
      hasSource={hasSource}
      stageReady={hasResult}
      loading={loading}
      loadingText={progressText || "Reading metadata…"}
      loadingSubtext="EXIF and tags are read locally in your browser."
      previewTitle="Preview"
      previewMeta={
        hasResult
          ? describeMetadata(result!)
          : hasSource
            ? sourceFile?.name
            : "Upload an image to start"
      }
      privacyHint={
        hasResult
          ? "Copy or download JSON anytime · processed locally"
          : "Read EXIF, camera, and GPS tags in your browser · files never upload to Focera"
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
              width={result?.width}
              height={result?.height}
              disabled={loading}
              onReplace={handleFile}
            />
          )}

          {hasResult && result ? (
            <div className="view-image-metadata__result">
              {result.gps ? (
                <p className="view-image-metadata__gps">
                  <a
                    href={gpsMapUrl(result.gps)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open GPS on OpenStreetMap
                  </a>
                </p>
              ) : null}
              {result.sections.map((section) => (
                <section
                  key={section.id}
                  className="view-image-metadata__section"
                  aria-labelledby={`meta-${section.id}`}
                >
                  <h3
                    id={`meta-${section.id}`}
                    className="view-image-metadata__section-title"
                  >
                    {section.title}
                  </h3>
                  <dl className="view-image-metadata__fields">
                    {section.fields.map((field) => (
                      <div
                        key={`${section.id}-${field.key}`}
                        className="view-image-metadata__field"
                      >
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          ) : null}
        </>
      }
      sidebarFooter={
        <>
          <div className="tool-actions">
            {hasResult ? (
              <>
                <Button onClick={() => void handleCopy()} disabled={loading}>
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  Download JSON
                </Button>
              </>
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
      {hasSource && originalUrl ? (
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
  );
}
