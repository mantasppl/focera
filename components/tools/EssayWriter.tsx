"use client";

import { useId, useRef, useState } from "react";
import Button from "@/components/Button";
import {
  ESSAY_CITATIONS,
  ESSAY_LENGTHS,
  ESSAY_LEVELS,
  ESSAY_OUTPUTS,
  ESSAY_TYPES,
  ESSAY_VOICES,
  MAX_ESSAY_NOTES_LENGTH,
  MAX_ESSAY_TOPIC_LENGTH,
  type EssayCitationId,
  type EssayLengthId,
  type EssayLevelId,
  type EssayOutputId,
  type EssayTypeId,
  type EssayVoiceId,
  countWords,
  downloadEssayTxt,
  randomEssaySeed,
  validateEssayNotes,
  validateEssayTopic,
} from "@/lib/essay-writer";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn, copyText } from "@/lib/utils";

type TopicStarterId = "climate" | "social" | "college" | "history";

const TOPIC_STARTERS: {
  id: TopicStarterId;
  label: string;
  type: EssayTypeId;
  level: EssayLevelId;
  topic: string;
  notes: string;
}[] = [
  {
    id: "climate",
    label: "Climate",
    type: "argumentative",
    level: "high",
    topic: "Should governments spend more on renewable energy than on fossil-fuel subsidies?",
    notes: "Cover cost, jobs, and reliability. Include one fair counterargument.",
  },
  {
    id: "social",
    label: "Social media",
    type: "expository",
    level: "high",
    topic: "How social media use affects teenage sleep, attention, and mental health",
    notes: "Explain mechanisms with everyday examples rather than scare statistics.",
  },
  {
    id: "college",
    label: "College",
    type: "admission",
    level: "college",
    topic: "A time I had to change my approach after a plan failed",
    notes: "Personal statement voice. One specific scene, then what I learned.",
  },
  {
    id: "history",
    label: "History",
    type: "cause",
    level: "college",
    topic: "What caused the Industrial Revolution to accelerate in Britain first?",
    notes: "Focus on energy, institutions, and technology rather than a single-cause story.",
  },
];

export default function EssayWriter() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const topicId = useId();
  const notesId = useId();
  const typeGroupId = useId();
  const levelGroupId = useId();
  const lengthGroupId = useId();
  const citationGroupId = useId();
  const voiceGroupId = useId();
  const outputGroupId = useId();
  const resultId = useId();
  const topicRef = useRef<HTMLTextAreaElement>(null);

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<EssayTypeId>("argumentative");
  const [level, setLevel] = useState<EssayLevelId>("high");
  const [length, setLength] = useState<EssayLengthId>("standard");
  const [citation, setCitation] = useState<EssayCitationId>("none");
  const [voice, setVoice] = useState<EssayVoiceId>("academic");
  const [output, setOutput] = useState<EssayOutputId>("essay");
  const [seed, setSeed] = useState(() => randomEssaySeed());
  const [essay, setEssay] = useState("");
  const [resultMeta, setResultMeta] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStarter, setActiveStarter] = useState<TopicStarterId | null>(
    null,
  );

  const canWrite = topic.trim().length > 0 && !loading;
  const topicChars = topic.trim().length;
  const essayWords = countWords(essay);
  const activeType = ESSAY_TYPES.find((item) => item.id === type);
  const activeLength = ESSAY_LENGTHS.find((item) => item.id === length);

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
      updateTopic(clip.slice(0, MAX_ESSAY_TOPIC_LENGTH));
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
    setNotes("");
    setEssay("");
    setResultMeta(null);
    setCopied(false);
    focusTopic();
  }

  function applyStarter(starter: (typeof TOPIC_STARTERS)[number]) {
    updateTopic(starter.topic, starter.id);
    setNotes(starter.notes);
    setType(starter.type);
    setLevel(starter.level);
    focusTopic();
  }

  async function writeEssay(nextSeed = seed) {
    const topicError = validateEssayTopic(topic);
    if (topicError) {
      setError(topicError);
      return;
    }

    const notesError = validateEssayNotes(notes);
    if (notesError) {
      setError(notesError);
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);
    setEssay("");

    try {
      const response = await fetch("/api/essay-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          notes,
          type,
          level,
          length,
          citation,
          voice,
          output,
          seed: nextSeed,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        essay?: string;
        seed?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not write that essay. Try again.");
      }

      if (!data?.essay?.trim()) {
        throw new Error("Could not write that essay. Try again.");
      }

      setEssay(data.essay.trim());
      setSeed(typeof data.seed === "number" ? data.seed : nextSeed);
      setResultMeta(
        `${ESSAY_TYPES.find((item) => item.id === type)?.label ?? type} · ${
          ESSAY_LEVELS.find((item) => item.id === level)?.label ?? level
        } · ${ESSAY_LENGTHS.find((item) => item.id === length)?.label ?? length}`,
      );
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not write that essay. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    const nextSeed = randomEssaySeed();
    setSeed(nextSeed);
    void writeEssay(nextSeed);
  }

  async function handleCopy() {
    if (!essay) return;
    const ok = await copyText(essay);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!essay) return;
    downloadEssayTxt(essay, `essay-${seed}.txt`);
  }

  return (
    <div className="essay-writer">
      <div
        className="essay-writer__bar"
        role="toolbar"
        aria-label="Write an essay"
      >
        <Button
          onClick={() => {
            const nextSeed = randomEssaySeed();
            setSeed(nextSeed);
            void writeEssay(nextSeed);
          }}
          disabled={!canWrite}
        >
          {loading ? "Writing…" : "Write essay"}
        </Button>
        <Button
          onClick={handleRegenerate}
          disabled={!topic.trim() || loading}
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
          disabled={loading || (!topic && !notes && !essay)}
        >
          Clear
        </Button>
        <span className="essay-writer__bar-split" aria-hidden="true" />
        {TOPIC_STARTERS.map((starter) => (
          <button
            key={starter.id}
            type="button"
            className={cn(
              "essay-writer__start",
              activeStarter === starter.id && "is-active",
            )}
            disabled={loading}
            onClick={() => applyStarter(starter)}
          >
            {starter.label}
          </button>
        ))}
      </div>

      <div className="essay-writer__workspace">
        <div className="tool-panel essay-writer__panel">
          <div className="essay-writer__editor">
            <div className="essay-writer__editor-head">
              <label className="essay-writer__editor-title" htmlFor={topicId}>
                Topic or prompt
              </label>
              <span className="essay-writer__count">
                {topicChars.toLocaleString()}/{MAX_ESSAY_TOPIC_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              ref={topicRef}
              id={topicId}
              className="ui-input ui-input--textarea essay-writer__textarea essay-writer__textarea--topic"
              value={topic}
              onChange={(e) => updateTopic(e.target.value)}
              rows={4}
              maxLength={MAX_ESSAY_TOPIC_LENGTH}
              placeholder="Paste an assignment question, thesis idea, or topic. Then pick type, level, and length."
              spellCheck
            />
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor={notesId}>
              Extra notes
              <span className="essay-writer__optional"> optional</span>
            </label>
            <textarea
              id={notesId}
              className="ui-input ui-input--textarea essay-writer__notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              maxLength={MAX_ESSAY_NOTES_LENGTH}
              placeholder="Thesis, points to cover, sources to mention, or constraints…"
            />
          </div>

          <div className="ui-field">
            <span className="ui-label" id={typeGroupId}>
              Essay type
            </span>
            <div
              className="essay-writer__modes"
              role="radiogroup"
              aria-labelledby={typeGroupId}
            >
              {ESSAY_TYPES.map((option) => {
                const selected = type === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "essay-writer__mode",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setType(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {activeType ? (
              <p className="essay-writer__mode-hint">{activeType.hint}</p>
            ) : null}
          </div>

          <div className="ui-field">
            <span className="ui-label" id={levelGroupId}>
              Academic level
            </span>
            <div
              className="essay-writer__strength"
              role="radiogroup"
              aria-labelledby={levelGroupId}
            >
              {ESSAY_LEVELS.map((option) => {
                const selected = level === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "essay-writer__strength-btn",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setLevel(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={lengthGroupId}>
              Length
            </span>
            <div
              className="essay-writer__strength"
              role="radiogroup"
              aria-labelledby={lengthGroupId}
            >
              {ESSAY_LENGTHS.map((option) => {
                const selected = length === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "essay-writer__strength-btn",
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
              <p className="essay-writer__mode-hint">{activeLength.hint}</p>
            ) : null}
          </div>

          <div className="essay-writer__row">
            <div className="ui-field">
              <span className="ui-label" id={citationGroupId}>
                Citations
              </span>
              <div
                className="essay-writer__strength"
                role="radiogroup"
                aria-labelledby={citationGroupId}
              >
                {ESSAY_CITATIONS.map((option) => {
                  const selected = citation === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={option.hint}
                      className={cn(
                        "essay-writer__strength-btn",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => setCitation(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ui-field">
              <span className="ui-label" id={voiceGroupId}>
                Voice
              </span>
              <div
                className="essay-writer__strength"
                role="radiogroup"
                aria-labelledby={voiceGroupId}
              >
                {ESSAY_VOICES.map((option) => {
                  const selected = voice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={option.hint}
                      className={cn(
                        "essay-writer__strength-btn",
                        selected && "is-active",
                      )}
                      disabled={loading}
                      onClick={() => setVoice(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={outputGroupId}>
              Output
            </span>
            <div
              className="essay-writer__strength essay-writer__strength--two"
              role="radiogroup"
              aria-labelledby={outputGroupId}
            >
              {ESSAY_OUTPUTS.map((option) => {
                const selected = output === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.hint}
                    className={cn(
                      "essay-writer__strength-btn",
                      selected && "is-active",
                    )}
                    disabled={loading}
                    onClick={() => setOutput(option.id)}
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

        <div className="tool-panel tool-panel--preview essay-writer__panel">
          <div className="essay-writer__editor essay-writer__editor--out">
            <div className="essay-writer__editor-head">
              <div className="essay-writer__editor-meta">
                <label className="essay-writer__editor-title" htmlFor={resultId}>
                  Essay
                </label>
                <span className="essay-writer__count">
                  {essay
                    ? `${essayWords.toLocaleString()} words`
                    : "Waiting for a draft"}
                </span>
              </div>
              <div className="essay-writer__result-btns">
                <Button
                  onClick={() => void handleCopy()}
                  disabled={!essay || loading}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!essay || loading}
                  variant="ghost"
                >
                  Download
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="essay-writer__loading" role="status" aria-live="polite">
                <span className="tool-loading__spinner" aria-hidden="true" />
                <span>Writing your essay…</span>
              </div>
            ) : (
              <textarea
                id={resultId}
                className="ui-input ui-input--textarea essay-writer__textarea"
                value={essay}
                readOnly
                spellCheck={false}
                rows={16}
                placeholder="Your essay appears here"
                aria-live="polite"
              />
            )}
          </div>

          <p className="tool-hint">
            {essay && resultMeta
              ? `${essayWords.toLocaleString()} words · ${resultMeta}`
              : "Paste a prompt or tap Climate, Social media, College, or History to start."}
          </p>
        </div>
      </div>
    </div>
  );
}
