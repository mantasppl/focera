"use client";

import { useEffect, useState, type CSSProperties } from "react";
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

const RELATED_POOL_SIZE = 12;
const MIN_RELEVANCE_SCORE = 24;

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

function weightedSample(
  scored: { tool: Tool; score: number }[],
  limit: number,
): Tool[] {
  const pool = scored.map((entry) => ({
    tool: entry.tool,
    weight: Math.max(entry.score, 1),
  }));
  const picked: Tool[] = [];

  while (picked.length < limit && pool.length) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let ticket = Math.random() * total;
    let index = 0;
    for (; index < pool.length; index += 1) {
      ticket -= pool[index].weight;
      if (ticket <= 0) break;
    }
    index = Math.min(index, pool.length - 1);
    picked.push(pool[index].tool);
    pool.splice(index, 1);
  }

  return picked;
}

export function getRelatedTools(currentSlug: string, limit = 3): Tool[] {
  const ready = getReadyTools();
  const current = getToolBySlug(currentSlug);
  const curated = new Set(relatedToolSlugs[currentSlug] ?? []);

  const scored = ready
    .filter((tool) => tool.slug !== currentSlug)
    .map((tool) => {
      let score = current ? relatednessScore(current, tool) : 0;
      if (curated.has(tool.slug)) score += 50;
      return { tool, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tool.shortName.localeCompare(b.tool.shortName);
    });

  if (!scored.length) return [];

  const relevant = scored.filter((entry) => entry.score >= MIN_RELEVANCE_SCORE);
  const pool = (relevant.length >= limit ? relevant : scored).slice(
    0,
    Math.max(RELATED_POOL_SIZE, limit),
  );

  return weightedSample(pool, Math.min(limit, pool.length));
}

export default function RelatedTools({
  currentSlug,
  limit = 3,
  title = "You may also be interested in:",
  className,
}: RelatedToolsProps) {
  const [related, setRelated] = useState<Tool[]>([]);

  useEffect(() => {
    setRelated(getRelatedTools(currentSlug, limit));
  }, [currentSlug, limit]);

  const placeholders = Array.from({ length: limit }, (_, index) => index);

  return (
    <section
      className={cn("related-tools", className)}
      aria-labelledby="related-tools-heading"
      aria-busy={related.length === 0}
    >
      <div className="related-tools__intro">
        <h2 id="related-tools-heading" className="related-tools__title">
          {title}
        </h2>
      </div>

      <ul className="related-tools__list">
        {(related.length ? related : placeholders).map((item, index) => {
          if (typeof item === "number") {
            return (
              <li
                key={`pending-${item}`}
                className="related-tools__item related-tools__item--pending"
                style={{ "--rt-i": index } as CSSProperties}
              >
                <div className="related-tools__link related-tools__link--pending">
                  <span className="related-tools__top">
                    <span className="related-tools__icon" aria-hidden="true" />
                    <span className="related-tools__category"> </span>
                  </span>
                  <span className="related-tools__name"> </span>
                  <span className="related-tools__desc"> </span>
                </div>
              </li>
            );
          }

          const tool = item;
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
