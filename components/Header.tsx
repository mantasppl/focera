"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";
import CategoryIcon from "@/components/CategoryIcon";
import ShareMenu from "@/components/ShareMenu";
import ToolSearch from "@/components/ToolSearch";
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  getToolsByCategory,
  type Tool,
  type ToolCategory,
} from "@/data/tools";
import { SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

type HeaderProps = {
  className?: string;
};

type Overlay = "category" | "search" | "menu" | null;

type CategoryMenu = {
  id: ToolCategory;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  tools: Tool[];
};

function buildCatalog(): CategoryMenu[] {
  return categoryOrder.map((id) => {
    const label = categoryLabels[id];
    const tools = getToolsByCategory(id)
      .slice()
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
        return a.shortName.localeCompare(b.shortName);
      });

    return {
      id,
      label,
      shortLabel: label.replace(/ Tools$/, ""),
      description: categoryDescriptions[id],
      href: `/tools/${id}`,
      tools,
    };
  });
}

export default function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const megaId = useId();
  const menuId = useId();
  const searchId = useId();
  const catalog = useMemo(buildCatalog, []);

  const [scrolled, setScrolled] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [openCategory, setOpenCategory] = useState<ToolCategory | null>(null);

  const overlayOpen = overlay !== null;
  const activeCategory = catalog.find((item) => item.id === openCategory);
  const currentCategory = catalog.find((item) => pathname === item.href);

  function closeAll() {
    setOverlay(null);
    setOpenCategory(null);
  }

  function toggleCategory(id: ToolCategory) {
    if (overlay === "category" && openCategory === id) {
      closeAll();
      return;
    }
    setOpenCategory(id);
    setOverlay("category");
  }

  function toggleSearch() {
    if (overlay === "search") {
      closeAll();
      return;
    }
    setOpenCategory(null);
    setOverlay("search");
  }

  function toggleMenu() {
    if (overlay === "menu") {
      closeAll();
      return;
    }
    setOpenCategory(null);
    setOverlay("menu");
  }

  useEffect(() => {
    closeAll();
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!overlayOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeAll();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [overlayOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 960px)");
    function onChange() {
      if (media.matches) {
        setOverlay((current) =>
          current === "search" || current === "menu" ? null : current,
        );
      } else {
        setOverlay((current) => (current === "category" ? null : current));
        setOpenCategory(null);
      }
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={cn(
        "site-header",
        scrolled && "is-scrolled",
        overlayOpen && "is-open",
        className,
      )}
    >
      {overlayOpen ? (
        <button
          type="button"
          className="site-header__backdrop"
          aria-label="Close menu"
          onClick={closeAll}
        />
      ) : null}

      <div className="site-header__bar">
        <div className="site-header__inner">
          <Link
            href="/"
            className="site-logo"
            aria-label={`${SITE_NAME} home`}
            onClick={closeAll}
          >
            <BrandMark className="site-logo__mark" />
            <span className="site-logo__name">{SITE_NAME}</span>
          </Link>

          <nav className="site-cats" aria-label="Tool categories">
            {catalog.map((item) => {
              const expanded = overlay === "category" && openCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "site-cat",
                    currentCategory?.id === item.id && "is-current",
                    expanded && "is-open",
                  )}
                  aria-expanded={expanded}
                  aria-controls={megaId}
                  onClick={() => toggleCategory(item.id)}
                >
                  <span className="site-cat__label">
                    {item.shortLabel}
                    <span className="site-cat__suffix"> Tools</span>
                  </span>
                  <ChevronIcon className="site-cat__chevron" />
                </button>
              );
            })}
          </nav>

          <div className="site-header__actions">
            <ShareMenu variant="icon" />
            <div
              className="site-header__search"
              onFocusCapture={() => {
                if (overlay === "category") closeAll();
              }}
            >
              <ToolSearch
                liveSuggestions
                placeholder="Search tools"
                className="tool-search--header"
              />
            </div>
            <button
              type="button"
              className="site-icon-btn site-header__search-btn"
              aria-label={overlay === "search" ? "Close search" : "Search tools"}
              aria-expanded={overlay === "search"}
              aria-controls={searchId}
              onClick={toggleSearch}
            >
              {overlay === "search" ? <CloseIcon /> : <SearchIcon />}
            </button>
            <button
              type="button"
              className="site-icon-btn site-header__menu-btn"
              aria-label={overlay === "menu" ? "Close menu" : "Open menu"}
              aria-expanded={overlay === "menu"}
              aria-controls={menuId}
              onClick={toggleMenu}
            >
              {overlay === "menu" ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {overlay === "category" && activeCategory ? (
        <div
          id={megaId}
          className="site-mega"
          role="region"
          aria-label={`${activeCategory.label} tools`}
        >
          <CategoryPanel item={activeCategory} />
        </div>
      ) : null}

      {overlay === "search" ? (
        <div
          id={searchId}
          className="site-sheet site-sheet--search"
          role="dialog"
          aria-modal="true"
          aria-label="Search tools"
        >
          <ToolSearch
            liveSuggestions
            autoFocus
            placeholder="Search tools"
            className="tool-search--sheet"
          />
        </div>
      ) : null}

      {overlay === "menu" ? (
        <div
          id={menuId}
          className="site-sheet site-sheet--menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <ToolSearch
            liveSuggestions
            placeholder="Search tools"
            className="tool-search--sheet"
          />

          <ShareMenu
            variant="labeled"
            align="start"
            className="share-menu--sheet"
          />

          <nav className="site-sheet__cats" aria-label="Tool categories">
            {catalog.map((item) => {
              const expanded = openCategory === item.id;
              const panelId = `${menuId}-${item.id}`;
              return (
                <div
                  key={item.id}
                  className={cn("site-sheet__cat", expanded && "is-open")}
                >
                  <button
                    type="button"
                    className="site-sheet__cat-btn"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenCategory((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                  >
                    <span className="site-sheet__cat-icon" aria-hidden="true">
                      <CategoryIcon
                        category={item.id}
                        className="site-sheet__cat-svg"
                      />
                    </span>
                    <span className="site-sheet__cat-copy">
                      <span className="site-sheet__cat-label">{item.label}</span>
                      <span className="site-sheet__cat-count">
                        {item.tools.length}{" "}
                        {item.tools.length === 1 ? "tool" : "tools"}
                      </span>
                    </span>
                    <ChevronIcon className="site-sheet__chevron" />
                  </button>
                  {expanded ? (
                    <div id={panelId} className="site-sheet__tools">
                      {item.tools.map((tool) => (
                        <ToolLink key={tool.slug} tool={tool} />
                      ))}
                      <Link href={item.href} className="site-sheet__all">
                        View all {item.label.toLowerCase()}
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="site-sheet__links">
            <Link href="/tools">All tools</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function CategoryPanel({ item }: { item: CategoryMenu }) {
  return (
    <div className="site-mega__inner">
      <div className="site-mega__head">
        <div className="site-mega__intro">
          <span className="site-mega__icon" aria-hidden="true">
            <CategoryIcon category={item.id} className="site-mega__svg" />
          </span>
          <div>
            <p className="site-mega__title">{item.label}</p>
            <p className="site-mega__desc">{item.description}</p>
          </div>
        </div>
        <Link href={item.href} className="site-mega__browse">
          View all {item.tools.length}{" "}
          {item.tools.length === 1 ? "tool" : "tools"}
          <ArrowIcon />
        </Link>
      </div>
      <div className="site-mega__grid">
        {item.tools.map((tool) => (
          <ToolLink key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}

function ToolLink({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className={cn("site-tool-link", tool.status === "soon" && "is-soon")}
    >
      <span className="site-tool-link__name">{tool.shortName}</span>
      {tool.status === "soon" ? (
        <span className="site-tool-link__badge">Soon</span>
      ) : null}
    </Link>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.4 4.4 6 8l3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.2 16.2 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 7h15M4.5 12h15M4.5 17h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
