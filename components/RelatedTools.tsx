import type { CSSProperties } from "react";
import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";
import type { Tool, ToolCategory } from "@/data/tools";
import {
  getPrimaryCategory,
  getReadyTools,
  getToolBySlug,
  toolCardDescription,
} from "@/data/tools";
import { relatedToolSlugs } from "@/data/related-tools";
import { cn } from "@/lib/utils";

type RelatedToolsProps = {
  currentSlug: string;
  limit?: number;
  title?: string;
  className?: string;
};

const categoryHint: Record<ToolCategory, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  ai: "AI",
  file: "Utility",
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
  title = "Keep the momentum",
  className,
}: RelatedToolsProps) {
  const related = getRelatedTools(currentSlug, limit);
  if (!related.length) return null;

  return (
    <section
      className={cn("related-tools", className)}
      aria-labelledby="related-tools-heading"
    >
      <div className="related-tools__intro">
        <p className="related-tools__eyebrow">Up next</p>
        <h2 id="related-tools-heading" className="related-tools__title">
          {title}
        </h2>
        <p className="related-tools__lede">
          Three tools that pair with this workflow — free, private, and ready
          instantly in your browser.
        </p>
      </div>

      <ul className="related-tools__list">
        {related.map((tool, index) => {
          const category = categoryHint[getPrimaryCategory(tool)];
          const desc = toolCardDescription(tool, 78);

          return (
            <li
              key={tool.slug}
              className="related-tools__item"
              style={{ "--rt-i": index } as CSSProperties}
            >
              <Link href={tool.href} className="related-tools__link">
                <span className="related-tools__top">
                  <span className="related-tools__icon" aria-hidden="true">
                    <ToolIcon slug={tool.slug} className="related-tools__svg" />
                  </span>
                  <span className="related-tools__category">{category}</span>
                </span>
                <span className="related-tools__name">{tool.shortName}</span>
                <span className="related-tools__desc">{desc}</span>
                <span className="related-tools__cta">
                  Open tool
                  <span className="related-tools__arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="related-tools__more">
        <Link href="/tools" className="related-tools__more-link">
          Explore every tool
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </section>
  );
}
