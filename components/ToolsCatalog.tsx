"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import ToolSearch from "@/components/ToolSearch";
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  getToolsByCategory,
  type ToolCategory,
} from "@/data/tools";
import { searchTools } from "@/lib/search-tools";

type ToolsCatalogProps = {
  /** When set, show only this category’s tools (and search within it). */
  category?: ToolCategory;
};

function CategoryToolGrid({ category }: { category: ToolCategory }) {
  const items = getToolsByCategory(category);
  if (!items.length) {
    return (
      <p className="category-empty">
        No tools in this category yet — coming soon.
      </p>
    );
  }
  return (
    <div className="tool-card-grid">
      {items.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}

function ToolsCatalogInner({ category }: ToolsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const syncUrl = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query.trim() === urlQuery.trim()) return;
      syncUrl(query);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, syncUrl, urlQuery]);

  const trimmed = query.trim();
  const hits = trimmed
    ? searchTools(trimmed).filter(({ tool }) =>
        category ? tool.categories.includes(category) : true,
      )
    : [];

  return (
    <>
      <div className="page-section tool-search-section">
        <ToolSearch
          value={query}
          onChange={setQuery}
          onSubmitQuery={(q) => {
            setQuery(q);
            syncUrl(q);
          }}
          autoFocus={Boolean(urlQuery)}
          placeholder={
            category
              ? `Search ${categoryLabels[category].toLowerCase()}`
              : "Search"
          }
        />
        {trimmed ? (
          <p className="tool-search-status" role="status" aria-live="polite">
            {hits.length === 0
              ? `No tools match “${trimmed}”.`
              : `${hits.length} tool${hits.length === 1 ? "" : "s"} matching “${trimmed}”.`}
          </p>
        ) : null}
      </div>

      {trimmed ? (
        <section
          className="page-section"
          aria-labelledby="search-results-heading"
        >
          <h2 id="search-results-heading" className="section-heading">
            Search results
          </h2>
          {hits.length ? (
            <div className="tool-card-grid">
              {hits.map(({ tool }) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="category-empty">
              Try a shorter word
              {category
                ? " or a keyword from this category."
                : ', a category (pdf, image, ai), or a keyword like “watermark” or “invoice”.'}
            </p>
          )}
        </section>
      ) : category ? (
        <section
          className="page-section"
          aria-label={categoryLabels[category]}
        >
          <CategoryToolGrid category={category} />
        </section>
      ) : (
        categoryOrder.map((cat) => (
          <section
            key={cat}
            className="page-section"
            aria-labelledby={`cat-${cat}-heading`}
            id={`cat-${cat}`}
          >
            <h2 id={`cat-${cat}-heading`} className="section-heading">
              {categoryLabels[cat]}
            </h2>
            <p className="section-lede">{categoryDescriptions[cat]}</p>
            <CategoryToolGrid category={cat} />
          </section>
        ))
      )}
    </>
  );
}

export default function ToolsCatalog({ category }: ToolsCatalogProps) {
  return (
    <Suspense
      fallback={
        <div className="page-section tool-search-section">
          <div className="tool-search tool-search--skeleton" aria-hidden="true">
            <div className="tool-search__field" />
          </div>
        </div>
      }
    >
      <ToolsCatalogInner category={category} />
    </Suspense>
  );
}
