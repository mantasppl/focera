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
} from "@/data/tools";
import { searchTools } from "@/lib/search-tools";

function ToolsCatalogInner() {
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
  const hits = trimmed ? searchTools(trimmed) : [];

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
          placeholder="Search"
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
              Try a shorter word, a category (pdf, image, ai), or a keyword like
              “watermark” or “invoice”.
            </p>
          )}
        </section>
      ) : (
        categoryOrder.map((category) => {
          const items = getToolsByCategory(category);
          return (
            <section
              key={category}
              className="page-section"
              aria-labelledby={`cat-${category}-heading`}
              id={`cat-${category}`}
            >
              <h2 id={`cat-${category}-heading`} className="section-heading">
                {categoryLabels[category]}
              </h2>
              <p className="section-lede">{categoryDescriptions[category]}</p>
              {items.length ? (
                <div className="tool-card-grid">
                  {items.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              ) : (
                <p className="category-empty">
                  No tools in this category yet — coming soon.
                </p>
              )}
            </section>
          );
        })
      )}
    </>
  );
}

export default function ToolsCatalog() {
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
      <ToolsCatalogInner />
    </Suspense>
  );
}
