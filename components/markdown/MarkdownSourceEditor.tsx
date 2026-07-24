"use client";

import { useId, type RefObject } from "react";
import { cn } from "@/lib/utils";

type MarkdownSourceEditorProps = {
  value: string;
  lineCount: number;
  placeholder?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  gutterRef: RefObject<HTMLDivElement | null>;
  onChange: (value: string) => void;
  onScroll: () => void;
};

export default function MarkdownSourceEditor({
  value,
  lineCount,
  placeholder,
  textareaRef,
  gutterRef,
  onChange,
  onScroll,
}: MarkdownSourceEditorProps) {
  const editorId = useId();

  return (
    <section className="md-pane" aria-label="Markdown source">
      <div className="md-pane__header">
        <h2 className="md-pane__title">Editor</h2>
      </div>
      <div className="md-source">
        <div className="md-source__gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index + 1} className="md-source__line-no">
              {index + 1}
            </span>
          ))}
        </div>
        <label className="sr-only" htmlFor={editorId}>
          Markdown source
        </label>
        <textarea
          ref={textareaRef}
          id={editorId}
          className={cn("md-source__input")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={onScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder={placeholder}
          aria-describedby="markdown-editor-status"
        />
      </div>
    </section>
  );
}
