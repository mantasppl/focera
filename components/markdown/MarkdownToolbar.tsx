"use client";

import Button from "@/components/Button";

type MarkdownToolbarProps = {
  busy: boolean;
  hasContent: boolean;
  copiedHtml: boolean;
  theme: "light" | "dark";
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onCopyHtml: () => void;
  onClear: () => void;
  onToggleTheme: () => void;
  onLoadSample: () => void;
};

export default function MarkdownToolbar({
  busy,
  hasContent,
  copiedHtml,
  theme,
  onExportMarkdown,
  onExportHtml,
  onExportPdf,
  onCopyHtml,
  onClear,
  onToggleTheme,
  onLoadSample,
}: MarkdownToolbarProps) {
  return (
    <div className="md-toolbar" role="toolbar" aria-label="Markdown actions">
      <div className="md-toolbar__group">
        <Button
          variant="ghost"
          onClick={onExportMarkdown}
          disabled={!hasContent || busy}
        >
          Export MD
        </Button>
        <Button
          variant="ghost"
          onClick={onExportHtml}
          disabled={!hasContent || busy}
        >
          Export HTML
        </Button>
        <Button onClick={onExportPdf} disabled={!hasContent || busy}>
          {busy ? "Exporting…" : "Export PDF"}
        </Button>
        <Button
          variant="ghost"
          onClick={onCopyHtml}
          disabled={!hasContent || busy}
        >
          {copiedHtml ? "Copied HTML" : "Copy HTML"}
        </Button>
      </div>
      <div className="md-toolbar__group">
        <Button variant="ghost" onClick={onLoadSample} disabled={busy}>
          Sample
        </Button>
        <Button
          variant="ghost"
          onClick={onClear}
          disabled={!hasContent || busy}
        >
          Clear
        </Button>
        <Button
          variant="ghost"
          onClick={onToggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={
            theme === "dark" ? "Switch to light editor" : "Switch to dark editor"
          }
        >
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>
    </div>
  );
}
