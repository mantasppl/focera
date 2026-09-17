"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ImageUrlField from "@/components/admin/content/ImageUrlField";
import { contentMarkdownToHtml } from "@/lib/content/markdown";
import { sanitizeHtmlBasic } from "@/lib/security/sanitize-html";
import { cn } from "@/lib/utils";

type EditorMode = "visual" | "html";
type Panel = "link" | "image" | null;

const FONTS = [
  { label: "Default", value: "" },
  { label: "System", value: "system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
] as const;

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"] as const;

const COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#111111" },
  { label: "Gray", value: "#4b5563" },
  { label: "Green", value: "#0f7a66" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#b91c1c" },
] as const;

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

function toVisualHtml(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return contentMarkdownToHtml(trimmed) || trimmed;
}

function normalizeHtml(html: string): string {
  const cleaned = sanitizeHtmlBasic(html)
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .trim();
  return cleaned === "<br>" ? "" : cleaned;
}

function safeUrl(raw: string, kind: "link" | "image"): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value)) return null;
  if (kind === "link") {
    if (
      /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value)
    ) {
      return value;
    }
    return `https://${value}`;
  }
  if (/^(https?:\/\/|\/)/i.test(value)) return value;
  return null;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function TextBlockEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [mode, setMode] = useState<EditorMode>("visual");
  const [panel, setPanel] = useState<Panel>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    if (mode !== "visual") return;
    const el = editorRef.current;
    if (!el || document.activeElement === el) return;
    const next = toVisualHtml(value);
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value, mode]);

  function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const el = editorRef.current;
    if (el && el.contains(range.commonAncestorContainer)) {
      savedRange.current = range;
    }
  }

  function restoreSelection() {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection) return;
    el.focus();
    if (selection.rangeCount > 0) {
      const current = selection.getRangeAt(0);
      if (
        el.contains(current.commonAncestorContainer) &&
        !current.collapsed
      ) {
        return;
      }
    }
    if (savedRange.current) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
  }

  function emitVisual() {
    const html = normalizeHtml(editorRef.current?.innerHTML || "");
    onChange(html);
  }

  function run(command: string, commandValue?: string) {
    restoreSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, commandValue);
    emitVisual();
    saveSelection();
  }

  function applyFontSize(size: string) {
    restoreSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");
    const editor = editorRef.current;
    if (editor) {
      editor
        .querySelectorAll(
          'font[size="7"], [style*="xxx-large"], [style*="xx-large"]',
        )
        .forEach((node) => {
          const span = document.createElement("span");
          span.style.fontSize = size;
          span.innerHTML = (node as HTMLElement).innerHTML;
          node.replaceWith(span);
        });
    }
    emitVisual();
    saveSelection();
  }

  function applyHeading(tag: string) {
    restoreSelection();
    document.execCommand("formatBlock", false, tag);
    emitVisual();
    saveSelection();
  }

  function applyLink(event: FormEvent) {
    event.preventDefault();
    const href = safeUrl(linkUrl, "link");
    if (!href) return;
    run("createLink", href);
    const editor = editorRef.current;
    editor?.querySelectorAll("a[href]").forEach((anchor) => {
      const a = anchor as HTMLAnchorElement;
      if (a.getAttribute("href") === href) {
        a.setAttribute("rel", "noopener noreferrer");
        if (/^https?:\/\//i.test(href)) a.setAttribute("target", "_blank");
      }
    });
    emitVisual();
    setPanel(null);
  }

  function insertImageFromFields() {
    const src = safeUrl(imageUrl, "image");
    if (!src) return;
    restoreSelection();
    const alt = escapeAttr(imageAlt.trim());
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${escapeAttr(src)}" alt="${alt}" />`,
    );
    emitVisual();
    setImageUrl("");
    setImageAlt("");
    setPanel(null);
  }

  function switchMode(next: EditorMode) {
    if (next === mode) return;
    if (next === "html") {
      onChange(normalizeHtml(editorRef.current?.innerHTML || value));
    }
    setPanel(null);
    setMode(next);
  }

  return (
    <div className="admin-text-editor">
      <div className="admin-text-editor__modes" role="tablist" aria-label="Text editor mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "visual"}
          className={cn(mode === "visual" && "is-active")}
          onClick={() => switchMode("visual")}
        >
          Visual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "html"}
          className={cn(mode === "html" && "is-active")}
          onClick={() => switchMode("html")}
        >
          HTML
        </button>
      </div>

      {mode === "visual" ? (
        <>
          <div className="admin-text-editor__toolbar" role="toolbar" aria-label="Text formatting">
            <select
              aria-label="Paragraph style"
              defaultValue="p"
              onMouseDown={saveSelection}
              onChange={(event) => applyHeading(event.target.value)}
            >
              <option value="p">Paragraph</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="blockquote">Quote</option>
            </select>
            <select
              aria-label="Font"
              defaultValue=""
              onMouseDown={saveSelection}
              onChange={(event) => {
                const next = event.target.value;
                if (next) run("fontName", next);
              }}
            >
              {FONTS.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Text size"
              defaultValue="16px"
              onMouseDown={saveSelection}
              onChange={(event) => applyFontSize(event.target.value)}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size.replace("px", "")}
                </option>
              ))}
            </select>
            <select
              aria-label="Text color"
              defaultValue=""
              onMouseDown={saveSelection}
              onChange={(event) => {
                const next = event.target.value;
                if (!next) return;
                run("foreColor", next);
              }}
            >
              {COLORS.map((color) => (
                <option key={color.label} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>

            <button type="button" aria-label="Bold" onMouseDown={(event) => event.preventDefault()} onClick={() => run("bold")}>
              B
            </button>
            <button type="button" aria-label="Italic" onMouseDown={(event) => event.preventDefault()} onClick={() => run("italic")}>
              I
            </button>
            <button type="button" aria-label="Underline" onMouseDown={(event) => event.preventDefault()} onClick={() => run("underline")}>
              U
            </button>
            <button
              type="button"
              aria-label="Strikethrough"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("strikeThrough")}
            >
              S
            </button>
            <button
              type="button"
              aria-label="Bullet list"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("insertUnorderedList")}
            >
              • List
            </button>
            <button
              type="button"
              aria-label="Numbered list"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("insertOrderedList")}
            >
              1. List
            </button>
            <button
              type="button"
              aria-label="Align left"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("justifyLeft")}
            >
              Left
            </button>
            <button
              type="button"
              aria-label="Align center"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("justifyCenter")}
            >
              Center
            </button>
            <button
              type="button"
              aria-label="Align right"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("justifyRight")}
            >
              Right
            </button>
            <button
              type="button"
              aria-label="Add link"
              className={cn(panel === "link" && "is-active")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                saveSelection();
                setPanel((current) => (current === "link" ? null : "link"));
              }}
            >
              Link
            </button>
            <button
              type="button"
              aria-label="Remove link"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("unlink")}
            >
              Unlink
            </button>
            <button
              type="button"
              aria-label="Add image"
              className={cn(panel === "image" && "is-active")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                saveSelection();
                setPanel((current) => (current === "image" ? null : "image"));
              }}
            >
              Image
            </button>
            <button
              type="button"
              aria-label="Clear formatting"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => run("removeFormat")}
            >
              Clear
            </button>
          </div>

          {panel === "link" ? (
            <form className="admin-text-editor__panel" onSubmit={applyLink}>
              <label className="admin-field admin-field--grow">
                Link URL
                <input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://focera.co/compress-pdf"
                  autoFocus
                />
              </label>
              <button type="submit" className="ui-btn ui-btn--primary">
                Add link
              </button>
            </form>
          ) : null}

          {panel === "image" ? (
            <div className="admin-text-editor__panel admin-text-editor__panel--stack">
              <ImageUrlField
                label="Image"
                value={imageUrl}
                onChange={setImageUrl}
                onUploaded={(url) => {
                  restoreSelection();
                  document.execCommand(
                    "insertHTML",
                    false,
                    `<img src="${escapeAttr(url)}" alt="${escapeAttr(imageAlt.trim())}" />`,
                  );
                  emitVisual();
                  setImageUrl("");
                  setPanel(null);
                }}
              />
              <label className="admin-field">
                Alt text
                <input
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="Describe the image"
                />
              </label>
              <button
                type="button"
                className="ui-btn ui-btn--primary"
                onClick={insertImageFromFields}
              >
                Insert image
              </button>
            </div>
          ) : null}

          <div
            ref={editorRef}
            className="admin-text-editor__surface blog-prose"
            contentEditable
            role="textbox"
            aria-label="Post text"
            aria-multiline="true"
            data-placeholder="Write the post. Select text, then use the toolbar."
            suppressContentEditableWarning
            onInput={emitVisual}
            onBlur={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onPaste={(event) => {
              const html = event.clipboardData.getData("text/html");
              const text = event.clipboardData.getData("text/plain");
              if (!html && !text) return;
              event.preventDefault();
              const inserted = html
                ? sanitizeHtmlBasic(html)
                : escapeAttr(text).replace(/\n/g, "<br>");
              document.execCommand("insertHTML", false, inserted);
              emitVisual();
            }}
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey)) return;
              const key = event.key.toLowerCase();
              if (key === "b") {
                event.preventDefault();
                run("bold");
              } else if (key === "i") {
                event.preventDefault();
                run("italic");
              } else if (key === "u") {
                event.preventDefault();
                run("underline");
              } else if (key === "k") {
                event.preventDefault();
                saveSelection();
                setPanel("link");
              }
            }}
          />
        </>
      ) : (
        <label className="admin-field admin-text-editor__html-field">
          HTML
          <textarea
            className="admin-text-editor__html"
            rows={12}
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="<p>Write HTML for this text block.</p>"
          />
        </label>
      )}
    </div>
  );
}
