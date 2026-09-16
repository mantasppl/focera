import type { ContentTool } from "@/lib/content/types";

const TAG_SPLIT = /(<[^>]+>)/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Link the first occurrence of each tool name in HTML text nodes.
 * Skips content already inside an anchor tag.
 */
export function autoLinkToolKeywords(html: string, tools: ContentTool[]): string {
  if (!html.trim() || !tools.length) return html;

  const ranked = [...tools]
    .filter((tool) => tool.name.trim().length >= 4)
    .sort((a, b) => b.name.length - a.name.length);

  const parts = html.split(TAG_SPLIT);
  let insideAnchor = false;
  const used = new Set<string>();

  return parts
    .map((part) => {
      if (part.startsWith("<")) {
        const name = part.slice(1, part.indexOf(" ") > 0 ? part.indexOf(" ") : part.length - 1)
          .replace(/^\//, "")
          .toLowerCase();
        if (part.startsWith("</a")) insideAnchor = false;
        else if (name === "a") insideAnchor = true;
        return part;
      }
      if (insideAnchor || !part.trim()) return part;

      let next = part;
      for (const tool of ranked) {
        if (used.has(tool.id)) continue;
        const pattern = new RegExp(`\\b${escapeRegExp(tool.name)}\\b`);
        if (!pattern.test(next)) continue;
        used.add(tool.id);
        next = next.replace(
          pattern,
          `<a href="${tool.href}">${tool.name}</a>`,
        );
      }
      return next;
    })
    .join("");
}
