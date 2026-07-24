"use client";

import { useId, useState } from "react";
import Button from "@/components/Button";
import {
  TEXT_CASES,
  convertTextCase,
  countCharacters,
  countWords,
  type TextCaseId,
} from "@/lib/text-case";
import { cn, copyText } from "@/lib/utils";

const DEFAULT_CASE: TextCaseId = "title";
const PLACEHOLDER =
  "Paste or type your text here — then pick a case style to convert it instantly.";

export default function TextCaseConverter() {
  const inputId = useId();
  const outputId = useId();

  const [caseId, setCaseId] = useState<TextCaseId>(DEFAULT_CASE);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const output = convertTextCase(input, caseId);
  const charCount = countCharacters(input);
  const wordCount = countWords(input);
  const activeCase = TEXT_CASES.find((item) => item.id === caseId);

  function selectCase(nextId: TextCaseId) {
    setCaseId(nextId);
    setCopied(false);
    setError("");
  }

  async function handleCopy() {
    if (!output) {
      setError("Nothing to copy yet.");
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

  function handleClear() {
    setInput("");
    setCopied(false);
    setError("");
  }

  function handleUseOutputAsInput() {
    if (!output) return;
    setInput(output);
    setCopied(false);
    setError("");
  }

  return (
    <div className="text-case">
      <div
        className="text-case__modes"
        role="tablist"
        aria-label="Text case style"
      >
        {TEXT_CASES.map((item) => {
          const selected = item.id === caseId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn("text-case__tab", selected && "is-active")}
              onClick={() => selectCase(item.id)}
            >
              <span className="text-case__tab-label">{item.label}</span>
              <span className="text-case__tab-hint">{item.hint}</span>
            </button>
          );
        })}
      </div>

      {activeCase ? (
        <p className="text-case__hint">{activeCase.hint}</p>
      ) : null}

      <div className="text-case__workspace">
        <div className="tool-panel text-case__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={inputId}>
              Input
            </label>
            <textarea
              id={inputId}
              className="ui-input ui-input--textarea text-case__textarea"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCopied(false);
                setError("");
              }}
              rows={8}
              spellCheck={false}
              placeholder={PLACEHOLDER}
            />
          </div>

          <dl className="text-case__stats" aria-live="polite">
            <div className="text-case__stat">
              <dt>Characters</dt>
              <dd>{charCount}</dd>
            </div>
            <div className="text-case__stat">
              <dt>Words</dt>
              <dd>{wordCount}</dd>
            </div>
          </dl>
        </div>

        <div className="tool-panel tool-panel--preview text-case__panel">
          <div className="ui-field">
            <label className="ui-label" htmlFor={outputId}>
              Output · {activeCase?.label ?? "Converted"}
            </label>
            <textarea
              id={outputId}
              className="ui-input ui-input--textarea text-case__textarea text-case__textarea--output"
              value={output}
              readOnly
              spellCheck={false}
              rows={8}
              placeholder="Converted text appears here"
              aria-live="polite"
            />
          </div>

          <div className="tool-actions text-case__actions">
            <Button onClick={() => void handleCopy()} disabled={!output}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleUseOutputAsInput}
              disabled={!output}
            >
              Use as input
            </Button>
            <Button variant="ghost" onClick={handleClear} disabled={!input}>
              Clear
            </Button>
          </div>

          {error ? (
            <p className="tool-error" role="alert">
              {error}
            </p>
          ) : null}

          <p className="tool-hint">
            Converts locally in your browser · never uploaded
          </p>
        </div>
      </div>
    </div>
  );
}
