"use client";

import { useEffect, useId, useState } from "react";
import QRCode from "qrcode";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function QRGenerator() {
  const inputId = useId();
  const [text, setText] = useState("https://");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const value = text.trim();
      if (!value || value === "https://") {
        setQr("");
        setError("");
        return;
      }

      try {
        const url = await QRCode.toDataURL(value, {
          width: 512,
          margin: 2,
          color: {
            dark: "#0B1F1C",
            light: "#F4FBF8",
          },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setQr(url);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setQr("");
          setError("Could not encode this text. Try a shorter value.");
        }
      }
    }

    const timer = setTimeout(render, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  async function downloadPng() {
    if (!qr) return;
    const link = document.createElement("a");
    link.href = qr;
    link.download = "qr-code.png";
    link.click();
  }

  async function copyImage() {
    if (!qr || !navigator.clipboard?.write) return;
    try {
      const res = await fetch(qr);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard copy is not supported in this browser.");
    }
  }

  function clearInput() {
    setText("");
    setQr("");
    setError("");
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          as="textarea"
          id={inputId}
          label="Content"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com or any text"
          spellCheck={false}
        />

        <div className="tool-actions">
          <Button onClick={downloadPng} disabled={!qr}>
            Download PNG
          </Button>
          <Button variant="ghost" onClick={copyImage} disabled={!qr}>
            {copied ? "Copied" : "Copy image"}
          </Button>
          <Button variant="ghost" onClick={clearInput}>
            Clear
          </Button>
        </div>

        {error ? <p className="tool-error">{error}</p> : null}
      </div>

      <div className="tool-panel tool-panel--preview">
        <div className={`tool-stage${qr ? " is-ready" : ""}`}>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Generated QR code" className="tool-qr-image" />
          ) : (
            <p className="tool-placeholder">Your QR code will appear here</p>
          )}
        </div>
        <p className="tool-hint">
          High-contrast PNG · medium error correction · works offline in your
          browser
        </p>
      </div>
    </div>
  );
}
