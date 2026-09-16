import { marked } from "marked";
import { sanitizeHtmlBasic } from "@/lib/security/sanitize-html";

marked.setOptions({ gfm: true, breaks: true });

export function contentMarkdownToHtml(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";
  const dirty = marked.parse(trimmed, { async: false }) as string;
  return sanitizeHtmlBasic(dirty);
}
