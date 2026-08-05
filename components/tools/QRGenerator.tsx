"use client";

import { useId, useState } from "react";
import QRCode from "qrcode";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToolAnalytics } from "@/lib/analytics/client";
import { brandedDownloadFilename } from "@/lib/image";
import { copyText } from "@/lib/utils";

const QR_OPTIONS = {
  width: 512,
  margin: 2,
  color: {
    dark: "#0B1F1C",
    light: "#F4FBF8",
  },
  errorCorrectionLevel: "M" as const,
};

export default function QRGenerator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const inputId = useId();
  const [text, setText] = useState("https://");
  const [generatedText, setGeneratedText] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasQr = Boolean(qr);
  const canGenerate =
    text.trim().length > 0 && text.trim() !== "https://" && !loading;

  async function generateQr() {
    const value = text.trim();

    if (!value || value === "https://") {
      setError("Enter a URL or text to encode.");
      setQr("");
      setGeneratedText("");
      return;
    }

    setLoading(true);
    setError("");
    setQr("");
    setGeneratedText("");

    try {
      const dataUrl = await QRCode.toDataURL(value, QR_OPTIONS);
      setQr(dataUrl);
      setGeneratedText(value);
      trackSuccess();
    } catch {
      trackFailure();
      setError("Could not encode this text. Try a shorter value.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPng() {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr;
    link.download = brandedDownloadFilename("qr-code.png");
    link.click();
  }

  async function copyUrl() {
    if (!generatedText) return;

    const ok = await copyText(generatedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      return;
    }

    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          id={inputId}
          label="URL or text"
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void generateQr();
            }
          }}
          placeholder="https://example.com or any text"
          spellCheck={false}
          hint="Paste a link, email, phone number, or plain text."
        />

        <div className="tool-actions">
          <Button onClick={() => void generateQr()} disabled={!canGenerate}>
            {loading ? "Generating…" : "Generate QR"}
          </Button>
          <Button onClick={downloadPng} disabled={!hasQr || loading}>
            Download PNG
          </Button>
          <Button
            variant="ghost"
            onClick={() => void copyUrl()}
            disabled={!generatedText || loading}
          >
            {copied ? "Copied" : "Copy URL"}
          </Button>
        </div>

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div
          className={`tool-stage${hasQr ? " is-ready" : ""}${loading ? " is-loading" : ""}`}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Generating QR code…</span>
            </div>
          ) : hasQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Generated QR code" className="tool-qr-image" />
          ) : (
            <p className="tool-placeholder">Your QR code will appear here</p>
          )}
        </div>
        <p className="tool-hint">
          High-contrast PNG · medium error correction · generated locally in
          your browser
        </p>
      </div>
    </div>
  );
}
