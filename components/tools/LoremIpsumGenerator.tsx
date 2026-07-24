"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import {
  DEFAULT_COUNT,
  LOREM_MODES,
  MAX_COUNT,
  MIN_COUNT,
  countParagraphs,
  countSentences,
  countWords,
  downloadLoremTxt,
  generateLorem,
  type LoremMode,
  type LoremOptions,
} from "@/lib/lorem";
import { cn, copyText } from "@/lib/utils";

const DEFAULT_OPTIONS: LoremOptions = {
  mode: "paragraphs",
  count: DEFAULT_COUNT.paragraphs,
  startWithLorem: true,
};

export default function LoremIpsumGenerator() {
  const countId = useId();
  const outputId = useId();
  const startId = useId();

  const [options, setOptions] = useState<LoremOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const maxCount = MAX_COUNT[options.mode];
  const wordCount = countWords(output);
  const sentenceCount = countSentences(output);
  const paragraphCount = countParagraphs(output);
  const charCount = output.length;

  function regenerate(next: LoremOptions = options) {
    try {
      const text = generateLorem(next);
      setOutput(text);
      setError("");
      setCopied(false);
    } catch {
      setError("Could not generate text. Try again.");
      setOutput("");
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOutput(generateLorem(DEFAULT_OPTIONS));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function setMode(mode: LoremMode) {
    if (mode === options.mode) return;
    const next: LoremOptions = {
      ...options,
      mode,
      count: DEFAULT_COUNT[mode],
    };
    setOptions(next);
    regenerate(next);
  }

  function setCount(value: number) {
    const count = Math.min(maxCount, Math.max(MIN_COUNT, Math.round(value)));
    const next = { ...options, count };
    setOptions(next);
    regenerate(next);
  }

  function toggleStartWithLorem() {
    const next = { ...options, startWithLorem: !options.startWithLorem };
    setOptions(next);
    regenerate(next);
  }

  async function handleCopy() {
    if (!output) return;
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
    if (!output) return;
    downloadLoremTxt(output);
  }

  return (
    <div className="tool-grid">
      <div className="tool-panel lorem-panel">
        <div
          className="lorem-modes"
          role="tablist"
          aria-label="Generation mode"
        >
          {LOREM_MODES.map((item) => {
            const selected = item.id === options.mode;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn("lorem-modes__tab", selected && "is-active")}
                onClick={() => setMode(item.id)}
              >
                <span className="lorem-modes__label">{item.label}</span>
                <span className="lorem-modes__hint">{item.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="lorem-count">
          <div className="lorem-count__header">
            <label className="ui-label" htmlFor={countId}>
              Number of {options.mode}
            </label>
            <output className="lorem-count__value" htmlFor={countId}>
              {options.count}
            </output>
          </div>
          <input
            id={countId}
            className="lorem-range"
            type="range"
            min={MIN_COUNT}
            max={maxCount}
            step={1}
            value={options.count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-valuemin={MIN_COUNT}
            aria-valuemax={maxCount}
            aria-valuenow={options.count}
            aria-valuetext={`${options.count} ${options.mode}`}
          />
          <div className="lorem-count__scale" aria-hidden="true">
            <span>{MIN_COUNT}</span>
            <span>{maxCount}</span>
          </div>
        </div>

        <label className="lorem-check" htmlFor={startId}>
          <input
            id={startId}
            type="checkbox"
            checked={options.startWithLorem}
            onChange={toggleStartWithLorem}
          />
          <span className="lorem-check__text">
            <span className="lorem-check__label">Start with Lorem ipsum</span>
            <span className="lorem-check__sample">
              Classic opening phrase
            </span>
          </span>
        </label>

        <div className="tool-actions">
          <Button onClick={() => regenerate()}>Generate</Button>
          <Button
            variant="ghost"
            onClick={() => void handleCopy()}
            disabled={!output}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownload}
            disabled={!output}
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

      <div className="tool-panel tool-panel--preview lorem-preview">
        <div className="lorem-output">
          <label className="ui-label" htmlFor={outputId}>
            Generated text
          </label>
          <textarea
            id={outputId}
            className="ui-input ui-input--textarea lorem-output__textarea"
            value={output}
            readOnly
            spellCheck={false}
            rows={12}
            placeholder="Your Lorem Ipsum will appear here"
            aria-live="polite"
          />
        </div>

        <dl className="lorem-stats">
          <div className="lorem-stats__item">
            <dt>Words</dt>
            <dd>{wordCount}</dd>
          </div>
          <div className="lorem-stats__item">
            <dt>Sentences</dt>
            <dd>{sentenceCount}</dd>
          </div>
          <div className="lorem-stats__item">
            <dt>Paragraphs</dt>
            <dd>{paragraphCount}</dd>
          </div>
          <div className="lorem-stats__item">
            <dt>Characters</dt>
            <dd>{charCount}</dd>
          </div>
        </dl>

        <p className="tool-hint">
          Generated locally in your browser · copy or download as TXT · never
          uploaded
        </p>
      </div>
    </div>
  );
}
