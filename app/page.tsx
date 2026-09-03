import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import CategoryIcon from "@/components/CategoryIcon";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import ToolCard from "@/components/ToolCard";
import ToolInquiry from "@/components/ToolInquiry";
import ToolSearch from "@/components/ToolSearch";
import {
  categoryDescriptions,
  categoryLabels,
  categoryOrder,
  getToolsByCategory,
  getTopTools,
} from "@/data/tools";
import {
  DEFAULT_OG_IMAGE,
  faqPageSchema,
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: SITE_TAGLINE },
  openGraph: {
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_TAGLINE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
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
  {
    question: "What if I cannot find a tool?",
    answer:
      "Request it from the homepage. We build requested tools for free and publish them within 24 hours, then email you when they go live.",
  },
];

export default function HomePage() {
  const topTools = getTopTools(8);

  return (
    <div className="page-shell">
      <JsonLd data={faqPageSchema(homeFaq)} />
      <Header />
      <main className="page-main">
        <section className="page-hero page-hero--home">
          <div className="home-hero">
            <div className="home-hero__atmosphere" aria-hidden="true">
              <span className="home-hero__orb home-hero__orb--teal" />
              <span className="home-hero__orb home-hero__orb--warm" />
              <span className="home-hero__ring" />
              <span className="home-hero__grid" />
            </div>

            <p className="home-hero__kicker">
              <BrandMark className="home-hero__mark" />
              <span className="home-hero__kicker-name">{SITE_NAME}</span>
              <span className="home-hero__kicker-dot" aria-hidden="true" />
              <span>in-browser toolkit</span>
            </p>

            <h1 className="page-hero__title">
              Free online tools{" "}
              <span className="home-hero__title-line">in your browser</span>
            </h1>
            <p className="page-hero__lede">
              Free. Private. No sign-up.
            </p>

            <div className="page-hero__search home-hero__search">
              <ToolSearch
                liveSuggestions
                placeholder="Search tools…"
              />
            </div>

            <nav className="home-hero__cats" aria-label="Tool categories">
              {categoryOrder.map((category) => (
                <Link
                  key={category}
                  href={`/tools/${category}`}
                  className={`home-hero__cat home-hero__cat--${category}`}
                >
                  <span className="home-hero__cat-icon" aria-hidden="true">
                    <CategoryIcon
                      category={category}
                      className="home-hero__cat-svg"
                    />
                  </span>
                  {categoryLabels[category].replace(/ Tools$/, "")}
                </Link>
              ))}
            </nav>
          </div>

          <div className="home-hero__mosaic" aria-hidden="true">
            {categoryOrder.map((category) => (
              <div
                key={category}
                className={`home-hero__tile home-hero__tile--${category}`}
              >
                <span className="home-hero__tile-icon">
                  <CategoryIcon
                    category={category}
                    className="home-hero__tile-svg"
                  />
                </span>
                <span className="home-hero__tile-label">
                  {categoryLabels[category].replace(/ Tools$/, "")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <ToolInquiry />

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
                  href={`/tools/${category}`}
                  className={[
                    "category-card",
                    `category-card--${category}`,
                    empty ? "category-card--soon" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="category-card__top">
                    <span className="category-card__icon" aria-hidden="true">
                      <CategoryIcon category={category} />
                    </span>
                    <span className="category-card__count">
                      {count} {count === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                  <div className="category-card__body">
                    <span className="category-card__label">
                      {categoryLabels[category]}
                    </span>
                    <p className="category-card__desc">
                      {categoryDescriptions[category]}
                    </p>
                  </div>
                  <span className="category-card__cta">
                    Explore
                    <svg
                      className="category-card__cta-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
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
