"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import MarkdownPreview from "@/components/markdown/MarkdownPreview";
import MarkdownSourceEditor from "@/components/markdown/MarkdownSourceEditor";
import MarkdownStatusBar from "@/components/markdown/MarkdownStatusBar";
import MarkdownToolbar from "@/components/markdown/MarkdownToolbar";
import {
  SAMPLE_MARKDOWN,
  MARKDOWN_THEME_KEY,
  clearMarkdownDraft,
  countMarkdownLines,
  downloadHtmlFile,
  downloadMarkdownFile,
  downloadMarkdownPdf,
  getMarkdownStats,
  loadMarkdownDraft,
  markdownToHtml,
  saveMarkdownDraft,
} from "@/lib/markdown";
import { cn, copyText } from "@/lib/utils";

type Theme = "light" | "dark";

export default function MarkdownEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState("");
  const [theme, setTheme] = useState<Theme>("dark");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Write Markdown on the left — preview updates live, processed locally.",
  );
  const [statusTone, setStatusTone] = useState<"idle" | "ok" | "error">("idle");

  const deferredSource = useDeferredValue(source);
  const previewHtml = markdownToHtml(deferredSource);
  const stats = getMarkdownStats(source);
  const lineCount = countMarkdownLines(source || " ");
  const hasContent = Boolean(source.trim());

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedTheme = window.localStorage.getItem(MARKDOWN_THEME_KEY);
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }

      const draft = loadMarkdownDraft();
      if (draft !== null) {
        setSource(draft);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveMarkdownDraft(source);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [source]);

  function persistTheme(next: Theme) {
    setTheme(next);
    window.localStorage.setItem(MARKDOWN_THEME_KEY, next);
  }

  function syncScroll() {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (!textarea || !gutter) return;
    gutter.scrollTop = textarea.scrollTop;
  }

  function handleChange(value: string) {
    setSource(value);
    setCopiedHtml(false);
    setErrorMessage("");
    if (statusTone !== "idle") {
      setStatusTone("idle");
      setStatusMessage(
        "Write Markdown on the left — preview updates live, processed locally.",
      );
    }
  }

  function handleLoadSample() {
    startTransition(() => {
      setSource(SAMPLE_MARKDOWN);
      setCopiedHtml(false);
      setErrorMessage("");
      setStatusTone("ok");
      setStatusMessage("Loaded sample Markdown.");
    });
    textareaRef.current?.focus();
  }

  function handleClear() {
    setSource("");
    clearMarkdownDraft();
    setCopiedHtml(false);
    setErrorMessage("");
    setStatusTone("idle");
    setStatusMessage(
      "Write Markdown on the left — preview updates live, processed locally.",
    );
    textareaRef.current?.focus();
  }

  function handleExportMarkdown() {
    if (!hasContent) {
      setErrorMessage("Nothing to export yet.");
      return;
    }
    downloadMarkdownFile(source);
    setErrorMessage("");
    setStatusTone("ok");
    setStatusMessage("Downloaded document.md");
  }

  function handleExportHtml() {
    if (!hasContent) {
      setErrorMessage("Nothing to export yet.");
      return;
    }
    downloadHtmlFile(source);
    setErrorMessage("");
    setStatusTone("ok");
    setStatusMessage("Downloaded document.html");
  }

  async function handleExportPdf() {
    if (!hasContent) {
      setErrorMessage("Nothing to export yet.");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    try {
      await downloadMarkdownPdf(source);
      setStatusTone("ok");
      setStatusMessage("Downloaded document.pdf");
    } catch {
      setStatusTone("error");
      setStatusMessage("PDF export failed.");
      setErrorMessage("Could not generate the PDF. Try again with shorter content.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyHtml() {
    if (!hasContent) {
      setErrorMessage("Nothing to copy yet.");
      return;
    }

    const html = markdownToHtml(source);
    const ok = await copyText(html);
    if (ok) {
      setCopiedHtml(true);
      setErrorMessage("");
      setStatusTone("ok");
      setStatusMessage("Copied rendered HTML to clipboard.");
      window.setTimeout(() => setCopiedHtml(false), 1600);
      return;
    }

    setErrorMessage("Could not copy to clipboard. Try selecting the preview text manually.");
  }

  return (
    <div
      className={cn(
        "markdown-editor",
        theme === "dark" && "markdown-editor--dark",
      )}
    >
      <MarkdownToolbar
        busy={busy}
        hasContent={hasContent}
        copiedHtml={copiedHtml}
        theme={theme}
        onExportMarkdown={handleExportMarkdown}
        onExportHtml={handleExportHtml}
        onExportPdf={() => void handleExportPdf()}
        onCopyHtml={() => void handleCopyHtml()}
        onClear={handleClear}
        onToggleTheme={() =>
          persistTheme(theme === "dark" ? "light" : "dark")
        }
        onLoadSample={handleLoadSample}
      />

      <div className="md-workspace">
        <MarkdownSourceEditor
          value={source}
          lineCount={lineCount}
          placeholder={"# Heading\n\nStart writing Markdown…"}
          textareaRef={textareaRef}
          gutterRef={gutterRef}
          onChange={handleChange}
          onScroll={syncScroll}
        />
        <MarkdownPreview html={previewHtml} empty={!deferredSource.trim()} />
      </div>

      <MarkdownStatusBar
        stats={stats}
        message={statusMessage}
        tone={statusTone}
      />

      {errorMessage ? (
        <p className="tool-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <p className="tool-hint">
        Parsed in your browser · never uploaded · draft saved locally · dark
        mode available
      </p>
    </div>
  );
}
