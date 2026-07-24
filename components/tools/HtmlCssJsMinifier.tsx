"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import {
  MINIFY_MODES,
  downloadMinified,
  formatBytes,
  getMinifyMode,
  minifyCode,
  type MinifyMode,
  type MinifySuccess,
} from "@/lib/minify";
import { cn, copyText } from "@/lib/utils";

const DEFAULT_MODE: MinifyMode = "html";

export default function HtmlCssJsMinifier() {
  const inputId = useId();
  const outputId = useId();

  const [mode, setMode] = useState<MinifyMode>(DEFAULT_MODE);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<Omit<MinifySuccess, "ok" | "value"> | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeMode = getMinifyMode(mode);

  function selectMode(next: MinifyMode) {
    setMode(next);
    setOutput("");
    setStats(null);
    setCopied(false);
    setError("");
  }

  async function handleMinify() {
    setCopied(false);
    setError("");
    setBusy(true);

    try {
      const result = await minifyCode(mode, input);
      if (!result.ok) {
        setOutput("");
        setStats(null);
        setError(result.error);
        return;
      }

      setOutput(result.value);
      setStats({
        originalBytes: result.originalBytes,
        minifiedBytes: result.minifiedBytes,
        savedPercent: result.savedPercent,
      });
      setError("");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!output) {
      setError("Nothing to copy yet. Minify first.");
      return;
    }

    const ok = await copyText(output);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }

    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!output) {
      setError("Nothing to download yet. Minify first.");
      return;
    }

    downloadMinified(output, mode);
    setError("");
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setStats(null);
    setCopied(false);
    setError("");
  }

  function handleUseOutputAsInput() {
    if (!output) return;
    setInput(output);
    setOutput("");
    setStats(null);
    setCopied(false);
    setError("");
  }

  return (
    <div className="code-minifier">
      <div
        className="code-minifier__modes"
        role="tablist"
        aria-label="Code language"
      >
        {MINIFY_MODES.map((item) => {
          const selected = item.id === mode;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn("code-minifier__tab", selected && "is-active")}
              onClick={() => selectMode(item.id)}
            >
              <span className="code-minifier__tab-label">{item.label}</span>
              <span className="code-minifier__tab-hint">{item.hint}</span>
            </button>
          );
        })}
      </div>

      <p className="code-minifier__hint">{activeMode.hint}</p>

      <div className="code-minifier__workspace">
        <div className="tool-panel code-minifier__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={inputId}>
              Input ({activeMode.label})
            </label>
            <textarea
              id={inputId}
              className="ui-input ui-input--textarea code-minifier__textarea"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCopied(false);
                setError("");
              }}
              rows={14}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              placeholder={activeMode.placeholder}
            />
          </div>
        </div>

        <div className="tool-panel code-minifier__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={outputId}>
              Minified output
            </label>
            <textarea
              id={outputId}
              className="ui-input ui-input--textarea code-minifier__textarea code-minifier__textarea--output"
              value={output}
              readOnly
              rows={14}
              spellCheck={false}
              placeholder="Minified code appears here…"
              aria-live="polite"
            />
          </div>
        </div>
      </div>

      <div className="tool-actions code-minifier__actions">
        <Button
          onClick={() => void handleMinify()}
          disabled={!input.trim() || busy}
        >
          {busy ? "Minifying…" : `Minify ${activeMode.label}`}
        </Button>
        <Button
          variant="ghost"
          onClick={() => void handleCopy()}
          disabled={!output}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="ghost" onClick={handleDownload} disabled={!output}>
          Download
        </Button>
        <Button
          variant="ghost"
          onClick={handleUseOutputAsInput}
          disabled={!output}
        >
          Use output as input
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={!input && !output}
        >
          Clear
        </Button>
      </div>

      {stats ? (
        <dl className="code-minifier__stats" aria-live="polite">
          <div className="code-minifier__stat">
            <dt>Original</dt>
            <dd>{formatBytes(stats.originalBytes)}</dd>
          </div>
          <div className="code-minifier__stat">
            <dt>Minified</dt>
            <dd>{formatBytes(stats.minifiedBytes)}</dd>
          </div>
          <div className="code-minifier__stat">
            <dt>Saved</dt>
            <dd>{stats.savedPercent.toFixed(1)}%</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="tool-error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="tool-hint">
        Runs in your browser · HTML, CSS, and JS never leave your device
      </p>
    </div>
  );
}
