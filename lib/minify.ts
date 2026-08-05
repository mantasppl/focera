import { brandedDownloadFilename } from "@/lib/image";

export type MinifyMode = "html" | "css" | "js";

export type MinifySuccess = {
  ok: true;
  value: string;
  originalBytes: number;
  minifiedBytes: number;
  savedPercent: number;
};

export type MinifyFailure = {
  ok: false;
  error: string;
};

export type MinifyResult = MinifySuccess | MinifyFailure;

export const MINIFY_MODES: Array<{
  id: MinifyMode;
  label: string;
  hint: string;
  extension: string;
  mime: string;
  placeholder: string;
}> = [
  {
    id: "html",
    label: "HTML",
    hint: "Strip comments & collapse whitespace",
    extension: "html",
    mime: "text/html;charset=utf-8",
    placeholder: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Focera</title>
    <!-- remove me -->
  </head>
  <body>
    <h1>  Hello   world  </h1>
    <pre>
  keep
    spacing
</pre>
  </body>
</html>`,
  },
  {
    id: "css",
    label: "CSS",
    hint: "Compress selectors, rules & values",
    extension: "css",
    mime: "text/css;charset=utf-8",
    placeholder: `/* card layout */
.card {
  display: flex;
  gap: 1rem;
  padding: 16px 24px;
  background-color: #ffffff;
  border-radius: 8px;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(11, 31, 28);
}`,
  },
  {
    id: "js",
    label: "JS",
    hint: "Terser minify — safe for modern JS",
    extension: "js",
    mime: "text/javascript;charset=utf-8",
    placeholder: `function greet(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

greet("Focera");`,
  },
];

export function getMinifyMode(id: MinifyMode) {
  return MINIFY_MODES.find((mode) => mode.id === id)!;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function withStats(original: string, value: string): MinifySuccess {
  const originalBytes = byteLength(original);
  const minifiedBytes = byteLength(value);
  const savedPercent =
    originalBytes === 0
      ? 0
      : Math.max(0, ((originalBytes - minifiedBytes) / originalBytes) * 100);

  return {
    ok: true,
    value,
    originalBytes,
    minifiedBytes,
    savedPercent,
  };
}

function emptyInputError(): MinifyFailure {
  return { ok: false, error: "Paste some code to minify." };
}

/** Tags whose inner text must keep whitespace as authored. */
const PRESERVE_TAGS = new Set([
  "pre",
  "textarea",
  "script",
  "style",
  "code",
  "kbd",
  "samp",
]);

function collapseTagWhitespace(tag: string): string {
  let result = "";
  let i = 0;

  while (i < tag.length) {
    const ch = tag[i]!;

    if (ch === '"' || ch === "'") {
      const end = tag.indexOf(ch, i + 1);
      if (end === -1) {
        result += tag.slice(i);
        break;
      }
      result += tag.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < tag.length && /\s/.test(tag[j]!)) j += 1;
      const next = tag[j];
      // Drop whitespace after "<", before ">" / "/>", otherwise keep one space.
      if (!(next === ">" || next === "/" || i === 1)) {
        result += " ";
      }
      i = j;
      continue;
    }

    result += ch;
    i += 1;
  }

  return result;
}

/**
 * Browser-safe HTML minifier: removes comments, collapses inter-tag
 * whitespace, and trims text nodes outside preserve tags.
 */
export function minifyHtml(input: string): MinifyResult {
  const source = input;
  if (!source.trim()) return emptyInputError();

  try {
    let output = "";
    let i = 0;
    let preserveDepth = 0;

    while (i < source.length) {
      if (source.startsWith("<!--", i)) {
        const end = source.indexOf("-->", i + 4);
        if (end === -1) {
          output += source.slice(i);
          break;
        }
        i = end + 3;
        continue;
      }

      if (source[i] === "<") {
        const tagEnd = source.indexOf(">", i);
        if (tagEnd === -1) {
          output += source.slice(i);
          break;
        }

        const rawTag = source.slice(i, tagEnd + 1);
        output += collapseTagWhitespace(rawTag);

        const tagMatch = rawTag.match(/^<\/?\s*([a-zA-Z][\w:-]*)/);
        const tagName = tagMatch?.[1]?.toLowerCase() ?? "";
        const isClosing = rawTag.startsWith("</");
        const isSelfClosing =
          /\/>$/.test(rawTag) ||
          /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
            tagName,
          );

        if (PRESERVE_TAGS.has(tagName) && !isSelfClosing) {
          preserveDepth = isClosing
            ? Math.max(0, preserveDepth - 1)
            : preserveDepth + 1;
        }

        i = tagEnd + 1;
        continue;
      }

      const nextTag = source.indexOf("<", i);
      const chunkEnd = nextTag === -1 ? source.length : nextTag;
      const text = source.slice(i, chunkEnd);

      if (preserveDepth > 0) {
        output += text;
      } else {
        const collapsed = text.replace(/\s+/g, " ");
        if (collapsed.trim().length > 0) {
          output += collapsed;
        }
      }

      i = chunkEnd;
    }

    output = output.replace(/>\s+</g, "><").replace(/^\s+|\s+$/g, "");
    return withStats(source, output);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not minify HTML.",
    };
  }
}

export async function minifyCss(input: string): Promise<MinifyResult> {
  const source = input;
  if (!source.trim()) return emptyInputError();

  try {
    const { minify } = await import("csso");
    const { css } = minify(source);
    return withStats(source, css);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not minify CSS.",
    };
  }
}

export async function minifyJs(input: string): Promise<MinifyResult> {
  const source = input;
  if (!source.trim()) return emptyInputError();

  try {
    const { minify } = await import("terser");
    const result = await minify(source, {
      compress: true,
      mangle: true,
      format: { comments: false },
    });

    if (typeof result.code !== "string") {
      return { ok: false, error: "Terser returned an empty result." };
    }

    return withStats(source, result.code);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not minify JavaScript.",
    };
  }
}

export async function minifyCode(
  mode: MinifyMode,
  input: string,
): Promise<MinifyResult> {
  if (mode === "html") return minifyHtml(input);
  if (mode === "css") return minifyCss(input);
  return minifyJs(input);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadMinified(
  text: string,
  mode: MinifyMode,
  filename?: string,
): void {
  const meta = getMinifyMode(mode);
  const blob = new Blob([text], { type: meta.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = brandedDownloadFilename(
    filename ?? `minified.${meta.extension}`,
  );
  link.click();
  URL.revokeObjectURL(url);
}
