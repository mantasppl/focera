"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  AI_STORY_GENRES,
  AI_STORY_LENGTHS,
  AI_STORY_TONES,
  MAX_AI_STORY_PROMPT_LENGTH,
  type AiStoryGenreId,
  type AiStoryLengthId,
  type AiStoryToneId,
  countWords,
  downloadAiStoryTxt,
  randomAiStorySeed,
  validateAiStoryPrompt,
} from "@/lib/ai-story";
import { cn, copyText } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "A lighthouse keeper finds a sealed bottle with tomorrow’s newspaper inside",
  "Two rival bakers compete in a storm-cut mountain town",
  "A shy robot discovers an abandoned music box that plays memories",
];

export default function AiStoryGenerator() {
  const promptId = useId();
  const genreId = useId();
  const lengthId = useId();
  const toneId = useId();
  const outputId = useId();

  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState<AiStoryGenreId>("adventure");
  const [length, setLength] = useState<AiStoryLengthId>("short");
  const [tone, setTone] = useState<AiStoryToneId>("neutral");
  const [seed, setSeed] = useState(() => randomAiStorySeed());
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = prompt.trim().length > 0 && !loading;
  const wordCount = countWords(story);

  async function generateStory(nextSeed = seed) {
    const promptError = validateAiStoryPrompt(prompt);
    if (promptError) {
      setError(promptError);
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch("/api/ai-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          genre,
          length,
          tone,
          seed: nextSeed,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        story?: string;
        seed?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Could not generate a story. Try again.",
        );
      }

      if (!data?.story?.trim()) {
        throw new Error("Could not generate a story. Try again.");
      }

      setStory(data.story.trim());
      setSeed(typeof data.seed === "number" ? data.seed : nextSeed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate a story. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    const nextSeed = randomAiStorySeed();
    setSeed(nextSeed);
    void generateStory(nextSeed);
  }

  async function handleCopy() {
    if (!story) return;
    const ok = await copyText(story);
    if (ok) {
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleDownload() {
    if (!story) return;
    downloadAiStoryTxt(story, `focera-ai-story-${seed}.txt`);
  }

  function applyExample(example: string) {
    setPrompt(example);
    if (error) setError("");
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel">
        <Input
          id={promptId}
          as="textarea"
          label="Story idea"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (error) setError("");
          }}
          rows={5}
          maxLength={MAX_AI_STORY_PROMPT_LENGTH}
          placeholder="Describe a premise, character, setting, or twist…"
          hint={`${prompt.trim().length}/${MAX_AI_STORY_PROMPT_LENGTH} · A concrete idea works better than a single word`}
        />

        <div className="ai-story__examples" aria-label="Example prompts">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              className="ai-story__example"
              disabled={loading}
              onClick={() => applyExample(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <div className="ai-story__options">
          <div className="ui-field">
            <span className="ui-label" id={genreId}>
              Genre
            </span>
            <div
              className="ai-story__chips ai-story__chips--genre"
              role="radiogroup"
              aria-labelledby={genreId}
            >
              {AI_STORY_GENRES.map((option) => {
                const selected = genre === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn("ai-story__chip", selected && "is-active")}
                    disabled={loading}
                    onClick={() => setGenre(option.id)}
                  >
                    <span className="ai-story__chip-label">{option.label}</span>
                    <span className="ai-story__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={lengthId}>
              Length
            </span>
            <div
              className="ai-story__chips ai-story__chips--length"
              role="radiogroup"
              aria-labelledby={lengthId}
            >
              {AI_STORY_LENGTHS.map((option) => {
                const selected = length === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn("ai-story__chip", selected && "is-active")}
                    disabled={loading}
                    onClick={() => setLength(option.id)}
                  >
                    <span className="ai-story__chip-label">{option.label}</span>
                    <span className="ai-story__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label" id={toneId}>
              Tone
            </span>
            <div
              className="ai-story__chips ai-story__chips--tone"
              role="radiogroup"
              aria-labelledby={toneId}
            >
              {AI_STORY_TONES.map((option) => {
                const selected = tone === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn("ai-story__chip", selected && "is-active")}
                    disabled={loading}
                    onClick={() => setTone(option.id)}
                  >
                    <span className="ai-story__chip-label">{option.label}</span>
                    <span className="ai-story__chip-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tool-actions">
          <Button
            onClick={() => {
              const nextSeed = randomAiStorySeed();
              setSeed(nextSeed);
              void generateStory(nextSeed);
            }}
            disabled={!canGenerate}
          >
            {loading ? "Writing…" : "Generate story"}
          </Button>
          <Button
            onClick={handleRegenerate}
            disabled={!prompt.trim() || loading}
            variant="ghost"
          >
            New variation
          </Button>
          <Button
            onClick={() => void handleCopy()}
            disabled={!story || loading}
            variant="ghost"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!story || loading}
            variant="ghost"
          >
            Download TXT
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
            "tool-stage ai-story__stage",
            story && "is-ready",
            loading && "is-loading",
          )}
        >
          {loading ? (
            <div className="tool-loading" role="status" aria-live="polite">
              <span className="tool-loading__spinner" aria-hidden="true" />
              <span className="tool-loading__text">Writing your story…</span>
              <span className="tool-loading__subtext">
                Usually takes a few seconds. Free models can be slower when busy.
              </span>
            </div>
          ) : (
            <div className="ai-story__output">
              <label className="ui-label" htmlFor={outputId}>
                Generated story
              </label>
              <textarea
                id={outputId}
                className="ui-input ui-input--textarea ai-story__textarea"
                value={story}
                readOnly
                spellCheck={false}
                rows={16}
                placeholder="Your AI story will appear here"
                aria-live="polite"
              />
            </div>
          )}
        </div>
        <p className="tool-hint">
          {story
            ? `${wordCount.toLocaleString()} words · seed ${seed} · copy or download as TXT`
            : "AI story generator · free · no account required"}
        </p>
      </div>
    </div>
  );
}
