import type { Metadata } from "next";
import Link from "next/link";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import ToolCard from "@/components/ToolCard";
import ToolSearch from "@/components/ToolSearch";
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  getToolsByCategory,
  getTopTools,
} from "@/data/tools";
import {
  faqPageSchema,
  pageMetadata,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE_TAGLINE,
    description:
      "Focera – Free Online Tools & AI Utilities. PDF, image, video, AI, and file tools that run in your browser — no sign-up, privacy-first.",
    path: "/",
  }),
  title: { absolute: SITE_TAGLINE },
};

const homeFaq = [
  {
    question: "Are Focera tools really free?",
    answer:
      "Yes. Focera utilities run in your browser with no account required and no paywall on ready tools.",
  },
  {
    question: "Do you upload my files or data?",
    answer:
      "Ready tools process content locally on your device whenever possible. New tools follow the same privacy-first approach.",
  },
  {
    question: "What kinds of tools does Focera offer?",
    answer:
      "PDF Tools, Image Tools, Video Tools, AI Tools, and File Tools — search by name or shorthand, browse by category, or jump into a top tool from the homepage.",
  },
  {
    question: "Does Focera work on mobile?",
    answer:
      "Yes. Pages are mobile-first and responsive so you can use tools on phones, tablets, and desktops.",
  },
];

export default function HomePage() {
  const topTools = getTopTools(8);

  return (
    <div className="page-shell">
      <JsonLd data={faqPageSchema(homeFaq)} />
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">
            Free online tools &amp; AI utilities
          </h1>
          <p className="page-hero__lede">
            PDF, image, AI, and file tools that run in your browser. No
            sign-up. No upload spam. Search a feature or open a top tool.
          </p>
          <div className="page-hero__search">
            <ToolSearch liveSuggestions />
          </div>
          <div className="page-hero__actions">
            <Link href="/#categories" className="ui-btn ui-btn--primary">
              Browse categories
            </Link>
            <Link href="/#top-tools" className="ui-btn ui-btn--ghost">
              See top tools
            </Link>
          </div>
        </section>

        <section
          className="page-section"
          aria-labelledby="categories-heading"
          id="categories"
        >
          <div className="section-heading-row">
            <h2 id="categories-heading" className="section-heading">
              Categories
            </h2>
            <Link href="/tools" className="section-heading-link">
              View all tools
            </Link>
          </div>
          <p className="section-lede">
            Find what you need fast — every tool sits in one or more of these
            groups.
          </p>
          <div className="category-card-grid">
            {categoryOrder.map((category) => {
              const count = getToolsByCategory(category).length;
              const empty = count === 0;

              return (
                <Link
                  key={category}
                  href={`/tools#cat-${category}`}
                  className={
                    empty ? "category-card category-card--soon" : "category-card"
                  }
                >
                  <div className="category-card__meta">
                    <span className="category-card__label">
                      {categoryLabels[category]}
                    </span>
                    <span className="category-card__count">{count}</span>
                  </div>
                  <p className="category-card__desc">
                    {categoryDescriptions[category]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          className="page-section"
          aria-labelledby="top-tools-heading"
          id="top-tools"
        >
          <div className="section-heading-row">
            <h2 id="top-tools-heading" className="section-heading">
              Top tools
            </h2>
            <Link href="/tools" className="section-heading-link">
              Browse full catalog
            </Link>
          </div>
          <p className="section-lede">
            Popular picks across PDF, image, AI, and file workflows.
          </p>
          <div className="tool-card-grid">
            {topTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        <div className="page-section">
          <FAQ items={homeFaq} title={`About ${SITE_NAME}`} />
        </div>
        <div className="page-section">
          <CTA
            title="See every tool by category"
            description="Open the full catalog — PDF, image, video, AI, and file tools in one place."
            label="Browse all tools"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
