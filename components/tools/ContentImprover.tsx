"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
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

const EXAMPLE_SNIPPETS = [
  "Our team are working on a new product that will hopefully help customers to better manage there projects more easier and faster then before.",
  "This blog post talks about why remote work is good. Remote work has benefits. People like flexibility. Companies can save money on offices.",
  "Hey — just checking if you got my last email? Would love to sync sometime this week if you're free to chat through next steps asap.",
];

export default function ContentImprover() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const inputId = useId();
  const modeGroupId = useId();
  const strengthGroupId = useId();
  const outputId = useId();

  const [text, setText] = useState("");
  const [mode, setMode] = useState<ContentImproverModeId>("polish");
  const [strength, setStrength] =
    useState<ContentImproverStrengthId>("balanced");
  const [seed, setSeed] = useState(() => randomContentImproverSeed());
  const [improved, setImproved] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canImprove = text.trim().length > 0 && !loading;
  const inputWords = countWords(text);
  const outputWords = countWords(improved);
  const inputChars = text.trim().length;

  async function improveText(nextSeed = seed) {
    const textError = validateContentImproverText(text);
    if (textError) {
      setError(textError);
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

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
    setText(improved);
    setImproved("");
    setError("");
    setCopied(false);
  }

  function applyExample(example: string) {
    setText(example);
    if (error) setError("");
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          id={inputId}
          as="textarea"
          label="Your text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          rows={8}
          maxLength={MAX_CONTENT_IMPROVER_LENGTH}
          placeholder="Paste a draft, email, caption, essay paragraph, or product copy…"
          hint={`${inputChars.toLocaleString()}/${MAX_CONTENT_IMPROVER_LENGTH.toLocaleString()} · ${inputWords.toLocaleString()} words`}
        />

        <div
          className="content-improver__examples"
          aria-label="Example drafts"
        >
          {EXAMPLE_SNIPPETS.map((example) => (
            <button
              key={example}
              type="button"
              className="content-improver__example"
              disabled={loading}
              onClick={() => applyExample(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <div className="content-improver__options">
          <div className="ui-field">
            <span className="ui-label" id={modeGroupId}>
              Improvement mode
            </span>
            <div
              className="content-improver__chips content-improver__chips--mode"
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
                    className={cn(
                      "content-improver__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setMode(option.id)}
                  >
                    <span className="content-improver__chip-label">
                      {option.label}
                    </span>
                    <span className="content-improver__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={strengthGroupId}>
              Rewrite strength
            </span>
            <div
              className="content-improver__chips content-improver__chips--strength"
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
                    className={cn(
                      "content-improver__chip",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setStrength(option.id)}
                  >
                    <span className="content-improver__chip-label">
                      {option.label}
                    </span>
                    <span className="content-improver__chip-hint">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => {
              const nextSeed = randomContentImproverSeed();
              setSeed(nextSeed);
              void improveText(nextSeed);
            }}
            disabled={!canImprove}
          >
            {loading ? "Improving…" : "Improve content"}
          </Button>
          <Button
            onClick={handleRegenerate}
            disabled={!text.trim() || loading}
            variant="ghost"
          >
            New variation
          </Button>
          <Button
            onClick={() => void handleCopy()}
            disabled={!improved || loading}
            variant="ghost"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!improved || loading}
            variant="ghost"
          >
            Download TXT
          </Button>
          <Button
            onClick={handleUseAsInput}
            disabled={!improved || loading}
            variant="ghost"
          >
            Use as input
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
          className={cn(
            "tool-stage content-improver__stage",
            improved && "is-ready",
            loading && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Improving your writing…</span>
              <span className="tool-loading__subtext">
                Usually takes a few seconds. Free models can be slower when busy.
              </span>
            </div>
          ) : (
            <div className="content-improver__output">
              <label className="ui-label" htmlFor={outputId}>
                Improved text
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea content-improver__textarea"
                value={improved}
                readOnly
                spellCheck={false}
                rows={16}
                placeholder="Your improved content will appear here"
                aria-live="polite"
              />
            </div>
          )}
        </div>
        <p className="tool-hint">
          {improved
            ? `${inputWords.toLocaleString()} → ${outputWords.toLocaleString()} words · ${mode} · ${strength} · seed ${seed}`
            : "AI content improver · free · no account required"}
        </p>
      </div>
    </div>
  );
}
