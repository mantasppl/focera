import type { Metadata } from "next";
import Link from "next/link";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import ToolCard from "@/components/ToolCard";
import { getReadyTools, tools } from "@/data/tools";
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
      "Focera – Free Online Tools & AI Utilities. Open a generator, converter, calculator, or developer tool and get to work — no sign-up, privacy-first.",
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
      "Generators, converters, marketing helpers, finance utilities, image tools, security tools, and developer utilities — all in one hub.",
  },
  {
    question: "Does Focera work on mobile?",
    answer:
      "Yes. Pages are mobile-first and responsive so you can use tools on phones, tablets, and desktops.",
  },
];

export default function HomePage() {
  const featured = getReadyTools();
  const upcoming = tools.filter((tool) => tool.status === "soon").slice(0, 3);

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
            Generators, calculators, and converters that run in your browser.
            No sign-up. No upload spam. Just open a tool and get to work.
          </p>
          <div className="page-hero__actions">
            <Link href="/tools" className="ui-btn ui-btn--primary">
              Browse all tools
            </Link>
            <Link href="/#ready-tools" className="ui-btn ui-btn--ghost">
              See what&apos;s ready
            </Link>
          </div>
        </section>

        <section
          className="page-section"
          aria-labelledby="ready-tools-heading"
          id="ready-tools"
        >
          <h2 id="ready-tools-heading" className="section-heading">
            Ready to use
          </h2>
          <div className="tool-card-grid">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {upcoming.length ? (
          <section
            className="page-section"
            aria-labelledby="coming-soon"
          >
            <h2 id="coming-soon" className="section-heading">
              Coming soon
            </h2>
            <div className="tool-card-grid">
              {upcoming.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="page-section">
          <FAQ items={homeFaq} title={`About ${SITE_NAME}`} />
        </div>
        <div className="page-section">
          <CTA
            title="See the full catalog"
            description="Browse every Focera utility — ready tools and upcoming releases in one place."
            label="Browse all tools"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
