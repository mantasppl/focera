"use client";

type MarkdownPreviewProps = {
  html: string;
  empty: boolean;
};

export default function MarkdownPreview({ html, empty }: MarkdownPreviewProps) {
  return (
    <section className="md-pane" aria-label="Live Markdown preview">
      <div className="md-pane__header">
        <h2 className="md-pane__title">Preview</h2>
        <span className="md-pane__badge">Live</span>
      </div>
      {empty ? (
        <div className="md-preview md-preview--empty">
          <p>Start typing Markdown to see a live preview here.</p>
        </div>
      ) : (
        <div
          className="md-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </section>
  );
}
