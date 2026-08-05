import { marked, type MarkedOptions } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { brandedDownloadFilename, downloadBlob } from "@/lib/image";
import { sanitizeHtmlBasic } from "@/lib/security/sanitize-html";

export const MARKDOWN_THEME_KEY = "markdown-editor-theme";
export const MARKDOWN_DRAFT_KEY = "markdown-editor-draft";

export type MarkdownStats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  readingMinutes: number;
};

export const SAMPLE_MARKDOWN = `# Markdown Editor

Write on the left. Preview updates live on the right.

## Features

- **Live preview** with GFM tables and lists
- **Syntax highlighting** for fenced code blocks
- Export **Markdown**, **HTML**, or **PDF**
- Copy rendered HTML to the clipboard
- Dark editor mode (preference stays on this device)

### Code example

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

| Action | Shortcut idea |
| --- | --- |
| Bold | \`**text**\` |
| Italic | \`*text*\` |
| Link | \`[label](url)\` |

> Everything runs in your browser — drafts never leave your device.
`;

const renderer = new marked.Renderer();

renderer.code = function code(
  { text, lang }: { text: string; lang?: string; escaped?: boolean },
): string {
  const language = (lang ?? "").trim().split(/\s+/)[0] || "";
  const valid =
    language && hljs.getLanguage(language) ? language : "plaintext";
  const highlighted = hljs.highlight(text, {
    language: valid,
    ignoreIllegals: true,
  }).value;

  return `<pre class="md-code"><code class="hljs language-${valid}">${highlighted}</code></pre>\n`;
};

const markedOptions: MarkedOptions = {
  gfm: true,
  breaks: false,
  renderer,
};

marked.setOptions(markedOptions);

export function markdownToHtml(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";

  const dirty = marked.parse(source, { async: false }) as string;

  if (typeof window === "undefined") {
    // Server path: DOMPurify needs a DOM. Use a strict string sanitizer instead.
    return sanitizeHtmlBasic(dirty);
  }

  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "class"],
  });
}

export function wrapHtmlDocument(
  bodyHtml: string,
  title = "Markdown export",
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0 auto;
      max-width: 46rem;
      padding: 2.5rem 1.25rem 4rem;
      font-family: "Segoe UI", system-ui, sans-serif;
      font-size: 1.05rem;
      line-height: 1.65;
      color: #14201d;
      background: #fff;
    }
    h1, h2, h3, h4 { line-height: 1.25; margin-top: 1.6em; }
    h1 { font-size: 2rem; }
    h2 { font-size: 1.45rem; border-bottom: 1px solid #d7e0dc; padding-bottom: 0.35rem; }
    a { color: #0f7a66; }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.9em;
      background: #eef4f1;
      padding: 0.12em 0.35em;
      border-radius: 0.25rem;
    }
    pre.md-code {
      overflow: auto;
      padding: 1rem 1.1rem;
      background: #0f1614;
      color: #e7f2ee;
      border-radius: 0.4rem;
    }
    pre.md-code code { background: transparent; padding: 0; color: inherit; }
    blockquote {
      margin: 1.2em 0;
      padding: 0.2em 0 0.2em 1rem;
      border-left: 3px solid #0f7a66;
      color: #4a635e;
    }
    table { border-collapse: collapse; width: 100%; margin: 1.2em 0; }
    th, td { border: 1px solid #c9d6d1; padding: 0.5rem 0.65rem; text-align: left; }
    th { background: #eef4f1; }
    img { max-width: 100%; height: auto; }
    hr { border: 0; border-top: 1px solid #d7e0dc; margin: 2rem 0; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function getMarkdownStats(source: string): MarkdownStats {
  const characters = source.length;
  const charactersNoSpaces = source.replace(/\s/g, "").length;
  const lines = source ? source.split(/\r\n|\r|\n/).length : 0;
  const words = source.trim()
    ? source.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingMinutes = Math.max(1, Math.ceil(words / 200)) || 0;

  return {
    characters,
    charactersNoSpaces,
    words,
    lines: source ? lines : 0,
    readingMinutes: words === 0 ? 0 : readingMinutes,
  };
}

export function countMarkdownLines(source: string): number {
  if (!source) return 1;
  return source.split(/\r\n|\r|\n/).length;
}

function triggerDownload(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

export function downloadMarkdownFile(
  source: string,
  filename = "document.md",
): void {
  triggerDownload(source, filename, "text/markdown;charset=utf-8");
}

export function downloadHtmlFile(
  source: string,
  filename = "document.html",
  title = "Markdown export",
): void {
  const body = markdownToHtml(source);
  const documentHtml = wrapHtmlDocument(body, title);
  triggerDownload(documentHtml, filename, "text/html;charset=utf-8");
}

export async function downloadMarkdownPdf(
  source: string,
  filename = "document.pdf",
  title = "Markdown export",
): Promise<void> {
  const bodyHtml = markdownToHtml(source);
  if (!bodyHtml.trim()) {
    throw new Error("Nothing to export yet.");
  }

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;padding:40px 48px;background:#ffffff;color:#14201d;font-family:Segoe UI,system-ui,sans-serif;font-size:15px;line-height:1.65;";
  host.innerHTML = `<h1 style="font-size:22px;margin:0 0 1.25rem;line-height:1.25;">${escapeHtml(title)}</h1>${bodyHtml}`;
  document.body.appendChild(host);

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save(brandedDownloadFilename(filename));
  } finally {
    host.remove();
  }
}

export function loadMarkdownDraft(): string | null {
  try {
    return window.localStorage.getItem(MARKDOWN_DRAFT_KEY);
  } catch {
    return null;
  }
}

export function saveMarkdownDraft(source: string): void {
  try {
    window.localStorage.setItem(MARKDOWN_DRAFT_KEY, source);
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearMarkdownDraft(): void {
  try {
    window.localStorage.removeItem(MARKDOWN_DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
}
