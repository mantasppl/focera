"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import NicheIcon from "@/components/NicheIcon";
import ToolChip from "@/components/ToolChip";
import {
  categoryNicheSectionId,
  getCategoryNiches,
  groupCategoryTools,
  type CategoryNicheDef,
} from "@/data/category-niches";
import type { Tool, ToolCategory } from "@/data/tools";
import { cn } from "@/lib/utils";

type CategoryNichesProps = {
  category: ToolCategory;
  tools: Tool[];
  stickyNav?: boolean;
  headingLevel?: "h2" | "h3";
};

function ToolChipGrid({ tools }: { tools: Tool[] }) {
  if (!tools.length) {
    return (
      <p className="category-empty">
        No tools in this group yet — coming soon.
      </p>
    );
  }

  return (
    <div className="tool-chip-grid">
      {tools.map((tool) => (
        <ToolChip key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}

function NicheHeading({
  level,
  id,
  children,
}: {
  level: "h2" | "h3";
  id: string;
  children: ReactNode;
}) {
  if (level === "h3") {
    return (
      <h3 id={id} className="image-niche__title">
        {children}
      </h3>
    );
  }
  return (
    <h2 id={id} className="image-niche__title">
      {children}
    </h2>
  );
}

function NicheNav({
  category,
  groups,
  activeId,
  sticky,
  onJump,
}: {
  category: ToolCategory;
  groups: { niche: CategoryNicheDef; tools: Tool[] }[];
  activeId: string;
  sticky: boolean;
  onJump: (id: string) => void;
}) {
  return (
    <nav
      className={cn("image-niche-nav", sticky && "image-niche-nav--sticky")}
      aria-label="Jump to tool groups"
    >
      <div className="image-niche-nav__track">
        {groups.map(({ niche, tools }) => {
          const selected = activeId === niche.id;
          return (
            <a
              key={niche.id}
              href={`#${categoryNicheSectionId(category, niche.id)}`}
              className={cn(
                "image-niche-nav__btn",
                `image-niche-nav__btn--${niche.tone}`,
                selected && "is-active",
              )}
              aria-current={selected ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onJump(niche.id);
              }}
            >
              <span className="image-niche-nav__icon" aria-hidden="true">
                <NicheIcon kind={niche.icon} />
              </span>
              <span className="image-niche-nav__copy">
                <span className="image-niche-nav__name image-niche-nav__name--full">
                  {niche.name}
                </span>
                <span className="image-niche-nav__name image-niche-nav__name--short">
                  {niche.shortName}
                </span>
                <span className="image-niche-nav__count">{tools.length}</span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function CategoryNiches({
  category,
  tools,
  stickyNav = false,
  headingLevel = "h2",
}: CategoryNichesProps) {
  const niches = getCategoryNiches(category);
  const groups = groupCategoryTools(category, tools);
  const [activeId, setActiveId] = useState(niches[0]?.id ?? "");

  const jumpTo = useCallback(
    (id: string) => {
      const section = document.getElementById(
        categoryNicheSectionId(category, id),
      );
      if (!section) return;
      setActiveId(id);
      const url = `${window.location.pathname}${window.location.search}#${categoryNicheSectionId(category, id)}`;
      window.history.replaceState(null, "", url);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      section.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [category],
  );

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const match = niches.find(
      (niche) => categoryNicheSectionId(category, niche.id) === hash,
    );
    if (!match) return;
    setActiveId(match.id);
    const section = document.getElementById(
      categoryNicheSectionId(category, match.id),
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [category, niches]);

  useEffect(() => {
    const nodes = niches
      .map((niche) =>
        document.getElementById(categoryNicheSectionId(category, niche.id)),
      )
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const next = niches.find(
          (niche) =>
            categoryNicheSectionId(category, niche.id) === visible.target.id,
        );
        if (next) setActiveId(next.id);
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.4, 0.6],
      },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [category, niches]);

  return (
    <div
      className={cn(
        "image-tools-niches",
        stickyNav && "image-tools-niches--sticky-nav",
      )}
    >
      <NicheNav
        category={category}
        groups={groups}
        activeId={activeId}
        sticky={stickyNav}
        onJump={jumpTo}
      />

      <div className="image-niche-stack">
        {groups.map(({ niche, tools: nicheTools }) => {
          const sectionId = categoryNicheSectionId(category, niche.id);
          const titleId = `${sectionId}-heading`;
          return (
            <section
              key={niche.id}
              id={sectionId}
              className={cn("image-niche", `image-niche--${niche.tone}`)}
              aria-labelledby={titleId}
            >
              <header className="image-niche__header">
                <span className="image-niche__icon" aria-hidden="true">
                  <NicheIcon kind={niche.icon} />
                </span>
                <div className="image-niche__intro">
                  <div className="image-niche__title-row">
                    <NicheHeading level={headingLevel} id={titleId}>
                      {niche.name}
                    </NicheHeading>
                    <span className="image-niche__count">
                      {nicheTools.length}{" "}
                      {nicheTools.length === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                  <p className="image-niche__lede">{niche.description}</p>
                </div>
              </header>
              <ToolChipGrid tools={nicheTools} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
