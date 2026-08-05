"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import { useToolAnalytics } from "@/lib/analytics/client";
import {
  READING_WPM,
  SPEAKING_WPM,
  analyzeText,
  formatDurationLabel,
} from "@/lib/word-count";
import { copyText } from "@/lib/utils";

const PLACEHOLDER =
  "Paste or type your text here — word, character, sentence, and reading-time counts update instantly.";

export default function WordCounter() {
  const { trackSuccess } = useToolAnalytics();
  const inputId = useId();

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const stats = analyzeText(text);

  async function handleCopy() {
    if (!text) {
      setError("Nothing to copy yet.");
      return;
    }
    const ok = await copyText(text);
    if (ok) {
      trackSuccess();
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    setError("Could not copy to clipboard. Try selecting the text manually.");
  }

  function handleClear() {
    setText("");
    setCopied(false);
    setError("");
  }

  return (
    <div className="word-counter">
      <div className="tool-panel word-counter__panel">
        <div className="ui-field">
          <label className="ui-label" htmlFor={inputId}>
            Your text
          </label>
          <textarea
            id={inputId}
            className="ui-input ui-input--textarea word-counter__textarea"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setCopied(false);
              setError("");
            }}
            rows={12}
            spellCheck
            placeholder={PLACEHOLDER}
          />
        </div>

        <div className="tool-actions word-counter__actions">
          <Button onClick={() => void handleCopy()} disabled={!text}>
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={!text}>
            Clear
          </Button>
        </div>

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="tool-hint">
          Counts update locally in your browser · never uploaded
        </p>
      </div>

      <div className="tool-panel tool-panel--preview word-counter__stats-panel">
        <h2 className="word-counter__stats-title">Live counts</h2>
        <dl className="word-counter__stats" aria-live="polite">
          <div className="word-counter__stat word-counter__stat--hero">
            <dt>Words</dt>
            <dd>{stats.words.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Characters</dt>
            <dd>{stats.characters.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Characters (no spaces)</dt>
            <dd>{stats.charactersNoSpaces.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Sentences</dt>
            <dd>{stats.sentences.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Paragraphs</dt>
            <dd>{stats.paragraphs.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Lines</dt>
            <dd>{stats.lines.toLocaleString()}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Reading time (~{READING_WPM} wpm)</dt>
            <dd>{formatDurationLabel(stats.readingMinutes)}</dd>
          </div>
          <div className="word-counter__stat">
            <dt>Speaking time (~{SPEAKING_WPM} wpm)</dt>
            <dd>{formatDurationLabel(stats.speakingMinutes)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
