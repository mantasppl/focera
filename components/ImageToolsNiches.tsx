"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import ImageNicheIcon from "@/components/ImageNicheIcon";
import ToolChip from "@/components/ToolChip";
import {
  groupImageTools,
  imageNicheOrder,
  imageNicheSectionId,
  type ImageNicheId,
  type ImageNicheMeta,
} from "@/data/image-niches";
import type { Tool } from "@/data/tools";
import { cn } from "@/lib/utils";

type ImageToolsNichesProps = {
  tools: Tool[];
  /** Sticky jump nav on the dedicated image category page. */
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
  groups,
  activeId,
  sticky,
  onJump,
}: {
  groups: { niche: ImageNicheMeta; tools: Tool[] }[];
  activeId: ImageNicheId;
  sticky: boolean;
  onJump: (id: ImageNicheId) => void;
}) {
  return (
    <nav
      className={cn("image-niche-nav", sticky && "image-niche-nav--sticky")}
      aria-label="Jump to image tool groups"
    >
      <div className="image-niche-nav__track">
        {groups.map(({ niche, tools }) => {
          const selected = activeId === niche.id;
          return (
            <a
              key={niche.id}
              href={`#${imageNicheSectionId(niche.id)}`}
              className={cn(
                "image-niche-nav__btn",
                `image-niche-nav__btn--${niche.id}`,
                selected && "is-active",
              )}
              aria-current={selected ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onJump(niche.id);
              }}
            >
              <span className="image-niche-nav__icon" aria-hidden="true">
                <ImageNicheIcon niche={niche.id} />
              </span>
              <span className="image-niche-nav__copy">
                <span className="image-niche-nav__name image-niche-nav__name--full">
                  {niche.name}
                </span>
                <span className="image-niche-nav__name image-niche-nav__name--short">
                  {niche.shortName}
                </span>
                <span className="image-niche-nav__count">
                  {tools.length}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default function ImageToolsNiches({
  tools,
  stickyNav = false,
  headingLevel = "h2",
}: ImageToolsNichesProps) {
  const groups = groupImageTools(tools);
  const [activeId, setActiveId] = useState<ImageNicheId>(imageNicheOrder[0]);

  const jumpTo = useCallback((id: ImageNicheId) => {
    const section = document.getElementById(imageNicheSectionId(id));
    if (!section) return;
    setActiveId(id);
    const url = `${window.location.pathname}${window.location.search}#${imageNicheSectionId(id)}`;
    window.history.replaceState(null, "", url);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const match = imageNicheOrder.find(
      (id) => imageNicheSectionId(id) === hash,
    );
    if (!match) return;
    setActiveId(match);
    const section = document.getElementById(imageNicheSectionId(match));
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    const nodes = imageNicheOrder
      .map((id) => document.getElementById(imageNicheSectionId(id)))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const next = imageNicheOrder.find(
          (id) => imageNicheSectionId(id) === visible.target.id,
        );
        if (next) setActiveId(next);
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.4, 0.6],
      },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "image-tools-niches",
        stickyNav && "image-tools-niches--sticky-nav",
      )}
    >
      <NicheNav
        groups={groups}
        activeId={activeId}
        sticky={stickyNav}
        onJump={jumpTo}
      />

      <div className="image-niche-stack">
        {groups.map(({ niche, tools: nicheTools }) => {
          const sectionId = imageNicheSectionId(niche.id);
          const titleId = `${sectionId}-heading`;
          return (
            <section
              key={niche.id}
              id={sectionId}
              className={cn("image-niche", `image-niche--${niche.id}`)}
              aria-labelledby={titleId}
            >
              <header className="image-niche__header">
                <span className="image-niche__icon" aria-hidden="true">
                  <ImageNicheIcon niche={niche.id} />
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
