"use client";

import { useId, useRef, useState } from "react";
import Button from "@/components/Button";
import {
  CONTENT_IMPROVER_MODES,
  CONTENT_IMPROVER_STRENGTHS,
  MAX_CONTENT_IMPROVER_LENGTH,
  type ContentImproverModeId,
  type ContentImproverStrengthId,
  countWords,
  downloadContentImproverTxt,
  randomContentImproverSeed,
  validateContentImproverText,
} from "@/lib/content-improver";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

type WriteStarterId = "email" | "caption" | "blog" | "product";

const WRITE_STARTERS: {
  id: WriteStarterId;
  label: string;
  mode: ContentImproverModeId;
  text: string;
}[] = [
  {
    id: "email",
    label: "Email",
    mode: "formal",
    text: "Hi,\n\nJust checking in about the project timeline. Can we move the deadline to Friday?\n\nThanks",
  },
  {
    id: "caption",
    label: "Caption",
    mode: "casual",
    text: "new drop is live!! super excited for this one, link in bio, dont miss it",
  },
  {
    id: "blog",
    label: "Blog",
    mode: "polish",
    text: "Remote work is good. It has benefits. People like flexibility and companies save money.",
  },
  {
    id: "product",
    label: "Product",
    mode: "persuasive",
    text: "Our app helps teams manage projects easier and faster then before.",
  },
];

export default function ContentImprover() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const inputId = useId();
  const modeGroupId = useId();
  const strengthGroupId = useId();
  const outputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState("");
  const [mode, setMode] = useState<ContentImproverModeId>("polish");
  const [strength, setStrength] =
    useState<ContentImproverStrengthId>("balanced");
  const [seed, setSeed] = useState(() => randomContentImproverSeed());
  const [improved, setImproved] = useState("");
  const [resultMode, setResultMode] = useState<ContentImproverModeId | null>(
    null,
  );
  const [resultStrength, setResultStrength] =
    useState<ContentImproverStrengthId | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStarter, setActiveStarter] = useState<WriteStarterId | null>(
    null,
  );

  const canImprove = text.trim().length > 0 && !loading;
  const inputWords = countWords(text);
  const outputWords = countWords(improved);
  const inputChars = text.trim().length;
  const activeMode = CONTENT_IMPROVER_MODES.find((item) => item.id === mode);

  function focusInput() {
    inputRef.current?.focus();
  }

  function updateDraft(next: string, starter: WriteStarterId | null = null) {
    setText(next);
    setActiveStarter(starter);
    if (error) setError("");
  }

  async function handlePaste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) {
        setError("Clipboard is empty. Copy some text, then tap Paste.");
        return;
      }
      updateDraft(clip.slice(0, MAX_CONTENT_IMPROVER_LENGTH));
      focusInput();
    } catch {
      setError("Could not paste. Allow clipboard access, or use Ctrl+V / Cmd+V.");
      focusInput();
    }
  }

  function handleClear() {
    updateDraft("");
    setImproved("");
    setResultMode(null);
    setResultStrength(null);
    setCopied(false);
    focusInput();
  }

  function applyStarter(starter: (typeof WRITE_STARTERS)[number]) {
    updateDraft(starter.text, starter.id);
    setMode(starter.mode);
    focusInput();
  }

  async function improveText(nextSeed = seed) {
    const textError = validateContentImproverText(text);
    if (textError) {
      setError(textError);
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);
    setImproved("");

    try {
      const response = await fetch("/api/content-improver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
          strength,
          seed: nextSeed,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        improved?: string;
        seed?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Could not improve that text. Try again.",
        );
      }

      if (!data?.improved?.trim()) {
        throw new Error("Could not improve that text. Try again.");
      }

      setImproved(data.improved.trim());
      setSeed(typeof data.seed === "number" ? data.seed : nextSeed);
      setResultMode(mode);
      setResultStrength(strength);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not improve that text. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    const nextSeed = randomContentImproverSeed();
    setSeed(nextSeed);
    void improveText(nextSeed);
  }

  async function handleCopy() {
    if (!improved) return;
    const ok = await copyText(improved);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!improved) return;
    downloadContentImproverTxt(improved, `improved-content-${seed}.txt`);
  }

  function handleUseAsInput() {
    if (!improved) return;
    updateDraft(improved);
    setImproved("");
    setResultMode(null);
    setResultStrength(null);
    setCopied(false);
    focusInput();
  }

  return (
    <div className="content-improver">
      <div
        className="content-improver__bar"
        role="toolbar"
        aria-label="Write and improve"
      >
        <Button
          onClick={() => {
            const nextSeed = randomContentImproverSeed();
            setSeed(nextSeed);
            void improveText(nextSeed);
          }}
          disabled={!canImprove}
        >
          {loading ? "Improving…" : "Improve"}
        </Button>
        <Button
          onClick={handleRegenerate}
          disabled={!text.trim() || loading}
          variant="ghost"
        >
          New variation
        </Button>
        <Button variant="ghost" onClick={() => void handlePaste()} disabled={loading}>
          Paste
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={loading || (!text && !improved)}
        >
          Clear
        </Button>
        <span className="content-improver__bar-split" aria-hidden="true" />
        {WRITE_STARTERS.map((starter) => (
          <button
            key={starter.id}
            type="button"
            className={cn(
              "content-improver__start",
              activeStarter === starter.id && "is-active",
            )}
            disabled={loading}
            onClick={() => applyStarter(starter)}
          >
            {starter.label}
          </button>
        ))}
      </div>

      <div className="content-improver__workspace">
        <div className="tool-panel content-improver__panel">
          <div className="content-improver__editor">
            <div className="content-improver__editor-head">
              <label className="content-improver__editor-title" htmlFor={inputId}>
                Your draft
              </label>
              <span className="content-improver__count">
                {inputWords.toLocaleString()} words · {inputChars.toLocaleString()}
                /{MAX_CONTENT_IMPROVER_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              ref={inputRef}
              id={inputId}
              className="ui-input ui-input--textarea content-improver__textarea"
              value={text}
              onChange={(e) => updateDraft(e.target.value)}
              rows={10}
              maxLength={MAX_CONTENT_IMPROVER_LENGTH}
              placeholder="Paste or type your draft. Then pick a mode and tap Improve."
              spellCheck
            />
          </div>

          <div className="ui-field">
            <span className="ui-label" id={modeGroupId}>
              How to improve
            </span>
            <div
              className="content-improver__modes"
              role="radiogroup"
              aria-labelledby={modeGroupId}
            >
              {CONTENT_IMPROVER_MODES.map((option) => {
                const selected = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "content-improver__mode",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setMode(option.id)}
                  >
                    {option.id === "seo" ? "SEO" : option.label}
                  </button>
                );
              })}
            </div>
            {activeMode ? (
              <p className="content-improver__mode-hint">{activeMode.hint}</p>
            ) : null}
          </div>

          <div className="ui-field">
            <span className="ui-label" id={strengthGroupId}>
              Strength
            </span>
            <div
              className="content-improver__strength"
              role="radiogroup"
              aria-labelledby={strengthGroupId}
            >
              {CONTENT_IMPROVER_STRENGTHS.map((option) => {
                const selected = strength === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "content-improver__strength-btn",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setStrength(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="tool-panel tool-panel--preview content-improver__panel">
          <div className="content-improver__editor content-improver__editor--out">
            <div className="content-improver__editor-head">
              <div className="content-improver__editor-meta">
                <label className="content-improver__editor-title" htmlFor={outputId}>
                  Improved
                </label>
                <span className="content-improver__count">
                  {improved
                    ? `${outputWords.toLocaleString()} words`
                    : "Waiting for a rewrite"}
                </span>
              </div>
              <div className="content-improver__result-btns">
                <Button
                  onClick={() => void handleCopy()}
                  disabled={!improved || loading}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!improved || loading}
                  variant="ghost"
                >
                  Download
                </Button>
                <Button
                  onClick={handleUseAsInput}
                  disabled={!improved || loading}
                  variant="ghost"
                >
                  Use as input
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="content-improver__loading" role="status" aria-live="polite">
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span>Improving your writing…</span>
              </div>
            ) : (
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea content-improver__textarea"
                value={improved}
                readOnly
                spellCheck={false}
                rows={10}
                placeholder="Improved text appears here"
                aria-live="polite"
              />
            )}
          </div>

          <p className="tool-hint">
            {improved && resultMode && resultStrength
              ? `${inputWords.toLocaleString()} → ${outputWords.toLocaleString()} words · ${resultMode} · ${resultStrength}`
              : "Paste a draft or tap Email, Caption, Blog, or Product to start."}
          </p>
        </div>
      </div>
    </div>
  );
}
