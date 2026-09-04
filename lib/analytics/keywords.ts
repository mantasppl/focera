import { seoLandings } from "@/data/seo-landings";
import { tools } from "@/data/tools";

const SKIP_PATHS = new Set([
  "/",
  "/tools",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/pdf-tools",
  "/image-tools",
  "/video-tools",
  "/ai-tools",
  "/file-tools",
]);

let pathKeywordMap: Map<string, string> | null = null;

function buildPathKeywordMap(): Map<string, string> {
  if (pathKeywordMap) return pathKeywordMap;
  const map = new Map<string, string>();

  for (const landing of seoLandings) {
    map.set(landing.href, landing.keyword);
  }
  for (const tool of tools) {
    if (map.has(tool.href)) continue;
    const keyword = tool.keywords[0]?.trim() || tool.name;
    if (keyword) map.set(tool.href, keyword);
  }

  pathKeywordMap = map;
  return map;
}

function normalizePath(path: string): string {
  const trimmed = path.trim().split("?")[0]?.split("#")[0] ?? "";
  if (!trimmed.startsWith("/")) return "";
  const collapsed = trimmed.replace(/\/{2,}/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }
  return collapsed || "/";
}

/** Map a recorded page path to a search/SEO keyword, or null for generic pages. */
export function keywordForPath(path: string): string | null {
  const normalized = normalizePath(path);
  if (!normalized || SKIP_PATHS.has(normalized)) return null;
  return buildPathKeywordMap().get(normalized) || null;
}

export function landingPathsForTool(toolId: string): string[] {
  const hrefs = [tools.find((tool) => tool.slug === toolId)?.href].filter(
    (href): href is string => Boolean(href),
  );
  for (const landing of seoLandings) {
    if (landing.parentToolSlug === toolId) hrefs.push(landing.href);
  }
  return hrefs;
}
