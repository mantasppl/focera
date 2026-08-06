import Link from "next/link";
import type { Tool } from "@/data/tools";
import {
  getPrimaryCategory,
  getReadyTools,
  getToolBySlug,
} from "@/data/tools";
import { relatedToolSlugs } from "@/data/related-tools";
import { cn } from "@/lib/utils";

type RelatedToolsProps = {
  currentSlug: string;
  limit?: number;
  title?: string;
  className?: string;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function relatednessScore(current: Tool, candidate: Tool): number {
  let score = 0;

  const currentPrimary = getPrimaryCategory(current);
  const candidatePrimary = getPrimaryCategory(candidate);

  if (currentPrimary === candidatePrimary) score += 40;
  else if (candidate.categories.includes(currentPrimary)) score += 24;

  const sharedCategories = current.categories.filter((category) =>
    candidate.categories.includes(category),
  ).length;
  score += sharedCategories * 12;

  const currentTokens = new Set([
    ...tokenize(current.slug),
    ...tokenize(current.shortName),
    ...current.keywords.flatMap(tokenize),
  ]);
  const candidateTokens = new Set([
    ...tokenize(candidate.slug),
    ...tokenize(candidate.shortName),
    ...candidate.keywords.flatMap(tokenize),
  ]);

  let keywordHits = 0;
  for (const token of currentTokens) {
    if (token.length < 3) continue;
    if (candidateTokens.has(token)) keywordHits += 1;
  }
  score += Math.min(keywordHits, 8) * 6;

  return score;
}

export function getRelatedTools(currentSlug: string, limit = 3): Tool[] {
  const ready = getReadyTools();
  const bySlug = new Map(ready.map((tool) => [tool.slug, tool]));
  const current = getToolBySlug(currentSlug);
  const picked: Tool[] = [];
  const seen = new Set<string>([currentSlug]);

  const curated = relatedToolSlugs[currentSlug] ?? [];
  for (const slug of curated) {
    if (picked.length >= limit) break;
    const tool = bySlug.get(slug);
    if (!tool || seen.has(tool.slug)) continue;
    picked.push(tool);
    seen.add(tool.slug);
  }

  if (picked.length >= limit) return picked;

  const candidates = ready
    .filter((tool) => !seen.has(tool.slug))
    .map((tool) => ({
      tool,
      score: current ? relatednessScore(current, tool) : 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tool.shortName.localeCompare(b.tool.shortName);
    });

  for (const { tool } of candidates) {
    if (picked.length >= limit) break;
    picked.push(tool);
  }

  return picked;
}

export default function RelatedTools({
  currentSlug,
  limit = 3,
  title = "Use next",
  className,
}: RelatedToolsProps) {
  const related = getRelatedTools(currentSlug, limit);
  if (!related.length) return null;

  return (
    <section
      className={cn("related-tools", className)}
      aria-labelledby="related-tools-heading"
    >
      <h2 id="related-tools-heading" className="related-tools__title">
        {title}
      </h2>
      <p className="related-tools__lede">
        Three related tools that fit this workflow — every one runs locally in
        your browser.
      </p>
      <ul className="related-tools__list">
        {related.map((tool) => (
          <li key={tool.slug}>
            <Link href={tool.href} className="related-tools__link">
              <span className="related-tools__name">{tool.shortName}</span>
              <span className="related-tools__desc">{tool.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
