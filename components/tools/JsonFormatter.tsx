"use client";

import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/Button";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  countJsonLines,
  downloadJson,
  formatErrorLocation,
  formatJson,
  minifyJson,
  validateJson,
  type JsonParseError,
} from "@/lib/json";
import { cn, copyText } from "@/lib/utils";

const PLACEHOLDER = `{
  "name": "Focera",
  "features": ["format", "validate", "minify"],
  "local": true
}`;

type Theme = "light" | "dark";
type Status =
  | { kind: "idle" }
  | { kind: "valid"; detail: string }
  | { kind: "invalid"; error: JsonParseError };

export default function JsonFormatter() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const editorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [errorMessage, setErrorMessage] = useState("");

  const lineCount = countJsonLines(input || " ");
  const errorLine =
    status.kind === "invalid" ? status.error.line : null;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("json-formatter-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function persistTheme(next: Theme) {
    setTheme(next);
    window.localStorage.setItem("json-formatter-theme", next);
  }

  function syncScroll() {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (!textarea || !gutter) return;
    gutter.scrollTop = textarea.scrollTop;
  }

  function applyResult(
    result: ReturnType<typeof formatJson>,
    successDetail: string,
  ) {
    setCopied(false);
    setErrorMessage("");

    if (!result.ok) {
      trackFailure();
      setStatus({ kind: "invalid", error: result.error });
      scrollToErrorLine(result.error.line);
      return;
    }

    trackSuccess();
    setInput(result.value);
    setStatus({ kind: "valid", detail: successDetail });
  }

  function scrollToErrorLine(line: number | null) {
    if (line === null || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const lineHeight = Number.parseFloat(
      window.getComputedStyle(textarea).lineHeight,
    );
    if (!Number.isFinite(lineHeight)) return;
    const top = Math.max(0, (line - 1) * lineHeight - textarea.clientHeight / 3);
    textarea.scrollTop = top;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
  }

  function handleFormat() {
    applyResult(formatJson(input), "Formatted with 2-space indentation");
  }

  function handleMinify() {
    applyResult(minifyJson(input), "Minified to a single line");
  }

  function handleValidate() {
    setCopied(false);
    setErrorMessage("");
    const result = validateJson(input);

    if (!result.ok) {
      setStatus({ kind: "invalid", error: result.error });
      scrollToErrorLine(result.error.line);
      return;
    }

    const type = Array.isArray(result.parsed)
      ? "array"
      : result.parsed === null
        ? "null"
        : typeof result.parsed;
    setStatus({ kind: "valid", detail: `Valid JSON (${type})` });
  }

  async function handleCopy() {
    if (!input.trim()) {
      setErrorMessage("Nothing to copy yet.");
      return;
    }

    const ok = await copyText(input);
    if (ok) {
      setCopied(true);
      setErrorMessage("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }

    setErrorMessage("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!input.trim()) {
      setErrorMessage("Nothing to download yet.");
      return;
    }

    const result = validateJson(input);
    if (!result.ok) {
      setStatus({ kind: "invalid", error: result.error });
      setErrorMessage("Fix validation errors before downloading.");
      return;
    }

    downloadJson(result.value);
    setErrorMessage("");
    setStatus({ kind: "valid", detail: "Downloaded formatted.json" });
  }

  function handleClear() {
    setInput("");
    setStatus({ kind: "idle" });
    setCopied(false);
    setErrorMessage("");
    textareaRef.current?.focus();
  }

  function handleChange(value: string) {
    setInput(value);
    setCopied(false);
    setErrorMessage("");
    if (status.kind !== "idle") {
      setStatus({ kind: "idle" });
    }
  }

  const location =
    status.kind === "invalid" ? formatErrorLocation(status.error) : null;

  return (
    <div
      className={cn(
        "json-formatter",
        theme === "dark" && "json-formatter--dark",
      )}
    >
      <div className="json-toolbar" role="toolbar" aria-label="JSON actions">
        <div className="json-toolbar__group">
          <Button onClick={handleFormat}>Format</Button>
          <Button variant="ghost" onClick={handleMinify}>
            Minify
          </Button>
          <Button variant="ghost" onClick={handleValidate}>
            Validate
          </Button>
        </div>
        <div className="json-toolbar__group">
          <Button
            variant="ghost"
            onClick={() => void handleCopy()}
            disabled={!input.trim()}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownload}
            disabled={!input.trim()}
          >
            Download
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={!input}>
            Clear
          </Button>
          <Button
            variant="ghost"
            onClick={() => persistTheme(theme === "dark" ? "light" : "dark")}
            aria-pressed={theme === "dark"}
            aria-label={
              theme === "dark" ? "Switch to light editor" : "Switch to dark editor"
            }
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </div>

      <div className="json-editor">
        <div className="json-editor__gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => {
            const line = index + 1;
            return (
              <span
                key={line}
                className={cn(
                  "json-editor__line-no",
                  errorLine === line && "is-error",
                )}
              >
                {line}
              </span>
            );
          })}
        </div>
        <label className="sr-only" htmlFor={editorId}>
          JSON input
        </label>
        <textarea
          ref={textareaRef}
          id={editorId}
          className={cn(
            "json-editor__input",
            status.kind === "invalid" && "is-invalid",
          )}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder={PLACEHOLDER}
          aria-invalid={status.kind === "invalid"}
          aria-describedby="json-formatter-status"
        />
      </div>

      <div
        id="json-formatter-status"
        className={cn(
          "json-status",
          status.kind === "valid" && "json-status--valid",
          status.kind === "invalid" && "json-status--invalid",
        )}
        role="status"
        aria-live="polite"
      >
        {status.kind === "idle" ? (
          <span>Paste JSON to format, validate, or minify — processed locally.</span>
        ) : null}
        {status.kind === "valid" ? (
          <span>
            <span className="json-status__badge">Valid</span>
            {status.detail}
          </span>
        ) : null}
        {status.kind === "invalid" ? (
          <span>
            <span className="json-status__badge">Invalid</span>
            {location ? `${location} — ` : null}
            {status.error.message}
          </span>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="tool-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <p className="tool-hint">
        Parsed in your browser · never uploaded · dark editor mode available
      </p>
    </div>
  );
}
