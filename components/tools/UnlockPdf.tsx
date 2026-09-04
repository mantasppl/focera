"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  downloadUnlockedPdf,
  unlockPdfFile,
  type UnlockPdfResult,
} from "@/lib/unlock-pdf";

export default function UnlockPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const passwordId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnlockPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

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

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setPassword("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setPassword("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleUnlock() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Reading encrypted PDF…");
    clearResult();

    try {
      const unlocked = await unlockPdfFile(sourceFile, {
        password,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setProgressText("Saving unlocked PDF…");
      const url = URL.createObjectURL(unlocked.blob);
      resultUrlRef.current = url;
      setPreviewUrl(url);
      setResult(unlocked);
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
          : "Could not unlock this PDF. Try another file or browser.";
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
    downloadUnlockedPdf(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid unlock-pdf">
      <div className="tool-panel">
        <PdfDropzone
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

        <div className="unlock-pdf__options">
          <div className="ui-field">
            <label className="ui-label" htmlFor={passwordId}>
              PDF password
            </label>
            <div className="unlock-pdf__password-row">
              <input
                id={passwordId}
                className="ui-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || !hasSource}
                autoComplete="current-password"
                placeholder="Enter the password to open this PDF"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && hasSource && !loading) {
                    void handleUnlock();
                  }
                }}
              />
              <button
                type="button"
                className="unlock-pdf__toggle"
                disabled={loading || !hasSource}
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="unlock-pdf__hint">
              Leave blank if the file only has an owner/permissions password.
            </p>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleUnlock()}
            disabled={!hasSource || loading}
          >
            {loading ? "Unlocking…" : "Unlock PDF"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={(!hasSource && !hasResult) || loading}
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
                {progressText || "Unlocking PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Password removal runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="unlock-pdf__success">
              <p className="unlock-pdf__success-title">Unlocked PDF ready</p>
              <p className="unlock-pdf__success-meta">
                {result.pageCount}{" "}
                {result.pageCount === 1 ? "page" : "pages"} · password removed ·{" "}
                {formatFileSize(result.unlockedSize)}
              </p>
              <ul className="unlock-pdf__stats" aria-label="File details">
                <li>
                  <span className="unlock-pdf__stat-label">Original</span>
                  <span className="unlock-pdf__stat-value">
                    {formatFileSize(result.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="unlock-pdf__stat-label">Unlocked</span>
                  <span className="unlock-pdf__stat-value">
                    {formatFileSize(result.unlockedSize)}
                  </span>
                </li>
                <li>
                  <span className="unlock-pdf__stat-label">Pages</span>
                  <span className="unlock-pdf__stat-value">
                    {result.pageCount}
                  </span>
                </li>
              </ul>
              {previewUrl ? (
                <iframe
                  title="Unlocked PDF preview"
                  src={previewUrl}
                  className="unlock-pdf__preview"
                />
              ) : null}
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Open the file without
                a password, or download again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a password-protected PDF and unlock it to download a clean
              copy here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "PDF unlock runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
