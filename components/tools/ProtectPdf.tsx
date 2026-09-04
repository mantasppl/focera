"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import PdfDropzone from "@/components/tools/PdfDropzone";
import { formatFileSize } from "@/lib/image";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  downloadProtectedPdf,
  protectPdfFile,
  type ProtectPdfResult,
} from "@/lib/protect-pdf";

export default function ProtectPdf() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const passwordId = useId();
  const confirmId = useId();
  const abortRef = useRef<AbortController | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProtectPdfResult | null>(null);

  const hasSource = Boolean(sourceFile);
  const hasResult = Boolean(result);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function clearResult() {
    setResult(null);
  }

  function handleFile(file: File) {
    abortRef.current?.abort();
    clearResult();
    setError("");
    setProgressText("");
    setPassword("");
    setConfirmPassword("");
    setSourceFile(file);
  }

  function handleReset() {
    abortRef.current?.abort();
    clearResult();
    setSourceFile(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setProgressText("");
    setLoading(false);
  }

  async function handleProtect() {
    if (!sourceFile) {
      setError("Upload a PDF to get started.");
      return;
    }

    if (!password.trim()) {
      setError("Enter a password to protect this PDF.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Re-enter the same password in both fields.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setProgressText("Encrypting PDF…");
    clearResult();

    try {
      const protectedPdf = await protectPdfFile(sourceFile, {
        password,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setProgressText("Saving protected PDF…");
      setResult(protectedPdf);
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
          : "Could not protect this PDF. Try another file or browser.";
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
    downloadProtectedPdf(result.blob, sourceFile);
  }

  return (
    <div className="tool-grid protect-pdf">
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

        <div className="protect-pdf__options">
          <div className="ui-field">
            <label className="ui-label" htmlFor={passwordId}>
              Password
            </label>
            <div className="protect-pdf__password-row">
              <input
                id={passwordId}
                className="ui-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || !hasSource}
                autoComplete="new-password"
                placeholder="Choose a password to open the PDF"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && hasSource && !loading) {
                    void handleProtect();
                  }
                }}
              />
              <button
                type="button"
                className="protect-pdf__toggle"
                disabled={loading || !hasSource}
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={confirmId}>
              Confirm password
            </label>
            <input
              id={confirmId}
              className="ui-input"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading || !hasSource}
              autoComplete="new-password"
              placeholder="Re-enter the same password"
              onKeyDown={(event) => {
                if (event.key === "Enter" && hasSource && !loading) {
                  void handleProtect();
                }
              }}
            />
            <p className="protect-pdf__hint">
              Anyone who opens the file will need this password. Store it
              safely — Focera cannot recover it.
            </p>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => void handleProtect()}
            disabled={!hasSource || loading}
          >
            {loading ? "Protecting…" : "Protect PDF"}
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
                {progressText || "Protecting PDF…"}
              </span>
              <span className="tool-loading__subtext">
                Encryption runs locally in your browser.
              </span>
            </div>
          ) : result ? (
            <div className="protect-pdf__success">
              <p className="protect-pdf__success-title">Protected PDF ready</p>
              <p className="protect-pdf__success-meta">
                {result.pageCount}{" "}
                {result.pageCount === 1 ? "page" : "pages"} · password added ·{" "}
                {formatFileSize(result.protectedSize)}
              </p>
              <ul className="protect-pdf__stats" aria-label="File details">
                <li>
                  <span className="protect-pdf__stat-label">Original</span>
                  <span className="protect-pdf__stat-value">
                    {formatFileSize(result.originalSize)}
                  </span>
                </li>
                <li>
                  <span className="protect-pdf__stat-label">Protected</span>
                  <span className="protect-pdf__stat-value">
                    {formatFileSize(result.protectedSize)}
                  </span>
                </li>
                <li>
                  <span className="protect-pdf__stat-label">Pages</span>
                  <span className="protect-pdf__stat-value">
                    {result.pageCount}
                  </span>
                </li>
              </ul>
              <p className="tool-placeholder preview-single__hint">
                Click Download when you want the file. Open the file with
                the password you set, or download again anytime.
              </p>
            </div>
          ) : (
            <p className="tool-placeholder">
              Upload a PDF, set a password, and protect it to download an
              encrypted copy here
            </p>
          )}
        </div>

        <p className="tool-hint">
          {hasResult
            ? "Download when you are ready · processed locally"
            : "PDF protection runs in your browser · files never upload to Focera"}
        </p>
      </div>
    </div>
  );
}
