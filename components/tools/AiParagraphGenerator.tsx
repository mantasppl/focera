"use client";

import { useId, useRef, useState } from "react";
import Button from "@/components/Button";
import {
  MAX_PARAGRAPH_KEYWORDS_LENGTH,
  MAX_PARAGRAPH_TOPIC_LENGTH,
  PARAGRAPH_COUNTS,
  PARAGRAPH_LENGTHS,
  PARAGRAPH_PURPOSES,
  PARAGRAPH_TONES,
  type ParagraphCountId,
  type ParagraphLengthId,
  type ParagraphPurposeId,
  type ParagraphToneId,
  countParagraphs,
  countWords,
  downloadParagraphTxt,
  randomParagraphSeed,
  validateParagraphKeywords,
  validateParagraphTopic,
} from "@/lib/ai-paragraph-generator";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

type TopicStarterId = "remote" | "habit" | "product" | "climate";

const TOPIC_STARTERS: {
  id: TopicStarterId;
  label: string;
  tone: ParagraphToneId;
  purpose: ParagraphPurposeId;
  topic: string;
  keywords: string;
}[] = [
  {
    id: "remote",
    label: "Remote work",
    tone: "professional",
    purpose: "blog",
    topic:
      "Why async updates reduce meeting overload for distributed product teams",
    keywords: "async, standup, focus time, timezone",
  },
  {
    id: "habit",
    label: "Habits",
    tone: "friendly",
    purpose: "general",
    topic:
      "How a two-minute morning routine makes it easier to stick with reading every day",
    keywords: "tiny habits, consistency, morning",
  },
  {
    id: "product",
    label: "Product",
    tone: "persuasive",
    purpose: "product",
    topic:
      "A password manager that fills logins on every device without slowing you down",
    keywords: "security, autofill, sync, ease of use",
  },
  {
    id: "climate",
    label: "Climate",
    tone: "formal",
    purpose: "school",
    topic:
      "How urban trees lower summer heat and improve air quality in dense neighborhoods",
    keywords: "heat island, canopy, air quality",
  },
];

export default function AiParagraphGenerator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const topicId = useId();
  const keywordsId = useId();
  const toneGroupId = useId();
  const lengthGroupId = useId();
  const countGroupId = useId();
  const purposeGroupId = useId();
  const resultId = useId();
  const topicRef = useRef<HTMLTextAreaElement>(null);

  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState<ParagraphToneId>("neutral");
  const [length, setLength] = useState<ParagraphLengthId>("medium");
  const [count, setCount] = useState<ParagraphCountId>("1");
  const [purpose, setPurpose] = useState<ParagraphPurposeId>("general");
  const [seed, setSeed] = useState(() => randomParagraphSeed());
  const [paragraphs, setParagraphs] = useState("");
  const [resultMeta, setResultMeta] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStarter, setActiveStarter] = useState<TopicStarterId | null>(
    null,
  );

  const canGenerate = topic.trim().length > 0 && !loading;
  const topicChars = topic.trim().length;
  const paragraphWords = countWords(paragraphs);
  const paragraphBlocks = countParagraphs(paragraphs);
  const activeLength = PARAGRAPH_LENGTHS.find((item) => item.id === length);
  const activeCount = PARAGRAPH_COUNTS.find((item) => item.id === count);

  function focusTopic() {
    topicRef.current?.focus();
  }

  function updateTopic(next: string, starter: TopicStarterId | null = null) {
    setTopic(next);
    setActiveStarter(starter);
    if (error) setError("");
  }

  async function handlePaste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) {
        setError("Clipboard is empty. Copy a prompt, then tap Paste.");
        return;
      }
      updateTopic(clip.slice(0, MAX_PARAGRAPH_TOPIC_LENGTH));
      focusTopic();
    } catch {
      setError(
        "Could not paste. Allow clipboard access, or use Ctrl+V / Cmd+V.",
      );
      focusTopic();
    }
  }

  function handleClear() {
    updateTopic("");
    setKeywords("");
    setParagraphs("");
    setResultMeta(null);
    setCopied(false);
    focusTopic();
  }

  function applyStarter(starter: (typeof TOPIC_STARTERS)[number]) {
    updateTopic(starter.topic, starter.id);
    setKeywords(starter.keywords);
    setTone(starter.tone);
    setPurpose(starter.purpose);
    focusTopic();
  }

  async function generateParagraphs(nextSeed = seed) {
    const topicError = validateParagraphTopic(topic);
    if (topicError) {
      setError(topicError);
      return;
    }

    const keywordsError = validateParagraphKeywords(keywords);
    if (keywordsError) {
      setError(keywordsError);
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);
    setParagraphs("");

    try {
      const response = await fetch("/api/ai-paragraph-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          keywords,
          tone,
          length,
          count,
          purpose,
          seed: nextSeed,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        paragraphs?: string;
        seed?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Could not generate those paragraphs. Try again.",
        );
      }

      if (!data?.paragraphs?.trim()) {
        throw new Error("Could not generate those paragraphs. Try again.");
      }

      setParagraphs(data.paragraphs.trim());
      setSeed(typeof data.seed === "number" ? data.seed : nextSeed);
      setResultMeta(
        `${PARAGRAPH_TONES.find((item) => item.id === tone)?.label ?? tone} · ${
          PARAGRAPH_PURPOSES.find((item) => item.id === purpose)?.label ??
          purpose
        } · ${PARAGRAPH_LENGTHS.find((item) => item.id === length)?.label ?? length}`,
      );
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate those paragraphs. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    const nextSeed = randomParagraphSeed();
    setSeed(nextSeed);
    void generateParagraphs(nextSeed);
  }

  async function handleCopy() {
    if (!paragraphs) return;
    const ok = await copyText(paragraphs);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!paragraphs) return;
    downloadParagraphTxt(paragraphs, `paragraphs-${seed}.txt`);
  }

  return (
    <div className="ai-paragraph">
      <div
        className="ai-paragraph__bar"
        role="toolbar"
        aria-label="Generate paragraphs"
      >
        <Button
          onClick={() => {
            const nextSeed = randomParagraphSeed();
            setSeed(nextSeed);
            void generateParagraphs(nextSeed);
          }}
          disabled={!canGenerate}
        >
          {loading ? "Writing…" : "Generate"}
        </Button>
        <Button
          onClick={handleRegenerate}
          disabled={!topic.trim() || loading}
          variant="ghost"
        >
          New variation
        </Button>
        <Button
          variant="ghost"
          onClick={() => void handlePaste()}
          disabled={loading}
        >
          Paste
        </Button>
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={loading || (!topic && !keywords && !paragraphs)}
        >
          Clear
        </Button>
        <span className="ai-paragraph__bar-split" aria-hidden="true" />
        {TOPIC_STARTERS.map((starter) => (
          <button
            key={starter.id}
            type="button"
            className={cn(
              "ai-paragraph__start",
              activeStarter === starter.id && "is-active",
            )}
            disabled={loading}
            onClick={() => applyStarter(starter)}
          >
            {starter.label}
          </button>
        ))}
      </div>

      <div className="ai-paragraph__workspace">
        <div className="tool-panel ai-paragraph__panel">
          <div className="ai-paragraph__editor">
            <div className="ai-paragraph__editor-head">
              <label className="ai-paragraph__editor-title" htmlFor={topicId}>
                Topic or brief
              </label>
              <span className="ai-paragraph__count">
                {topicChars.toLocaleString()}/
                {MAX_PARAGRAPH_TOPIC_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              ref={topicRef}
              id={topicId}
              className="ui-input ui-input--textarea ai-paragraph__textarea ai-paragraph__textarea--topic"
              value={topic}
              onChange={(e) => updateTopic(e.target.value)}
              rows={4}
              maxLength={MAX_PARAGRAPH_TOPIC_LENGTH}
              placeholder="Describe what the paragraph should cover. Then pick tone, length, and how many paragraphs you need."
              spellCheck
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={keywordsId}>
              Keywords to include
              <span className="ai-paragraph__optional"> optional</span>
            </label>
            <textarea
              id={keywordsId}
              className="ui-input ui-input--textarea ai-paragraph__notes"
              value={keywords}
              onChange={(e) => {
                setKeywords(e.target.value);
                if (error) setError("");
              }}
              rows={2}
              maxLength={MAX_PARAGRAPH_KEYWORDS_LENGTH}
              placeholder="Words, phrases, or points to weave in naturally…"
            />
          </div>

          <div className="ui-field">
            <span className="ui-label" id={toneGroupId}>
              Tone
            </span>
            <div
              className="ai-paragraph__modes"
              role="radiogroup"
              aria-labelledby={toneGroupId}
            >
              {PARAGRAPH_TONES.map((option) => {
                const selected = tone === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "ai-paragraph__mode",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setTone(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={purposeGroupId}>
              Purpose
            </span>
            <div
              className="ai-paragraph__modes"
              role="radiogroup"
              aria-labelledby={purposeGroupId}
            >
              {PARAGRAPH_PURPOSES.map((option) => {
                const selected = purpose === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "ai-paragraph__mode",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setPurpose(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ai-paragraph__row">
            <div className="ui-field">
              <span className="ui-label" id={lengthGroupId}>
                Length
              </span>
              <div
                className="ai-paragraph__strength"
                role="radiogroup"
                aria-labelledby={lengthGroupId}
              >
                {PARAGRAPH_LENGTHS.map((option) => {
                  const selected = length === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={option.hint}
                      className={cn(
                        "ai-paragraph__strength-btn",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => setLength(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {activeLength ? (
                <p className="ai-paragraph__mode-hint">{activeLength.hint}</p>
              ) : null}
            </div>

            <div className="ui-field">
              <span className="ui-label" id={countGroupId}>
                Paragraphs
              </span>
              <div
                className="ai-paragraph__strength ai-paragraph__strength--four"
                role="radiogroup"
                aria-labelledby={countGroupId}
              >
                {PARAGRAPH_COUNTS.map((option) => {
                  const selected = count === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={option.hint}
                      className={cn(
                        "ai-paragraph__strength-btn",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => setCount(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {activeCount ? (
                <p className="ai-paragraph__mode-hint">{activeCount.hint}</p>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="tool-panel tool-panel--preview ai-paragraph__panel">
          <div className="ai-paragraph__editor ai-paragraph__editor--out">
            <div className="ai-paragraph__editor-head">
              <div className="ai-paragraph__editor-meta">
                <label
                  className="ai-paragraph__editor-title"
                  htmlFor={resultId}
                >
                  Paragraphs
                </label>
                <span className="ai-paragraph__count">
                  {paragraphs
                    ? `${paragraphWords.toLocaleString()} words · ${paragraphBlocks} paragraph${paragraphBlocks === 1 ? "" : "s"}`
                    : "Waiting for a draft"}
                </span>
              </div>
              <div className="ai-paragraph__result-btns">
                <Button
                  onClick={() => void handleCopy()}
                  disabled={!paragraphs || loading}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!paragraphs || loading}
                  variant="ghost"
                >
                  Download
                </Button>
              </div>
            </div>
            {loading ? (
              <div
                className="ai-paragraph__loading"
                role="status"
                aria-live="polite"
              >
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span>Writing your paragraphs…</span>
              </div>
            ) : (
              <textarea
                id={resultId}
                className="ui-input ui-input--textarea ai-paragraph__textarea"
                value={paragraphs}
                readOnly
                spellCheck={false}
                rows={14}
                placeholder="Your paragraphs appear here"
                aria-live="polite"
              />
            )}
          </div>

          <p className="tool-hint">
            {paragraphs && resultMeta
              ? `${paragraphWords.toLocaleString()} words · ${resultMeta}`
              : "Paste a brief or tap Remote work, Habits, Product, or Climate to start."}
          </p>
        </div>
      </div>
    </div>
  );
}
