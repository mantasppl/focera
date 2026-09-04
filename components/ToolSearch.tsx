"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Tool } from "@/data/tools";
import { formatToolCategories } from "@/data/tools";
import { trackSiteSearch } from "@/lib/analytics/client";
import { searchTools } from "@/lib/search-tools";
import { cn } from "@/lib/utils";

type ToolSearchProps = {
  /** Controlled value; omit for fully internal state. */
  value?: string;
  onChange?: (value: string) => void;
  /**
   * When true, show live result suggestions under the field.
   * Homepage uses this; the tools catalog filters the page instead.
   */
  liveSuggestions?: boolean;
  resultsLimit?: number;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  /** Called when user submits (search icon / Enter) with current query. */
  onSubmitQuery?: (query: string) => void;
};

export default function ToolSearch({
  value,
  onChange,
  liveSuggestions = false,
  resultsLimit = 8,
  placeholder = "Search",
  className,
  autoFocus = false,
  onSubmitQuery,
}: ToolSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const query = value ?? internal;
  const deferredQuery = useDeferredValue(query.trim());

  const hits =
    liveSuggestions && deferredQuery
      ? searchTools(deferredQuery, { limit: resultsLimit })
      : [];

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery]);

  useEffect(() => {
    if (!liveSuggestions) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [liveSuggestions]);

  function setQuery(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    if (liveSuggestions) setOpen(true);
  }

  function goToResultsPage(q: string) {
    setOpen(false);
    trackSiteSearch(q);
    if (onSubmitQuery) {
      onSubmitQuery(q);
      return;
    }
    router.push(`/tools?q=${encodeURIComponent(q)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    goToResultsPage(q);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "tool-search",
        liveSuggestions && "tool-search--live",
        className,
      )}
    >
      <form className="tool-search__form" onSubmit={handleSubmit} role="search">
        <label className="tool-search__label" htmlFor={inputId}>
          Search tools
        </label>
        <div className="tool-search__field">
          <input
            id={inputId}
            type="search"
            className="tool-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => liveSuggestions && setOpen(true)}
            onKeyDown={(event) => {
              if (!liveSuggestions || !open || hits.length === 0) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((i) => (i + 1) % hits.length);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((i) => (i - 1 + hits.length) % hits.length);
              } else if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus={autoFocus}
            aria-autocomplete={liveSuggestions ? "list" : undefined}
            aria-controls={liveSuggestions ? listId : undefined}
            aria-expanded={
              liveSuggestions ? open && deferredQuery.length > 0 : undefined
            }
            aria-activedescendant={
              liveSuggestions && open && hits[activeIndex]
                ? `${listId}-${hits[activeIndex].tool.slug}`
                : undefined
            }
          />
          {query ? (
            <button
              type="button"
              className="tool-search__clear"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : null}
          <button
            type="submit"
            className="tool-search__icon-btn"
            aria-label="Open all search results"
            title="Open all search results"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path
                d="M16.2 16.2 20 20"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </form>

      {liveSuggestions && open && deferredQuery ? (
        <div
          className="tool-search__panel"
          id={listId}
          role="listbox"
          aria-label="Matching tools"
        >
          {hits.length === 0 ? (
            <p className="tool-search__empty">
              No tools match “{deferredQuery}”.
            </p>
          ) : (
            <ul className="tool-search__list">
              {hits.map((hit, index) => (
                <li key={hit.tool.slug} role="presentation">
                  <SearchResultLink
                    tool={hit.tool}
                    query={deferredQuery}
                    id={`${listId}-${hit.tool.slug}`}
                    active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="tool-search__all"
            onClick={() => goToResultsPage(deferredQuery)}
          >
            See all results
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SearchResultLink({
  tool,
  query,
  id,
  active,
  onMouseEnter,
}: {
  tool: Tool;
  query: string;
  id: string;
  active: boolean;
  onMouseEnter: () => void;
}) {
  return (
    <Link
      id={id}
      href={tool.href}
      role="option"
      aria-selected={active}
      className={cn("tool-search__hit", active && "is-active")}
      onMouseEnter={onMouseEnter}
      onClick={() => trackSiteSearch(query)}
    >
      <span className="tool-search__hit-meta">
        <span className="tool-search__hit-cat">
          {formatToolCategories(tool)}
        </span>
        {tool.status === "soon" ? (
          <span className="tool-search__hit-badge">Soon</span>
        ) : null}
      </span>
      <span className="tool-search__hit-title">{tool.name}</span>
      <span className="tool-search__hit-desc">{tool.description}</span>
    </Link>
  );
}
