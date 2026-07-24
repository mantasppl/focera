"use client";

import type { MarkdownStats } from "@/lib/markdown";
import { cn } from "@/lib/utils";

type MarkdownStatusBarProps = {
  stats: MarkdownStats;
  message: string;
  tone?: "idle" | "ok" | "error";
};

export default function MarkdownStatusBar({
  stats,
  message,
  tone = "idle",
}: MarkdownStatusBarProps) {
  return (
    <div
      id="markdown-editor-status"
      className={cn(
        "md-status",
        tone === "ok" && "md-status--ok",
        tone === "error" && "md-status--error",
      )}
      role="status"
      aria-live="polite"
    >
      <p className="md-status__message">{message}</p>
      <dl className="md-status__stats">
        <div>
          <dt>Words</dt>
          <dd>{stats.words}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>{stats.characters}</dd>
        </div>
        <div>
          <dt>Lines</dt>
          <dd>{stats.lines}</dd>
        </div>
        <div>
          <dt>Read</dt>
          <dd>{stats.readingMinutes === 0 ? "—" : `~${stats.readingMinutes} min`}</dd>
        </div>
      </dl>
    </div>
  );
}
